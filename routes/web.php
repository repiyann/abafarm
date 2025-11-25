<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Feeders\SilageController;
use App\Http\Controllers\Feeders\FatteningController;
use App\Http\Controllers\PembelianController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard/index');
    })->name('dashboard');

    Route::prefix('silage')->name('silage.')->group(function () {
        Route::get('/', [SilageController::class, 'index'])->name('index');
        Route::post('/', [SilageController::class, 'store'])->name('store');
        Route::post('/import', [SilageController::class, 'import'])->name('import');
        Route::delete('/bulk-destroy', [SilageController::class, 'bulkDestroy'])->name('bulkDestroy');
        Route::put('/{silage}', [SilageController::class, 'update'])->name('update');
        Route::delete('/{silage}', [SilageController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('fattening')->name('fattening.')->group(function () {
        Route::get('/', [FatteningController::class, 'index'])->name('index');
        Route::post('/', [FatteningController::class, 'store'])->name('store');
        Route::post('/import', [FatteningController::class, 'import'])->name('import');
        Route::delete('/bulk-destroy', [FatteningController::class, 'bulkDestroy'])->name('bulkDestroy');
        Route::put('/{fattening}', [FatteningController::class, 'update'])->name('update');
        Route::delete('/{fattening}', [FatteningController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('pembelian-pakan')->name('pembelian.')->group(function () {
        Route::get('/', [PembelianController::class, 'index'])->name('index');
        Route::post('/', [PembelianController::class, 'store'])->name('store');
        Route::post('/import', [PembelianController::class, 'import'])->name('import');
        Route::delete('/bulk-destroy', [PembelianController::class, 'bulkDestroy'])->name('bulkDestroy');
        Route::put('/{pembelian}', [PembelianController::class, 'update'])->name('update');
        Route::delete('/{pembelian}', [PembelianController::class, 'destroy'])->name('destroy');
    });
});

require __DIR__ . '/settings.php';
