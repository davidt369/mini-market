<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Muestra la lista de categorías.
     */
    public function index()
    {
        $categories = Category::select('id', 'name', 'description', 'created_at')
            ->latest()
            ->get();

        return Inertia::render('market/categories/Index', [
            'categories' => $categories
        ]);
    }

    /**
     * Guarda una nueva categoría.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:categories,name',
            'description' => 'nullable|string|max:255',
        ]);

        Category::create($validated);

        return redirect()->back()->with('success', 'Categoría creada correctamente.');
    }

    /**
     * Actualiza una categoría existente.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:categories,name,' . $category->id,
            'description' => 'nullable|string|max:255',
        ]);

        $category->update($validated);

        return redirect()->back()->with('success', 'Categoría actualizada correctamente.');
    }

    /**
     * Elimina (soft delete) una categoría.
     */
    public function destroy(Category $category)
    {
        $category->delete();

        return redirect()->back()->with('success', 'Categoría eliminada correctamente.');
    }
}
