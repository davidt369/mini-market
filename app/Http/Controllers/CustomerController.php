<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /**
     * Display a listing of the customers.
     */
    public function index()
    {
        $customers = Customer::select('id', 'full_name', 'phone', 'ci_number', 'created_at')
            ->latest()
            ->get();

        return Inertia::render('market/customers/Index', [
            'customers' => $customers,
        ]);
    }

    /**
     * Store a newly created customer in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:150',
            'phone' => 'nullable|string|max:50|unique:customers,phone',
            'ci_number' => 'nullable|string|max:150|unique:customers,ci_number',
        ]);

        Customer::create($validated);

        return redirect()->back()->with('success', 'Cliente creado correctamente.');
    }

    /**
     * Update the specified customer in storage.
     */
    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:150',
            'phone' => 'nullable|string|max:50|unique:customers,phone,' . $customer->id,
            'ci_number' => 'nullable|string|max:150|unique:customers,ci_number,' . $customer->id,
        ]);

        $customer->update($validated);

        return redirect()->back()->with('success', 'Cliente actualizado correctamente.');
    }

    /**
     * Remove the specified customer from storage (soft delete).
     */
    public function destroy(Customer $customer)
    {
        $customer->delete();

        return redirect()->back()->with('success', 'Cliente eliminado correctamente.');
    }
}
