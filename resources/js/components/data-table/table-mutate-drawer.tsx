import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { type ReactNode } from 'react'
import { FieldValues, UseFormReturn } from 'react-hook-form'

type TableMutateDrawerProps<T, S extends FieldValues> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: T
  form: UseFormReturn<S>
  children: ReactNode
}

export function TableMutateDrawer<T, S extends FieldValues>({
  open,
  onOpenChange,
  currentRow,
  form,
  children,
}: TableMutateDrawerProps<T, S>) {
  const isUpdate = !!currentRow

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-start">
          <SheetTitle>{isUpdate ? 'Ubah' : 'Tambah'} Data</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Ubah data sesuai kebutuhan.'
              : 'Tambahkan data baru ke dalam tabel.'}{' '}
            Klik simpan jika sudah selesai.
          </SheetDescription>
        </SheetHeader>
        {children}
        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button variant="outline">Tutup</Button>
          </SheetClose>
          <Button form="tasks-form" type="submit">
            Simpan perubahan
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
