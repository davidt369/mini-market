<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class CategoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => ucfirst($this->faker->unique()->words(2, true)), // Ej: "Cuidado Personal"
            'description' => $this->faker->sentence(10), // descripción corta
        ];
    }
}
