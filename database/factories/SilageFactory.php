<?php

namespace Database\Factories;

use App\Models\Silage;
use Illuminate\Database\Eloquent\Factories\Factory;

class SilageFactory extends Factory
{
    protected $model = Silage::class;

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