<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Product;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SalesController extends Controller
{
    public function index()
    {
        // Eager-load items with product to ensure frontend has full sale details
        $sales = Sale::with(['customer', 'items.product'])->latest()->get();
        $customers = Customer::select('id', 'full_name')->get();
        $products = Product::select('id', 'name', 'unit_price', 'stock')->get();

        return Inertia::render('market/sales/Index', [
            'sales' => $sales,
            'customers' => $customers,
            'products' => $products,
        ]);
    }

    public function show(Sale $sale)
    {
        $sale->load('items.product', 'customer');
        return Inertia::render('market/sales/Show', [
            'sale' => $sale,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            $sale = Sale::create([
                'customer_id' => $validated['customer_id'] ?? null,
                'sale_date' => now(),
                'total' => 0,
            ]);

            $total = 0;

            foreach ($validated['items'] as $it) {
                $product = Product::findOrFail($it['product_id']);
                $qty = (int) $it['qty'];
                $unit = $it['unit_price'];
                $subtotal = $qty * $unit;

                // Decrement stock if available.
                // Use a DB-level update to make the decrement atomic and avoid type/coercion issues.
                if ($product->stock !== null) {
                    // For databases that support GREATEST (MySQL, Postgres), ensure stock never goes below 0.
                    // Fall back to a safe PHP update if DB::raw isn't desired for your platform.
                    Product::where('id', $product->id)
                        ->whereNotNull('stock')
                        ->update(['stock' => DB::raw('GREATEST(stock - ' . intval($qty) . ', 0)')]);
                    // Refresh product instance in case it's needed later in the loop
                    $product->refresh();
                }

                $sale->items()->create([
                    'product_id' => $product->id,
                    'qty' => $qty,
                    'unit_price' => $unit,
                    'subtotal' => $subtotal,
                ]);

                $total += $subtotal;
            }

            $sale->total = $total;
            $sale->save();
        });

        return redirect()->back()->with('success', 'Venta registrada correctamente.');
    }

    /**
     * Return an item from a sale (simple implementation: create negative sale item and restore stock)
     */
    public function returnItem(Request $request, Sale $sale)
    {
        $validated = $request->validate([
            'sale_item_id' => 'required|exists:sale_items,id',
            'qty' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($validated, $sale) {
            $item = SaleItem::findOrFail($validated['sale_item_id']);
            $product = Product::findOrFail($item->product_id);
            $qty = min($validated['qty'], abs($item->qty));

            // Increase product stock
            if ($product->stock !== null) {
                $product->stock += $qty;
                $product->save();
            }

            // create a negative sale item record to represent the return
            $sale->items()->create([
                'product_id' => $product->id,
                'qty' => -$qty,
                'unit_price' => $item->unit_price,
                'subtotal' => - ($qty * $item->unit_price),
            ]);

            // adjust sale total
            $sale->total = $sale->items()->sum('subtotal');
            $sale->save();
        });

        return redirect()->back()->with('success', 'Artículo devuelto correctamente.');
    }

    /**
     * Anular (soft-delete) a sale
     */
    public function destroy(Sale $sale)
    {
        $sale->delete();

        return redirect()->back()->with('success', 'Venta anulada correctamente.');
    }

    /**
     * Update an existing sale and adjust stock accordingly.
     */
    public function update(Request $request, Sale $sale)
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $sale) {
            // Build a map of previous quantities per product to compute deltas
            $previous = [];
            foreach ($sale->items as $it) {
                $previous[$it->product_id] = ($previous[$it->product_id] ?? 0) + $it->qty;
            }

            // We'll remove all existing items and recreate from the submitted ones.
            // During this process compute deltas per product (new - previous) to update stock.
            $newTotals = [];
            $stockDeltas = [];

            // Delete existing items first to avoid uniqueness or PK collisions
            $sale->items()->delete();

            $total = 0;
            foreach ($validated['items'] as $it) {
                $product = Product::findOrFail($it['product_id']);
                $qty = (int) $it['qty'];
                $unit = $it['unit_price'];
                $subtotal = $qty * $unit;

                $sale->items()->create([
                    'product_id' => $product->id,
                    'qty' => $qty,
                    'unit_price' => $unit,
                    'subtotal' => $subtotal,
                ]);

                $total += $subtotal;

                // compute stock delta: new qty - previous qty for this product
                $stockDeltas[$product->id] = ($stockDeltas[$product->id] ?? 0) + $qty;
            }

            // subtract previous quantities
            foreach ($previous as $pid => $qty) {
                $stockDeltas[$pid] = ($stockDeltas[$pid] ?? 0) - $qty;
            }

            // Apply stock deltas (positive delta => increase stock, negative => decrease)
            foreach ($stockDeltas as $pid => $delta) {
                if ($delta === 0) continue;
                $product = Product::find($pid);
                if (!$product) continue;
                if ($product->stock === null) continue;

                if ($delta > 0) {
                    // increase stock
                    Product::where('id', $product->id)
                        ->whereNotNull('stock')
                        ->update(['stock' => DB::raw('stock + ' . intval($delta))]);
                } else {
                    // decrease stock (delta negative)
                    $dec = intval(abs($delta));
                    Product::where('id', $product->id)
                        ->whereNotNull('stock')
                        ->update(['stock' => DB::raw('GREATEST(stock - ' . $dec . ', 0)')]);
                }
            }

            $sale->total = $total;
            $sale->customer_id = $validated['customer_id'] ?? null;
            $sale->save();
        });

        return redirect()->back()->with('success', 'Venta actualizada correctamente.');
    }
}
