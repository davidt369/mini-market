<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Si no hay categorías, creamos algunas para evitar error de relación
        if (Category::count() === 0) {
            \Database\Seeders\CategorySeeder::run(new CategorySeeder());
        }

        Product::factory()->count(30)->create();
    }
}
