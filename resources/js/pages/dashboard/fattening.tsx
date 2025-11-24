import InputError from '@/components/atoms/input-error'
import { TableImportDialog } from '@/components/data-table/table-import-dialog'
import { ConfirmDialog } from '@/components/molecules/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  index,
  store,
  update,
} from '@/routes/fattening'
import {
  BreadcrumbItem,
  FeedsProps,
  PaginatedResponse,
  TableDialogType,
} from '@/types'
import { Form, Head, router } from '@inertiajs/react'
import { Download, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { DataTable } from '../../components/data-table/data-table'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Konsentrat Fattening',
    href: index().url,
  },
]

export default function Fattening({
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
    const header = ['name', 'from', 'quantity', 'price', 'buy_at']
    const csv = [
      header.join(','),
      ...rows.map((r) =>
        [
          r.name,
          r.from,
          r.quantity,
          r.price,
          r.buy_at?.slice(0, 10) ?? '',
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
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Fattening Dashboard" />

      <main className={cn('flex flex-1 flex-col gap-4 px-4 py-6 sm:gap-6')}>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Konsentrat Fattening
            </h2>
            <p className="text-muted-foreground">
              Ini adalah halaman konsentrat fattening.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="space-x-1"
              onClick={() => setOpen('import')}
            >
              <span>Import</span> <Download size={18} />
            </Button>
            <Button className="space-x-1" onClick={() => setOpen('create')}>
              <span>Tambah</span> <Plus size={18} />
            </Button>
          </div>
        </div>
        <DataTable
          data={paginatedData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          onExport={handleExport}
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
        <SheetContent className="flex flex-col">
          <SheetHeader className="text-start">
            <SheetTitle>{isEdit ? 'Edit Data' : 'Tambah Data'}</SheetTitle>
            <SheetDescription>
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
                    <Label htmlFor="name">Nama Pakan</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={
                        isEdit && currentRow
                          ? currentRow.name
                          : 'konsentrat fattening'
                      }
                      readOnly
                      className="cursor-not-allowed bg-muted"
                    />
                    <InputError message={errors.name} />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="from">Sumber / Asal</Label>
                    <Input
                      id="from"
                      name="from"
                      placeholder="Contoh: PT Pakan Sejahtera"
                      required
                      defaultValue={isEdit && currentRow ? currentRow.from : ''}
                    />
                    <InputError message={errors.from} />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Jumlah (kg)</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="0"
                      required
                      defaultValue={
                        isEdit && currentRow ? currentRow.quantity : undefined
                      }
                    />
                    <InputError message={errors.quantity} />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="price">Harga (Rp)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min={0}
                      step="1"
                      placeholder="0"
                      required
                      defaultValue={
                        isEdit && currentRow ? currentRow.price : undefined
                      }
                    />
                    <InputError message={errors.price} />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="buy_at">Tanggal Pembelian</Label>
                    <Input
                      id="buy_at"
                      name="buy_at"
                      type="date"
                      required
                      defaultValue={
                        isEdit && currentRow
                          ? currentRow.buy_at?.slice(0, 10)
                          : undefined
                      }
                    />
                    <InputError message={errors.buy_at} />
                  </div>
                </div>

                <SheetFooter className="gap-2">
                  <SheetClose asChild>
                    <Button variant="outline">Tutup</Button>
                  </SheetClose>
                  <Button type="submit" disabled={processing}>
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
        title={`Hapus data "${currentRow?.name}"?`}
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
