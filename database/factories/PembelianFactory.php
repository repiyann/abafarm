<?php

namespace Database\Factories;

use App\Models\Pembelian;
use Illuminate\Database\Eloquent\Factories\Factory;

class PembelianFactory extends Factory
{
    protected $model = Pembelian::class;

    public function definition()
    {
        return [
            'nama_pakan' => $this->faker->randomElement([
                'Silase',
                'Konsentrat Fattening',
                'Konsentrat Breeding',
                'Complete Feed',
            ]),
            'asal' => $this->faker->randomElement([
                'PT. Pakan Sejahtera',
                'PT. Agro Makmur',
                'PT. Feed Nusantara',
                'PT. Nutrisi Ternak',
            ]),
            'jumlah' => $this->faker->numberBetween(100, 15000),
            'harga' => $this->faker->numberBetween(2000000, 20000000),
            'tanggal_beli' => $this->faker->dateTimeBetween('2023-01-01', '2025-10-31'),
        ];
    }
}