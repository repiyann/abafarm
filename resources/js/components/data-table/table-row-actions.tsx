import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTable as useTableSilage } from '@/pages/dashboard/silage'
import { destroy } from '@/routes/silages'
import { SilageProps } from '@/types'
import { router } from '@inertiajs/react'
import { type Row } from '@tanstack/react-table'
import { Ellipsis, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '../molecules/confirm-dialog'

type DataTableRowActionsProps<TData> = {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const { open, setOpen, currentRow, setCurrentRow } = useTableSilage()

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <Ellipsis className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original as SilageProps)
              setOpen('update')
              console.log(row.original)
            }}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original as SilageProps)
              setOpen('delete')
            }}
          >
            Delete
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        key="task-delete"
        destructive
        open={open === 'delete'}
        onOpenChange={() => {
          setOpen('delete')
        }}
        handleConfirm={() => {
          setOpen(null)
          // router.delete(destroy(String(currentRow!.id)))
        }}
        className="max-w-md"
        // title={`Hapus data ini: ${String(currentRow!.name)} ?`}
        desc={
          <>
            {/* Kamu akan menghapus <strong>{String(currentRow!.name)}</strong>.{' '} */}
            <br />
            Tindakan ini tidak dapat dibatalkan.
          </>
        }
        confirmText="Hapus"
      />
    </>
  )
}
