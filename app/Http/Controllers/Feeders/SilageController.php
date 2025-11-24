<?php

namespace App\Http\Controllers\Feeders;

use App\Http\Controllers\Controller;
use App\Models\Silage;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class SilageController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage   = (int) $request->query('per_page', 10);
        $search    = $request->query('search');
        $sortBy    = $request->query('sort_by', 'id');
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

        $allowedSort = ['id','name','from','quantity','price','buy_at'];
        if (in_array($sortBy, $allowedSort, true)) {
            $query->orderBy($sortBy, $sortOrder === 'desc' ? 'desc' : 'asc');
        }

        $paginatedData = $query->paginate($perPage);

        return Inertia::render('dashboard/silage', [
            'paginatedData' => $paginatedData,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'from'     => 'required|string|max:255',
            'quantity' => 'required|numeric',
            'price'    => 'required|numeric',
            'buy_at'   => 'required|date',
        ]);
        $data['buy_at'] = Carbon::parse($data['buy_at']);
        Silage::create($data);
        return redirect()->route('silage.index')->with('success', 'Data dibuat.');
    }

    public function update(Request $request, Silage $silage): RedirectResponse
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'from'     => 'required|string|max:255',
            'quantity' => 'required|numeric',
            'price'    => 'required|numeric',
            'buy_at'   => 'required|date',
        ]);
        $data['buy_at'] = Carbon::parse($data['buy_at']);
        $silage->update($data);
        return redirect()->route('silage.index')->with('success', 'Data diperbarui.');
    }

    public function destroy(Silage $silage): RedirectResponse
    {
        $silage->delete();
        return redirect()->route('silage.index')->with('success', 'Data dihapus.');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:silages,id',
        ]);
        $count = Silage::whereIn('id', $validated['ids'])->delete();
        return redirect()->route('silage.index')->with('success', "{$count} data dihapus.");
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimetypes:text/csv,text/plain,application/vnd.ms-excel|max:10240',
        ]);

        $handle = fopen($request->file('file')->getRealPath(), 'r');
        if (!$handle) {
            return response()->json(['message' => 'File invalid.'], 422);
        }

        $first = fgetcsv($handle);
        $header = $first && $this->looksLikeHeader($first) ? true : false;
        if (!$header && $first) {
            rewind($handle);
        }

        $rows = [];
        while (($row = fgetcsv($handle)) !== false) {
            [$name,$from,$quantity,$price,$buyAt] = array_pad($row, 5, null);
            $rows[] = [
                'name'       => $name ?? 'silase',
                'from'       => $from,
                'quantity'   => is_numeric($quantity) ? (float)$quantity : null,
                'price'      => is_numeric($price) ? (float)$price : null,
                'buy_at'     => $buyAt ? Carbon::parse($buyAt) : null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        fclose($handle);

        $valid = [];
        foreach ($rows as $r) {
            $v = Validator::make($r, [
                'name'     => 'required|string|max:255',
                'from'     => 'required|string|max:255',
                'quantity' => 'required|numeric',
                'price'    => 'required|numeric',
                'buy_at'   => 'required|date',
            ]);
            if ($v->fails()) continue;
            $valid[] = $v->validated() + [
                'created_at' => $r['created_at'],
                'updated_at' => $r['updated_at'],
            ];
        }

        if (!count($valid)) {
            return response()->json(['message' => 'Tidak ada baris valid.'], 422);
        }

        DB::table('silages')->insert($valid);
        return response()->noContent();
    }

    private function looksLikeHeader(array $row): bool
    {
        $lower = array_map(fn($v) => is_string($v) ? strtolower($v) : $v, $row);
        $keys = ['name','from','quantity','price','buy_at'];
        return count(array_intersect($keys, $lower)) >= 2;
    }
}