import InputError from '@/components/atoms/input-error'
import { DataTable } from '@/components/data-table/data-table'
import { TableImportDialog } from '@/components/data-table/table-import-dialog'
import { ConfirmDialog } from '@/components/molecules/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import AppLayout from '@/layouts/app-layout'
import { cn } from '@/lib/utils'
import {
  bulkDestroy,
  destroy,
  importMethod,
  store,
  update,
} from '@/routes/pembelian'
import { FeedsProps, PaginatedResponse, TableDialogType } from '@/types'
import { Form, Head, router } from '@inertiajs/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ProductChart } from './chart'

export default function Pembelian({
  paginatedData,
}: {
  paginatedData: PaginatedResponse<FeedsProps>
}) {
  const [open, setOpen] = useState<TableDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<FeedsProps | null>(null)

  function handleEdit(row: FeedsProps) {
    setCurrentRow(row)
    setOpen('update')
  }

  function handleDelete(row: FeedsProps) {
    setCurrentRow(row)
    setOpen('delete')
  }

  function handleExport(rows: FeedsProps[]) {
    if (!rows.length) return
    const header = ['nama_pakan', 'asal', 'jumlah', 'harga', 'tanggal_beli']
    const csv = [
      header.join(','),
      ...rows.map((r) =>
        [
          r.nama_pakan,
          r.asal,
          r.jumlah,
          r.harga,
          r.tanggal_beli?.slice(0, 10) ?? '',
        ].join(','),
      ),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fattening-export-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Berhasil mengekspor ${rows.length} data.`)
  }

  function handleBulkDelete(rows: FeedsProps[]) {
    if (!rows.length) return
    router.delete(bulkDestroy().url, {
      data: { ids: rows.map((r) => r.id) },
      preserveScroll: true,
      onSuccess: () => toast.success(`Berhasil menghapus ${rows.length} data.`),
      onError: () => toast.error('Gagal menghapus data.'),
    })
  }

  async function handleImport(files: FileList) {
    const file = files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    router.post(importMethod().url, fd, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => toast.success('Berhasil mengimpor data.'),
      onError: () => toast.error('Gagal mengimpor data.'),
    })
  }

  const isEdit = open === 'update'
  const isCreate = open === 'create'

  return (
    <AppLayout>
      <Head title="Pembelian Pakan" />

      <main className={cn('flex flex-1 flex-col gap-4 px-4 py-6 sm:gap-6')}>
        <div>
          <h2 className="text-4xl font-bold tracking-tight">Pembelian Pakan</h2>
          <p className="text-2xl text-muted-foreground">
            Ini adalah halaman data pembelian pakan.
          </p>
        </div>

        <ProductChart />
        <DataTable
          data={paginatedData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          onExport={handleExport}
          setOpen={setOpen}
        />
      </main>

      <TableImportDialog
        open={open === 'import'}
        onOpenChange={(v) => setOpen(v ? 'import' : null)}
        onImport={handleImport}
      />

      {/* Create Drawer */}
      <Sheet
        open={isCreate || isEdit}
        onOpenChange={(v) => {
          if (!v) {
            setOpen(null)
            setCurrentRow(null)
          }
        }}
      >
        <SheetContent className="sm:max-w-md">
          <SheetHeader className="text-start">
            <SheetTitle className="text-2xl">
              {isEdit ? 'Edit Data' : 'Tambah Data'}
            </SheetTitle>
            <SheetDescription className="text-xl">
              {isEdit
                ? 'Ubah data lalu simpan.'
                : 'Tambahkan data baru ke dalam tabel.'}
            </SheetDescription>
          </SheetHeader>
          <Form
            // Choose route helper; replace update() with your own if available
            action={
              isEdit && currentRow ? update(currentRow.id).url : store().url
            }
            method={isEdit ? 'put' : 'post'}
            resetOnError
            resetOnSuccess
            default
            className="px-4"
            onSuccess={() => setOpen(null)}
          >
            {({ processing, errors }) => (
              <>
                <div className="grid gap-6">
                  {/* Name */}
                  <div className="grid gap-2">
                    <Label className="text-lg" htmlFor="nama_pakan">
                      Nama Pakan
                    </Label>
                    <Select
                      name="nama_pakan"
                      defaultValue={
                        isEdit && currentRow ? currentRow.nama_pakan : undefined
                      }
                    >
                      <SelectTrigger className="h-11 text-lg placeholder:text-lg">
                        <SelectValue placeholder="Pilih nama pakan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem className="text-lg" value="Silase">
                            Silase
                          </SelectItem>
                          <SelectItem
                            className="text-lg"
                            value="Konsentrat Fattening"
                          >
                            Konsentrat Fattening
                          </SelectItem>
                          <SelectItem
                            className="text-lg"
                            value="Konsentrat Breeding"
                          >
                            Konsentrat Breeding
                          </SelectItem>
                          <SelectItem className="text-lg" value="Complete Feed">
                            Complete Feed
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <InputError message={errors.nama_pakan} />
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-lg" htmlFor="asal">
                      Sumber / Asal
                    </Label>
                    <Input
                      id="asal"
                      name="asal"
                      className="h-11 placeholder:text-lg"
                      style={{ fontSize: 18 }}
                      placeholder="Contoh: PT Pakan Sejahtera"
                      required
                      defaultValue={isEdit && currentRow ? currentRow.asal : ''}
                    />
                    <InputError message={errors.asal} />
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-lg" htmlFor="jumlah">
                      Jumlah (kg)
                    </Label>
                    <Input
                      id="jumlah"
                      name="jumlah"
                      type="number"
                      min={0}
                      step="0.01"
                      className="h-11 placeholder:text-lg"
                      style={{ fontSize: 18 }}
                      placeholder="0"
                      required
                      defaultValue={
                        isEdit && currentRow ? currentRow.jumlah : undefined
                      }
                    />
                    <InputError message={errors.jumlah} />
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-lg" htmlFor="harga">
                      Harga (Rp)
                    </Label>
                    <Input
                      id="harga"
                      name="harga"
                      type="number"
                      min={0}
                      step="1"
                      className="h-11 placeholder:text-lg"
                      style={{ fontSize: 18 }}
                      placeholder="0"
                      required
                      defaultValue={
                        isEdit && currentRow ? currentRow.harga : undefined
                      }
                    />
                    <InputError message={errors.harga} />
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-lg" htmlFor="tanggal_beli">
                      Tanggal Pembelian
                    </Label>
                    <Input
                      id="tanggal_beli"
                      name="tanggal_beli"
                      type="date"
                      className="h-11 placeholder:text-lg"
                      style={{ fontSize: 18 }}
                      required
                      defaultValue={
                        isEdit && currentRow
                          ? currentRow.tanggal_beli?.slice(0, 10)
                          : undefined
                      }
                    />
                    <InputError message={errors.tanggal_beli} />
                  </div>
                </div>

                <SheetFooter className="gap-2">
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      className="cursor-pointer text-lg"
                    >
                      Tutup
                    </Button>
                  </SheetClose>
                  <Button
                    type="submit"
                    disabled={processing}
                    className="cursor-pointer text-lg"
                  >
                    {processing
                      ? isEdit
                        ? 'Menyimpan...'
                        : 'Menambah...'
                      : isEdit
                        ? 'Simpan perubahan'
                        : 'Simpan'}
                  </Button>
                </SheetFooter>
              </>
            )}
          </Form>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={open === 'delete'}
        onOpenChange={(open) => setOpen(open ? 'delete' : null)}
        destructive
        title={`Hapus data "${currentRow?.nama_pakan}"?`}
        desc="Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        handleConfirm={() => {
          if (!currentRow) return
          router.delete(destroy(currentRow.id), {
            onFinish: () => {
              setOpen(null)
              setCurrentRow(null)
            },
          })
        }}
      />
    </AppLayout>
  )
}
