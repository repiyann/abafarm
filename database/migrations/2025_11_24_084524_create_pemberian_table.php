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
        Schema::create('pemberian_pakan', function (Blueprint $table) {
            $table->id();
            $table->string('nama_pakan');
            $table->decimal('jumlah', 8, 1);
            $table->timestamp('tanggal_beri');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pemberian_pakan');
    }
};
