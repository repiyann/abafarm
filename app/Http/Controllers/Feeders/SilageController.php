<?php

namespace App\Http\Controllers\Feeders;

use App\Http\Controllers\Controller;
use App\Models\Silage;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class SilageController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = (int) $request->query('per_page', 10);
        $search = $request->query('search');
        $sortBy = $request->query('sort_by', 'id');
        $sortOrder = $request->query('sort_order', 'asc');

        $query = Silage::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('from', 'like', "%{$search}%")
                  ->orWhere('quantity', 'like', "%{$search}%")
                  ->orWhere('price', 'like', "%{$search}%")
                  ->orWhere('buy_at', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $allowedSortColumns = ['name', 'from', 'quantity', 'price', 'buy_at'];
        if (in_array($sortBy, $allowedSortColumns)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $paginatedData = $query->paginate($perPage);
        
        return Inertia::render('dashboard/silage', [
            'paginatedData' => $paginatedData,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'from' => 'required|string|max:255',
            'quantity' => 'required|numeric',
            'buy_at' => 'required|date',
        ]);

        Silage::create($request->all());

        return redirect()->route('silage.index')->with('success', 'Silage created successfully.');
    }

    public function destroy(Silage $silage)
    {
        $silage->delete();

        return redirect()->route('silages.index')->with('success', 'Silage deleted successfully.');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:silages,id',
        ]);

        $deletedCount = Silage::whereIn('id', $request->ids)->delete();

        return redirect()->route('silages.index')->with('success', "{$deletedCount} data berhasil dihapus.");
    }
}