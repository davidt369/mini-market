<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Category;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        // Selecciona una categoría existente aleatoriamente
        $category = Category::inRandomOrder()->first();

        // Genera un costo y un precio con margen realista
        $unitCost = $this->faker->randomFloat(2, 5, 100);
        $unitPrice = $unitCost * $this->faker->randomFloat(2, 1.2, 1.8);

        return [
            'category_id' => $category ? $category->id : null,
            'name' => ucfirst($this->faker->unique()->words(3, true)), // Ej: "Shampoo Herbal Natural"
            'description' => $this->faker->sentence(12),
            'unit_cost' => $unitCost,
            'unit_price' => $unitPrice,
            'stock' => $this->faker->numberBetween(0, 500),
            'min_stock' => $this->faker->numberBetween(5, 20),
            'expiry_date' => $this->faker->optional(0.4)->dateTimeBetween('now', '+2 years'),
        ];
    }
}
