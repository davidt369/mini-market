<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    private array $categories = [
        'Lácteos y Refrigerados',
        'Snacks y Golosinas',
        'Bebidas sin Alcohol',
        'Bebidas Alcohólicas',
        'Panadería y Tortillería',
        'Café y Desayuno',
        'Abarrotes y Enlatados',
        'Aseo Personal',
        'Limpieza del Hogar',
        'Mascotas',
        'Congelados',
        'Cuidado del Bebé',
        'Salsas y Aderezos',
    ];

    public function run(): void
    {
        foreach ($this->categories as $cat) {
            Category::firstOrCreate(['name' => $cat]);
        }
    }
}
