<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect('/login');
})->name('home');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');


    // ✅ Rutas de categorías dentro de "market"
    Route::prefix('market')->name('market.')->group(function () {
        Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
        Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::put('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
    });


    // ✅ Rutas de productos dentro de "market"
    Route::prefix('market')->name('market.')->group(function () {
        Route::get('products', [ProductController::class, 'index'])->name('products.index');
        Route::get('products/create', [ProductController::class, 'create'])->name('products.create');
        Route::post('products', [ProductController::class, 'store'])->name('products.store');
        Route::get('products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
        Route::put('products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
    });

    // ✅ Rutas de gestión de usuarios y roles dentro de "market"
    Route::prefix('market')->name('market.')->group(function () {
        Route::get('users', [App\Http\Controllers\Admin\UserController::class, 'index'])->name('users.index');
    });

    // Rutas CRUD Usuarios
    Route::prefix('market')->name('market.')->group(function () {
        Route::post('users', [UserController::class, 'store'])->name('users.store');
        Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });

    // ✅ Rutas CRUD Clientes dentro de "market"
    Route::prefix('market')->name('market.')->group(function () {
        Route::get('customers', [App\Http\Controllers\CustomerController::class, 'index'])->name('customers.index');
        Route::post('customers', [App\Http\Controllers\CustomerController::class, 'store'])->name('customers.store');
        Route::put('customers/{customer}', [App\Http\Controllers\CustomerController::class, 'update'])->name('customers.update');
        Route::delete('customers/{customer}', [App\Http\Controllers\CustomerController::class, 'destroy'])->name('customers.destroy');
    });

    // ✅ Rutas Ventas (POS)
    Route::prefix('market')->name('market.')->group(function () {
        Route::get('sales', [App\Http\Controllers\SalesController::class, 'index'])->name('sales.index');
        Route::get('sales/{sale}', [App\Http\Controllers\SalesController::class, 'show'])->name('sales.show');
        Route::post('sales', [App\Http\Controllers\SalesController::class, 'store'])->name('sales.store');
        Route::put('sales/{sale}', [App\Http\Controllers\SalesController::class, 'update'])->name('sales.update');
        Route::post('sales/{sale}/return', [App\Http\Controllers\SalesController::class, 'returnItem'])->name('sales.return');
        Route::delete('sales/{sale}', [App\Http\Controllers\SalesController::class, 'destroy'])->name('sales.destroy');
    });

    // ✅ Rutas Compras (Purchases)
    Route::prefix('market')->name('market.')->group(function () {
        Route::get('purchases', [App\Http\Controllers\PurchaseController::class, 'index'])->name('purchases.index');
        Route::get('purchases/{purchase}', [App\Http\Controllers\PurchaseController::class, 'show'])->name('purchases.show');
        Route::post('purchases', [App\Http\Controllers\PurchaseController::class, 'store'])->name('purchases.store');
        Route::put('purchases/{purchase}', [App\Http\Controllers\PurchaseController::class, 'update'])->name('purchases.update');
        Route::delete('purchases/{purchase}', [App\Http\Controllers\PurchaseController::class, 'destroy'])->name('purchases.destroy');
    });

    // Rutas Reportes
    Route::prefix('market')->name('market.')->group(function () {
        Route::get('reports', [App\Http\Controllers\ReportsController::class, 'index'])->name('reports.index');
        // API endpoints (JSON)
        Route::get('reports/sales', [App\Http\Controllers\ReportsController::class, 'salesReport'])->name('reports.sales');
        Route::get('reports/critical-stock', [App\Http\Controllers\ReportsController::class, 'criticalStock'])->name('reports.critical_stock');
        Route::get('reports/expiring', [App\Http\Controllers\ReportsController::class, 'expiringProducts'])->name('reports.expiring');
        Route::get('reports/margin', [App\Http\Controllers\ReportsController::class, 'marginReport'])->name('reports.margin');
        Route::get('reports/purchases-by-supplier', [App\Http\Controllers\ReportsController::class, 'purchasesBySupplier'])->name('reports.purchases_by_supplier');
        Route::get('reports/top-products', [App\Http\Controllers\ReportsController::class, 'topProducts'])->name('reports.top_products');
        // Exports (CSV)
        Route::get('reports/export/sales.csv', [App\Http\Controllers\ReportsController::class, 'exportSalesCsv'])->name('reports.export.sales_csv');
        Route::get('reports/export/top-products.csv', [App\Http\Controllers\ReportsController::class, 'exportTopProductsCsv'])->name('reports.export.top_products_csv');
    });
});









require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
