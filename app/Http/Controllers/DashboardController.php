<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Purchase;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Total counts
        $totalCustomers = Customer::count();
        $totalProducts = Product::count();
        $totalPurchases = Purchase::count();
        $totalSales = Sale::count();

        // Stock metrics
        $totalStock = Product::sum('stock');
        // sum qty from sale_items for non-deleted sales and non-deleted sale_items
        $soldStock = Sale::join('sale_items', 'sales.id', '=', 'sale_items.sale_id')
            ->whereNull('sales.deleted_at')
            ->whereNull('sale_items.deleted_at')
            ->sum('sale_items.qty');
        // currentStock = totalStock - soldStock (no negativo)
        $currentStock = max(0, $totalStock - $soldStock);

        // Financial metrics
        $totalSalesAmount = Sale::sum('total');

        // Sales this month
        $startOfMonth = now()->startOfMonth();
        $endOfMonth = now()->endOfMonth();
        $salesThisMonth = Sale::whereBetween('sale_date', [$startOfMonth, $endOfMonth])->sum('total');

        // Average sale value (ticket promedio)
        $avgSale = (float) Sale::avg('total') ?? 0.0;

        // Profit demo: gross = sales - purchases
        $totalPurchasesAmount = Purchase::sum('total');
        $grossProfit = $totalSalesAmount - $totalPurchasesAmount;
        $netProfit = $grossProfit; // placeholder

        // Count distinct supplier names from purchases (ignore null/empty)
        $totalSuppliers = Purchase::whereNotNull('supplier_name')
            ->where('supplier_name', '!=', '')
            ->distinct('supplier_name')
            ->count('supplier_name');

        $stats = [
            'totalCustomers' => $totalCustomers,
            'totalSuppliers' => $totalSuppliers,
            'totalProducts' => $totalProducts,
            'totalInvoices' => $totalPurchases,
            'totalStock' => $totalStock,
            'soldStock' => $soldStock,
            'currentStock' => $currentStock,
            'totalSales' => $totalSalesAmount,
            'salesThisMonth' => $salesThisMonth,
            'avgSale' => $avgSale,
            'grossProfit' => $grossProfit,
            'netProfit' => $netProfit,
        ];

        return Inertia::render('dashboard', [
            'stats' => $stats,
        ]);
    }
}
