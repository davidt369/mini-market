<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Product;
use App\Models\Purchase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportsController extends Controller
{
    public function index(Request $request)
    {
        // Página principal de reportes (Inertia)
        $start = now()->subDays(29)->toDateString();
        $end = now()->toDateString();
        // Ventas diarias últimos 30 días
        // Preload daily sales for last 30 days
        $salesPath = route('market.reports.sales', [], false);
        $salesReq = Request::create($salesPath, 'GET', [
            'granularity' => 'daily',
            'start' => $start,
            'end' => $end,
        ]);
        $salesJson = json_decode($this->salesReport($salesReq)->getContent(), true);
        // Stock crítico
        $criticalUrl = route('market.reports.critical_stock');
        $criticalReq = Request::create($criticalUrl, 'GET');
        $criticalJson = json_decode($this->criticalStock($criticalReq)->getContent(), true);
        // Productos por caducar
        $expiringReq = clone $request;
        $expiringReq->merge(['days' => 30]);
        $expiringJson = json_decode($this->expiringProducts($expiringReq)->getContent(), true);
        // Margen de ganancia
        $marginUrl = route('market.reports.margin');
        $marginReq = Request::create($marginUrl, 'GET');
        $marginJson = json_decode($this->marginReport($marginReq)->getContent(), true);
        // Compras por proveedor
        $purchasesUrl = route('market.reports.purchases_by_supplier');
        $purchasesReq = Request::create($purchasesUrl, 'GET');
        $purchasesJson = json_decode($this->purchasesBySupplier($purchasesReq)->getContent(), true);
        // Top productos
        $topUrl = route('market.reports.top_products', ['limit' => 10]);
        $topReq = Request::create($topUrl, 'GET');
        $topJson = json_decode($this->topProducts($topReq)->getContent(), true);

        return Inertia::render('market/reports/Index', [
            'reports' => [
                'sales' => $salesJson,
                'critical_stock' => $criticalJson,
                'expiring' => $expiringJson,
                'margin' => $marginJson,
                'purchases_by_supplier' => $purchasesJson,
                'top_products' => $topJson,
            ],
        ]);
    }

    // Devuelve series de ventas agregadas según granularidad: daily|weekly|monthly
    public function salesReport(Request $request)
    {
        $granularity = $request->query('granularity', 'daily');
        // date range parameters, default last 30 days
        $start = $request->query('start') ?: now()->subDays(29)->toDateString();
        $end = $request->query('end') ?: now()->toDateString();

        // Exclude soft-deleted sales
        $query = Sale::query()->whereNull('deleted_at');

        if ($start) {
            $query->where('sale_date', '>=', $start);
        }
        if ($end) {
            $query->where('sale_date', '<=', $end);
        }

        if ($granularity === 'weekly') {
            $rows = $query->select(DB::raw("YEAR(sale_date) as year"), DB::raw("WEEK(sale_date, 1) as week"), DB::raw('SUM(total) as total'))
                ->groupBy('year', 'week')
                ->orderBy('year')
                ->orderBy('week')
                ->get();
            // convert to arrays
            $labels = $rows->map(fn($r) => "{$r->year}-W{$r->week}")->toArray();
            $data = $rows->pluck('total')->map(fn($t) => (float)$t)->toArray();
        } elseif ($granularity === 'monthly') {
            $rows = $query->select(DB::raw("YEAR(sale_date) as year"), DB::raw("MONTH(sale_date) as month"), DB::raw('SUM(total) as total'))
                ->groupBy('year', 'month')
                ->orderBy('year')
                ->orderBy('month')
                ->get();
            // convert to arrays
            $labels = $rows->map(fn($r) => "{$r->year}-{$r->month}")->toArray();
            $data = $rows->pluck('total')->map(fn($t) => (float)$t)->toArray();
        } else {
            // daily: generate full date series between start and end, filling missing days with zero
            $rows = $query->select(DB::raw("DATE(sale_date) as date"), DB::raw('SUM(total) as total'))
                ->groupBy('date')
                ->orderBy('date')
                ->get();
            // map totals by date
            $dateMap = $rows->pluck('total', 'date')->toArray();
            // build period from start to end
            $startDate = new \DateTime($start);
            $endDate = (new \DateTime($end))->modify('+1 day');
            $interval = new \DateInterval('P1D');
            $period = new \DatePeriod($startDate, $interval, $endDate);
            $labels = [];
            $data = [];
            foreach ($period as $dt) {
                $dateStr = $dt->format('Y-m-d');
                $labels[] = $dateStr;
                $data[] = isset($dateMap[$dateStr]) ? (float) $dateMap[$dateStr] : 0;
            }
        }

        // calcular totales y promedio
        $total = array_sum($data);
        $average = count($data) ? ($total / count($data)) : 0;

        return response()->json([
            'labels' => $labels,
            'data' => $data,
            'total' => (float) $total,
            'average' => (float) $average,
        ]);
    }

    public function criticalStock(Request $request)
    {
        $threshold = $request->query('threshold');
        $products = Product::with('category')
            ->when($threshold, fn($q) => $q->where('stock', '<=', (int)$threshold))
            ->when(!$threshold, fn($q) => $q->whereColumn('stock', '<=', 'min_stock'))
            ->orderBy('stock')
            ->get();
        $mapped = $products->map(fn($p) => [
            'id' => $p->id,
            'name' => $p->name,
            'stock' => $p->stock,
            'min_stock' => $p->min_stock,
            'category' => $p->category?->name,
            'status' => $p->stock <= $p->min_stock ? 'CRITICAL' : ($p->stock <= ($p->min_stock * 1.2) ? 'LOW' : 'NORMAL'),
        ]);
        return response()->json($mapped);
    }

    public function expiringProducts(Request $request)
    {
        $days = (int) $request->query('days', 30);
        $today = now()->startOfDay();
        $limit = now()->addDays($days)->endOfDay();

        $products = Product::with('category')
            ->whereNotNull('expiry_date')
            ->whereBetween('expiry_date', [$today, $limit])
            ->orderBy('expiry_date')
            ->get();
        $mapped = $products->map(fn($p) => [
            'id' => $p->id,
            'name' => $p->name,
            'stock' => $p->stock,
            'expiry_date' => $p->expiry_date,
            'days_remaining' => now()->diffInDays($p->expiry_date),
            'category' => $p->category?->name,
        ]);
        return response()->json($mapped);
    }

    // Margen de ganancia: por producto y general
    public function marginReport(Request $request)
    {
        // Por simplicidad: margen por producto = (unit_price - unit_cost) * qty_sold
        $rows = SaleItem::join('products', 'sale_items.product_id', '=', 'products.id')
            ->whereNull('sale_items.deleted_at')
            ->select(
                'products.id',
                'products.name',
                DB::raw('SUM(sale_items.qty) as qty_sold'),
                DB::raw('AVG(products.unit_cost) as unit_cost'),
                DB::raw('AVG(products.unit_price) as unit_price'),
                DB::raw('SUM(sale_items.qty * (products.unit_price - products.unit_cost)) as gross_margin')
            )
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('qty_sold')
            ->get();

        // Totales generales
        $totalSales = Sale::sum('total');
        $totalPurchases = Purchase::sum('total');
        $grossProfit = $totalSales - $totalPurchases;

        $marginPct = $totalSales ? ($grossProfit / $totalSales) * 100 : 0;
        return response()->json([
            'by_product' => $rows,
            'totals' => [
                'total_sales' => $totalSales,
                'total_purchases' => $totalPurchases,
                'gross_profit' => $grossProfit,
                'margin_percentage' => $marginPct,
            ],
        ]);
    }

    public function purchasesBySupplier(Request $request)
    {
        $rows = Purchase::whereNotNull('supplier_name')
            ->where('supplier_name', '!=', '')
            ->select(
                'supplier_name',
                DB::raw('COUNT(*) as purchases_count'),
                DB::raw('SUM(total) as total'),
                DB::raw('MAX(purchase_date) as last_purchase')
            )
            ->groupBy('supplier_name')
            ->orderByDesc('total')
            ->get();
        $mapped = $rows->map(fn($r) => [
            'id' => $r->supplier_name,
            'supplier_name' => $r->supplier_name,
            'contact' => '',
            'purchases_count' => (int) $r->purchases_count,
            'total' => (float) $r->total,
            'last_purchase' => $r->last_purchase,
        ]);
        return response()->json($mapped);
    }

    public function topProducts(Request $request)
    {
        $limit = (int) $request->query('limit', 10);
        // Join products and categories to include category name
        $rows = SaleItem::join('products', 'sale_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->whereNull('sale_items.deleted_at')
            ->select(
                'products.id',
                'products.name',
                'categories.name as category',
                DB::raw('SUM(sale_items.qty) as qty_sold'),
                DB::raw('SUM(sale_items.subtotal) as revenue')
            )
            ->groupBy('products.id', 'products.name', 'categories.name')
            ->orderByDesc('qty_sold')
            ->limit($limit)
            ->get();
        // Add rank
        $mapped = $rows->values()->map(function ($r, $i) {
            return [
                'id' => $r->id,
                'name' => $r->name,
                'category' => $r->category,
                'qty_sold' => (int) $r->qty_sold,
                'revenue' => (float) $r->revenue,
                'rank' => $i + 1,
            ];
        });
        return response()->json($mapped);
    }

    // Export CSV generic helper for arrays of associative arrays
    protected function exportCsvResponse(array $rows, string $filename = 'export.csv')
    {
        $callback = function () use ($rows) {
            $out = fopen('php://output', 'w');
            if (count($rows) === 0) {
                fclose($out);
                return;
            }
            // headers
            fputcsv($out, array_keys($rows[0]));
            foreach ($rows as $row) {
                fputcsv($out, array_values($row));
            }
            fclose($out);
        };

        return response()->streamDownload($callback, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    public function exportSalesCsv(Request $request)
    {
        $report = json_decode($this->salesReport($request)->getContent(), true);
        $rows = [];
        foreach ($report['labels'] as $i => $label) {
            $rows[] = ['label' => $label, 'total' => $report['data'][$i]];
        }

        return $this->exportCsvResponse($rows, 'sales_report.csv');
    }

    public function exportTopProductsCsv(Request $request)
    {
        $rows = $this->topProducts($request)->getData(true);
        return $this->exportCsvResponse($rows, 'top_products.csv');
    }
}
