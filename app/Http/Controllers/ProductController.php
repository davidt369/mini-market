<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * Muestra la lista de productos.
     */
    public function index()
    {

        return Inertia::render('market/products/Index', [
            'products' => Product::with('category')->get(),
            'categories' => Category::select('id', 'name')->get(),
        ]);
    }

    /**
     * Muestra el formulario para crear un nuevo producto.
     */
    public function create()
    {
        $categories = Category::all();

        return Inertia::render('Products/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Almacena un nuevo producto.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'unit_cost' => 'required|numeric',
            'unit_price' => 'required|numeric',
            'stock' => 'required|integer',
            'min_stock' => 'nullable|integer',
            'expiry_date' => 'nullable|date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048', // 👈 validar imagen
        ]);

        // ✅ Si hay imagen, la almacenamos
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public'); // guarda en storage/app/public/products
            $validated['image_url'] = Storage::url($path); // genera URL accesible (ej: /storage/products/imagen.jpg)
        }

        Product::create($validated);

        return redirect()->route('market.products.index')
            ->with('success', 'Producto creado correctamente.');
    }

    /**
     * Muestra el formulario para editar un producto existente.
     */
    public function edit(Product $product)
    {
        $categories = Category::all();

        return Inertia::render('Products/Edit', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }

    /**
     * Actualiza un producto existente.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'unit_cost' => 'required|numeric',
            'unit_price' => 'required|numeric',
            'stock' => 'required|integer',
            'min_stock' => 'nullable|integer',
            'expiry_date' => 'nullable|date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image_url'] = Storage::url($path);
        }

        $product->update($validated);

        return redirect()->back()->with('success', 'Producto actualizado correctamente.');
    }


    /**
     * Elimina un producto existente.
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('market.products.index');
    }
}
