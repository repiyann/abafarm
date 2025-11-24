<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('fattenings', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('from');
            $table->decimal('quantity', 8, 1);
            $table->decimal('price', 11, 2);
            $table->timestamp('buy_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('silages');
    }
};
