<?php

namespace Database\Factories;

use App\Models\Fattening;
use Illuminate\Database\Eloquent\Factories\Factory;

class FatteningFactory extends Factory
{
    protected $model = Fattening::class;

    public function definition()
    {
        return [
            'name' => $this->faker->word,
            'from' => $this->faker->word,
            'quantity' => $this->faker->randomFloat(1, 0, 1000),
            'price' => $this->faker->randomFloat(2, 0, 10000),
            'buy_at' => $this->faker->dateTime,
        ];
    }
}