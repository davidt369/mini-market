<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        /* 1. Garantiza categorías */
        if (Category::count() === 0) {
            $this->call(CategorySeeder::class);
        }

        $cat = fn(string $name) => Category::where('name', $name)->firstOrFail()->id;

        /* 2. Catálogo básico de minimarket */
        $productos = [
            [
                'name'        => 'Leche entera 1 L',
                'description' => 'Leche UHT entera, caja 1 L.',
                'unit_price'  => 1.80,
                'unit_cost'   => 1.20,
                'stock'       => 120,
                'category_id' => $cat('Lácteos y Refrigerados'),
            ],
            [
                'name'        => 'Yogurt natural 1 kg',
                'description' => 'Yogurt sin azúcar, envase 1 kg.',
                'unit_price'  => 2.50,
                'unit_cost'   => 1.75,
                'stock'       => 60,
                'category_id' => $cat('Lácteos y Refrigerados'),
            ],
            [
                'name'        => 'Papas fritas 85 g',
                'description' => 'Snack salado, bolsa 85 g.',
                'unit_price'  => 1.20,
                'unit_cost'   => 0.70,
                'stock'       => 200,
                'category_id' => $cat('Snacks y Golosinas'),
            ],
            [
                'name'        => 'Chocolate tableta 100 g',
                'description' => 'Chocolate con leche, 100 g.',
                'unit_price'  => 1.90,
                'unit_cost'   => 1.30,
                'stock'       => 150,
                'category_id' => $cat('Snacks y Golosinas'),
            ],
            [
                'name'        => 'Refresco cola 2 L',
                'description' => 'Bebida carbonatada, botella 2 L.',
                'unit_price'  => 1.60,
                'unit_cost'   => 1.00,
                'stock'       => 180,
                'category_id' => $cat('Bebidas sin Alcohol'),
            ],
            [
                'name'        => 'Agua natural 600 mL',
                'description' => 'Agua purificada, botella 600 mL.',
                'unit_price'  => 0.70,
                'unit_cost'   => 0.40,
                'stock'       => 300,
                'category_id' => $cat('Bebidas sin Alcohol'),
            ],
            [
                'name'        => 'Cerveza lata 355 mL',
                'description' => 'Cerveza rubia, lata 355 mL.',
                'unit_price'  => 1.30,
                'unit_cost'   => 0.90,
                'stock'       => 100,
                'category_id' => $cat('Bebidas Alcohólicas'),
            ],
            [
                'name'        => 'Tortillas de maíz 1 kg',
                'description' => 'Paquete de tortillas, 1 kg.',
                'unit_price'  => 1.40,
                'unit_cost'   => 1.00,
                'stock'       => 80,
                'category_id' => $cat('Panadería y Tortillería'),
            ],
            [
                'name'        => 'Pan blanco 680 g',
                'description' => 'Pan de caja, 680 g.',
                'unit_price'  => 1.50,
                'unit_cost'   => 1.00,
                'stock'       => 70,
                'category_id' => $cat('Panadería y Tortillería'),
            ],
            [
                'name'        => 'Café molido 500 g',
                'description' => 'Café tostado y molido, bolsa 500 g.',
                'unit_price'  => 4.20,
                'unit_cost'   => 2.80,
                'stock'       => 50,
                'category_id' => $cat('Café y Desayuno'),
            ],
            [
                'name'        => 'Azúcar refinada 1 kg',
                'description' => 'Azúcar blanca, bolsa 1 kg.',
                'unit_price'  => 1.10,
                'unit_cost'   => 0.75,
                'stock'       => 200,
                'category_id' => $cat('Abarrotes y Enlatados'),
            ],
            [
                'name'        => 'Frijol negro 1 kg',
                'description' => 'Frijol seco, bolsa 1 kg.',
                'unit_price'  => 1.80,
                'unit_cost'   => 1.20,
                'stock'       => 90,
                'category_id' => $cat('Abarrotes y Enlatados'),
            ],
            [
                'name'        => 'Jabón tocador 150 g',
                'description' => 'Jabón blanco, barra 150 g.',
                'unit_price'  => 0.60,
                'unit_cost'   => 0.35,
                'stock'       => 250,
                'category_id' => $cat('Aseo Personal'),
            ],
            [
                'name'        => 'Cloro clásico 1 L',
                'description' => 'Desinfectante líquido, botella 1 L.',
                'unit_price'  => 1.20,
                'unit_cost'   => 0.70,
                'stock'       => 110,
                'category_id' => $cat('Limpieza del Hogar'),
            ],
            [
                'name'        => 'Alimento perro 1 kg',
                'description' => 'Croquetas sabor pollo, bolsa 1 kg.',
                'unit_price'  => 3.50,
                'unit_cost'   => 2.30,
                'stock'       => 60,
                'category_id' => $cat('Mascotas'),
            ],
        ];

        /* 3. Inserta los productos */
        foreach ($productos as $p) {
            Product::create($p);
        }

        /* 4. (Opcional) Productos extra generados por factory */
        // Product::factory()->count(60)->create();
    }
}
