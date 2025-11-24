<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fattening extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'from',
        'quantity',
        'price',
        'buy_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'buy_at' => 'datetime',
        ];
    }
}