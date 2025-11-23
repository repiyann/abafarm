import { Button } from '@/components/ui/button'
import { Download, Plus } from 'lucide-react'
import { TableContextType } from './table-provider'

export function TablePrimaryButtons<T>({
  useTable,
}: {
  useTable: () => TableContextType<T>
}) {
  const { setOpen } = useTable()
  return (
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
  )
}
