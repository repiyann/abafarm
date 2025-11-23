import { ConfirmDialog } from '../molecules/confirm-dialog'
import { TableImportDialog } from './table-import-dialog'
import { TableContextType } from './table-provider'
import { router } from '@inertiajs/react'
import { destroy } from '@/actions/App/Http/Controllers/Feeders/SilageController'

export function TableDialogs<T>({
  useTable,
  renderMutate,
}: {
  useTable: () => TableContextType<T>
  renderMutate?: (props: {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow?: T | null
    clearCurrentRow: () => void
  }) => React.ReactNode
}) {
  const { open, setOpen, currentRow, setCurrentRow } = useTable()
  const isMutateOpen = open === 'create' || open === 'update'

  function onMutateOpenChange(v: boolean) {
    if (v) {
      // open mutate drawer: if there's a currentRow, treat as update, otherwise create
      setOpen(currentRow ? 'update' : 'create')
    } else {
      // close and clear current row after animation
      setOpen(null)
    }
  }

  return (
    <>
      {renderMutate?.({
        open: isMutateOpen,
        onOpenChange: onMutateOpenChange,
        currentRow,
        clearCurrentRow: () => setCurrentRow(null),
      })}

      <TableImportDialog
        key="tasks-import"
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
      />

      {currentRow && (
        <>
          {renderMutate?.({
            open: isMutateOpen,
            onOpenChange: onMutateOpenChange,
            currentRow,
            clearCurrentRow: () => setCurrentRow(null),
          })}

          <ConfirmDialog
            key="task-delete"
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
            }}
            handleConfirm={() => {
              setOpen(null)
              router.delete(destroy(currentRow.id))
            }}
            className="max-w-md"
            title={`Hapus data ini: ${String(currentRow.name)} ?`}
            desc={
              <>
                Kamu akan menghapus <strong>{String(currentRow.name)}</strong>.{' '}
                <br />
                Tindakan ini tidak dapat dibatalkan.
              </>
            }
            confirmText="Hapus"
          />
        </>
      )}
    </>
  )
}
