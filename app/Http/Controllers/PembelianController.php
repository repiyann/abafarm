<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Pembelian;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class PembelianController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 10);
        $search = $request->query('search');
        $sortBy = $request->query('sort_by', 'id');
        $sortOrder = $request->query('sort_order', 'asc');
        $year = $request->query('year', now()->year);

        // Get the last 12 months of data
        $startDate = Carbon::create($year, 1, 1)->startOfMonth();
        $endDate = Carbon::create($year, 12, 31)->endOfMonth();

        // TABLE QUERY - with all filters and sorting
        $tableQuery = Pembelian::query();

        if ($search) {
            $tableQuery->where(function ($q) use ($search) {
                $q->where('nama_pakan', 'like', "%{$search}%")
                    ->orWhere('asal', 'like', "%{$search}%")
                    ->orWhere('jumlah', 'like', "%{$search}%")
                    ->orWhere('harga', 'like', "%{$search}%")
                    ->orWhere('tanggal_beli', 'like', "%{$search}%");
            });
        }

        if ($request->filled('nama_pakan')) {
            $raw = $request->query('nama_pakan');
            $namaPakan = array_filter(array_map('trim', explode(',', $raw)));
            if ($namaPakan) {
                $tableQuery->whereIn('nama_pakan', $namaPakan);
            }
        }

        // Apply sorting only to table query
        $allowedSortColumns = ['nama_pakan', 'asal', 'jumlah', 'harga', 'tanggal_beli'];
        if (in_array($sortBy, $allowedSortColumns)) {
            $tableQuery->orderBy($sortBy, $sortOrder);
        }

        $paginatedData = $tableQuery->paginate($perPage);

        // CHART QUERY - separate, no sorting/pagination, only year filter
        $chartQuery = Pembelian::query()
            ->whereBetween('tanggal_beli', [$startDate, $endDate])
            ->selectRaw('
            nama_pakan,
            MONTH(tanggal_beli) as month,
            SUM(jumlah) as total_jumlah,
            SUM(harga * jumlah) as total_harga
        ')
            ->groupBy('nama_pakan', 'month')
            ->orderBy('month');

        $data = $chartQuery->get();

        // Get unique nama_pakan types
        $typeMap = [
            'silase'    => ['Silase'],
            'fattening' => ['Konsentrat Fattening', 'Fattening'],
            'breeding'  => ['Konsentrat Breeding', 'Breeding'],
            'complete'  => ['Complete', 'Complete Feed'],
        ];

        $types = array_keys($typeMap);

        // Normalize aggregated data
        $normalized = [];
        foreach ($data as $row) {
            $foundLabel = null;
            $namaLower = mb_strtolower($row->nama_pakan);

            foreach ($typeMap as $label => $variants) {
                foreach ($variants as $v) {
                    $variantLower = mb_strtolower($v);
                    if ($namaLower === $variantLower || strpos($namaLower, $variantLower) !== false) {
                        $foundLabel = $label;
                        break 2;
                    }
                }
            }

            if ($foundLabel === null) {
                $foundLabel = $row->nama_pakan;
                if (!in_array($foundLabel, $types, true)) {
                    $types[] = $foundLabel;
                }
            }

            $key = $foundLabel . '|' . $row->month;
            if (!isset($normalized[$key])) {
                $normalized[$key] = (object) [
                    'nama_pakan'   => $foundLabel,
                    'month'        => $row->month,
                    'total_jumlah' => (float) $row->total_jumlah,
                    'total_harga'  => (float) $row->total_harga,
                ];
            } else {
                $normalized[$key]->total_jumlah += (float) $row->total_jumlah;
                $normalized[$key]->total_harga  += (float) $row->total_harga;
            }
        }

        $data = collect(array_values($normalized));

        // Format data for chart (12 months)
        $chartData = [];
        for ($month = 1; $month <= 12; $month++) {
            $monthData = [
                'month' => Carbon::create($year, $month, 1)->isoFormat('MMMM'),
            ];

            foreach ($types as $type) {
                $record = $data->where('nama_pakan', $type)
                    ->where('month', $month)
                    ->first();

                $jumlah = $record ? (float) $record->total_jumlah : 0;
                $harga = $record ? (float) $record->total_harga : 0;
                $rataJumlah = $jumlah > 0 ? $harga / $jumlah : 0;
                $rataHarga = $jumlah > 0 ? $harga / $jumlah : 0;

                $monthData[$type . '_jumlah'] = $jumlah;
                $monthData[$type . '_harga'] = $harga;
                $monthData[$type . '_rata_jumlah'] = $rataJumlah;
                $monthData[$type . '_rata_harga'] = $rataHarga;
            }

            $chartData[] = $monthData;
        }

        // Calculate yearly totals
        $yearlyData = [];

        foreach ($types as $type) {
            $typeRecords = $data->where('nama_pakan', $type);

            // Calculate totals
            $totalJumlah = $typeRecords->sum('total_jumlah');
            $totalHarga = $typeRecords->sum('total_harga');

            // Calculate averages
            $rataJumlahTahunan = $totalJumlah > 0 ? $totalHarga / $totalJumlah : 0;
            $rataHargaTahunan = $totalJumlah > 0 ? $totalHarga / $totalJumlah : 0;

            // Push the structured data into the array
            $yearlyData[] = [
                'label' => $type,
                'jumlah' => (float) $totalJumlah,
                'harga' => (float) $totalHarga,
                'rata_jumlah' => $rataJumlahTahunan,
                'rata_harga' => $rataHargaTahunan,
            ];
        }

        return Inertia::render('dashboard/pembelian', [
            'paginatedData' => $paginatedData,
            'chartData' => $chartData,
            'yearlyData' => $yearlyData,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama_pakan' => 'required|string|max:255',
            'asal' => 'required|string|max:255',
            'jumlah' => 'required|numeric',
            'harga'    => 'required|numeric',
            'tanggal_beli'   => 'required|date',
        ]);

        Pembelian::create($data);

        return redirect()->route('pembelian.index')
            ->with('success', 'Berhasil menambahkan data pembelian pakan.');
    }

    public function update(Request $request, Pembelian $pembelian)
    {
        $request->validate([
            'nama_pakan' => 'required|string|max:255',
            'asal' => 'required|string|max:255',
            'jumlah' => 'required|numeric',
            'harga' => 'required|numeric',
            'tanggal_beli' => 'required|date',
        ]);

        $pembelian->update($request->all());

        return redirect()->route('pembelian.index')
            ->with('success', 'Berhasil memperbarui data pembelian pakan.');
    }

    public function destroy(Pembelian $pembelian)
    {
        $pembelian->delete();

        return redirect()->route('pembelian.index')
            ->with('success', 'Berhasil menghapus data pembelian pakan.');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:pembelian_pakan,id',
        ]);

        $deletedCount = Pembelian::whereIn('id', $validated['ids'])->delete();

        return redirect()->route('pembelian.index')
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
            // Expected columns: nama_pakan, asal, jumlah, harga, tanggal_beli (Y-m-d)
            [$namaPakan, $asal, $jumlah, $harga, $tanggalBeli] = array_pad($row, 5, null);

            $rows[] = [
                'nama_pakan'     => $namaPakan,
                'asal'     => $asal,
                'jumlah' => is_numeric($jumlah) ? (float) $jumlah : null,
                'harga'    => is_numeric($harga) ? (float) $harga : null,
                'tanggal_beli'   => $tanggalBeli ? Carbon::parse($tanggalBeli) : null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        fclose($handle);

        // Validate each row quickly before insert
        $valid = [];
        foreach ($rows as $i => $r) {
            $v = Validator::make($r, [
                'nama_pakan'     => 'required|string|max:255',
                'asal'     => 'required|string|max:255',
                'jumlah' => 'required|numeric',
                'harga'    => 'required|numeric',
                'tanggal_beli'   => 'required|date',
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

        Pembelian::insert($valid);

        return redirect()->route('pembelian.index')
            ->with('success', "Berhasil mengimpor data.");
    }

    private static function looksLikeHeader(array $row): bool
    {
        $lower = array_map(fn($v) => is_string($v) ? strtolower($v) : $v, $row);
        $headers = ['nama_pakan', 'asal', 'jumlah', 'harga', 'tanggal_beli'];
        $matches = 0;
        foreach ($headers as $h) {
            if (in_array($h, $lower, true)) {
                $matches++;
            }
        }
        return $matches >= 2;
    }
}
