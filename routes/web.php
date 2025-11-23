<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Feeders\SilageController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/silages', [SilageController::class, 'index'])->name('silages.index');
    Route::post('/silages', [SilageController::class, 'store'])->name('silages.store');
    Route::delete('/silages/:id', [SilageController::class, 'destroy'])->name('silages.destroy');
    Route::delete('/silages/bulk-delete', [SilageController::class, 'bulkDestroy'])->name('silages.bulk-destroy');
});

require __DIR__.'/settings.php';
