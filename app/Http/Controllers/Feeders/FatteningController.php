<?php

namespace App\Http\Controllers\Feeders;

use App\Http\Controllers\Controller;
use App\Models\Fattening;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class FatteningController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = (int) $request->query('per_page', 10);
        $search = $request->query('search');
        $sortBy = $request->query('sort_by', 'id');
        $sortOrder = $request->query('sort_order', 'asc');

        $query = Fattening::query();

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

        return Inertia::render('dashboard/fattening', [
            'paginatedData' => $paginatedData,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'from'     => 'required|string|max:255',
            'quantity' => 'required|numeric',
            'price'    => 'required|numeric',
            'buy_at'   => 'required|date',
        ]);

        Fattening::create($data);

        return redirect()->route('fattening.index')
            ->with('success', 'Berhasil menambahkan data konsentrat fattening.');
    }

    public function update(Request $request, Fattening $fattening)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'from' => 'required|string|max:255',
            'quantity' => 'required|numeric',
            'price' => 'required|numeric',
            'buy_at' => 'required|date',
        ]);

        $fattening->update($request->all());

        return redirect()->route('fattening.index')
            ->with('success', 'Berhasil memperbarui data konsentrat fattening.');
    }

    public function destroy(Fattening $fattening)
    {
        $fattening->delete();

        return redirect()->route('fattening.index')
            ->with('success', 'Berhasil menghapus data konsentrat fattening.');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:fattenings,id',
        ]);

        $deletedCount = Fattening::whereIn('id', $validated['ids'])->delete();

        return redirect()->route('fattening.index')
            ->with('success', "{$deletedCount} data berhasil dihapus.");
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'mimetypes:text/csv,text/plain,application/vnd.ms-excel',
                'max:10240', // 10MB
            ],
        ]);

        $file = $request->file('file');
        $path = $file->getRealPath();

        $handle = fopen($path, 'r');
        if ($handle === false) {
            return response()->json(['message' => 'Gagal membuka file.'], 422);
        }

        // Optional: skip header if present
        $firstRow = fgetcsv($handle);
        $hasHeader = false;
        if ($firstRow && self::looksLikeHeader($firstRow)) {
            $hasHeader = true;
        } else {
            // Rewind to treat first row as data
            if ($firstRow) {
                rewind($handle);
            }
        }

        $rows = [];
        while (($row = fgetcsv($handle)) !== false) {
            // Expected columns: name, from, quantity, price, buy_at (Y-m-d)
            [$name, $from, $quantity, $price, $buyAt] = array_pad($row, 5, null);

            $rows[] = [
                'name'     => $name ?? 'konsentrat fattening',
                'from'     => $from,
                'quantity' => is_numeric($quantity) ? (float) $quantity : null,
                'price'    => is_numeric($price) ? (float) $price : null,
                'buy_at'   => $buyAt ? Carbon::parse($buyAt) : null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        fclose($handle);

        // Validate each row quickly before insert
        $valid = [];
        foreach ($rows as $i => $r) {
            $v = Validator::make($r, [
                'name'     => 'required|string|max:255',
                'from'     => 'required|string|max:255',
                'quantity' => 'required|numeric',
                'price'    => 'required|numeric',
                'buy_at'   => 'required|date',
            ]);
            if ($v->fails()) {
                continue; // skip invalid row
            }
            $valid[] = $v->validated();
            $valid[array_key_last($valid)]['created_at'] = $r['created_at'];
            $valid[array_key_last($valid)]['updated_at'] = $r['updated_at'];
        }

        if (count($valid) === 0) {
            return response()->json(['message' => 'Tidak ada baris valid untuk diimpor.'], 422);
        }

        DB::table('fattenings')->insert($valid);

        // Your fetch() only checks r.ok; return 204
        return redirect()->route('fattening.index')
            ->with('success', "Berhasil mengimpor data.");
    }

    private static function looksLikeHeader(array $row): bool
    {
        $lower = array_map(fn($v) => is_string($v) ? strtolower($v) : $v, $row);
        $headers = ['name', 'from', 'quantity', 'price', 'buy_at'];
        $matches = 0;
        foreach ($headers as $h) {
            if (in_array($h, $lower, true)) {
                $matches++;
            }
        }
        return $matches >= 2;
    }
}
