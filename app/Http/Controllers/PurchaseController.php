<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PurchaseController extends Controller
{
    public function index()
    {
        $purchases = Purchase::with('items.product')->latest()->get();
        $products = Product::select('id', 'name', 'unit_cost', 'stock')->get();

        return Inertia::render('market/purchases/Index', [
            'purchases' => $purchases,
            'products' => $products,
        ]);
    }

    public function show(Purchase $purchase)
    {
        $purchase->load('items.product');
        return Inertia::render('market/purchases/Show', ['purchase' => $purchase]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_name' => 'nullable|string|max:150',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.unit_cost' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            $purchase = Purchase::create([
                'supplier_name' => $validated['supplier_name'] ?? null,
                'purchase_date' => now(),
                'total' => 0,
            ]);

            $total = 0;

            foreach ($validated['items'] as $it) {
                $product = Product::findOrFail($it['product_id']);
                $qty = (int) $it['qty'];
                $unit = $it['unit_cost'];
                $subtotal = $qty * $unit;

                // Increase product stock if tracked
                if ($product->stock !== null) {
                    Product::where('id', $product->id)
                        ->whereNotNull('stock')
                        ->update(['stock' => DB::raw('stock + ' . intval($qty))]);
                    $product->refresh();
                }

                $purchase->items()->create([
                    'product_id' => $product->id,
                    'qty' => $qty,
                    'unit_cost' => $unit,
                    'subtotal' => $subtotal,
                ]);

                $total += $subtotal;
            }

            $purchase->total = $total;
            $purchase->save();
        });

        return redirect()->back()->with('success', 'Compra registrada correctamente.');
    }

    public function update(Request $request, Purchase $purchase)
    {
        $validated = $request->validate([
            'supplier_name' => 'nullable|string|max:150',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.unit_cost' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $purchase) {
            // Revert previous stock additions
            foreach ($purchase->items as $old) {
                $product = Product::find($old->product_id);
                if ($product && $product->stock !== null) {
                    // subtract old qty
                    Product::where('id', $product->id)
                        ->whereNotNull('stock')
                        ->update(['stock' => DB::raw('GREATEST(stock - ' . intval($old->qty) . ', 0)')]);
                }
            }

            // delete old items
            $purchase->items()->delete();

            // create new items and apply stock
            $total = 0;
            foreach ($validated['items'] as $it) {
                $product = Product::findOrFail($it['product_id']);
                $qty = (int) $it['qty'];
                $unit = $it['unit_cost'];
                $subtotal = $qty * $unit;

                if ($product->stock !== null) {
                    Product::where('id', $product->id)
                        ->whereNotNull('stock')
                        ->update(['stock' => DB::raw('stock + ' . intval($qty))]);
                    $product->refresh();
                }

                $purchase->items()->create([
                    'product_id' => $product->id,
                    'qty' => $qty,
                    'unit_cost' => $unit,
                    'subtotal' => $subtotal,
                ]);

                $total += $subtotal;
            }

            $purchase->supplier_name = $validated['supplier_name'] ?? null;
            $purchase->total = $total;
            $purchase->save();
        });

        return redirect()->back()->with('success', 'Compra actualizada correctamente.');
    }

    public function destroy(Purchase $purchase)
    {
        DB::transaction(function () use ($purchase) {
            // revert stock additions
            foreach ($purchase->items as $item) {
                $product = Product::find($item->product_id);
                if ($product && $product->stock !== null) {
                    Product::where('id', $product->id)
                        ->whereNotNull('stock')
                        ->update(['stock' => DB::raw('GREATEST(stock - ' . intval($item->qty) . ', 0)')]);
                }
            }

            $purchase->delete();
        });

        return redirect()->back()->with('success', 'Compra eliminada correctamente.');
    }
}
