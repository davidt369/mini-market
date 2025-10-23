<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use Inertia\Inertia;
use App\Models\Product;
use Carbon\Carbon;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    { {
            // Compartir alertas globales (productos por caducar y stock bajo)
            Inertia::share([
                'alerts' => function () {
                    $now = Carbon::now();
                    $expiringThreshold = $now->copy()->addDays(30); // próximos 30 días

                    // Sólo productos cuya fecha de caducidad esté entre hoy y el umbral (próximos 30 días)
                    $expiring = Product::select('id', 'name', 'expiry_date', 'stock')
                        ->whereNotNull('expiry_date')
                        ->whereDate('expiry_date', '>=', $now->toDateString())
                        ->whereDate('expiry_date', '<=', $expiringThreshold->toDateString())
                        ->orderBy('expiry_date', 'asc')
                        ->get();

                    // Productos ya vencidos (expiry_date < today)
                    $expired = Product::select('id', 'name', 'expiry_date', 'stock')
                        ->whereNotNull('expiry_date')
                        ->whereDate('expiry_date', '<', $now->toDateString())
                        ->orderBy('expiry_date', 'desc')
                        ->get();

                    $lowStock = Product::select('id', 'name', 'stock', 'min_stock')
                        ->where(function ($q) {
                            $q->whereColumn('stock', '<=', 'min_stock')
                                ->orWhere('stock', 0);
                        })
                        ->orderBy('stock', 'asc')
                        ->get();

                    return [
                        'expiring' => $expiring,
                        'expired' => $expired,
                        'low_stock' => $lowStock,
                    ];
                }
            ]);
        }
    }
}
