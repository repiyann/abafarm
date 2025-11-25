import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FeedsProps } from '@/types'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'

export const columns: ColumnDef<FeedsProps>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'nama_pakan',
    // enableColumnFilter: true,
    // filterFn: (row, id, filterValues) => {
    //   const cell = row.getValue(id)
    //   if (
    //     !filterValues ||
    //     (Array.isArray(filterValues) && filterValues.length === 0)
    //   )
    //     return true
    //   return Array.isArray(filterValues)
    //     ? filterValues.includes(cell)
    //     : filterValues === cell
    // },
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="text-lg"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Nama Pakan
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-base font-medium">{row.getValue('nama_pakan')}</div>
    ),
  },
  {
    accessorKey: 'asal',
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="text-lg"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Sumber / Asal
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-base capitalize">{row.getValue('asal')}</div>
    ),
  },
  {
    accessorKey: 'jumlah',
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="text-lg"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Jumlah
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-base">{row.getValue('jumlah')} kg</div>
    ),
  },
  {
    accessorKey: 'harga',
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="text-lg"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Harga
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue('harga') as number
      const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(value)

      return <div className="text-base">{formatted}</div>
    },
  },
  {
    accessorKey: 'tanggal_beli',
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="text-lg"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Tanggal Pembelian
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue('tanggal_beli') as string
      const date = new Date(value)
      const formatted = isNaN(date.getTime())
        ? value
        : date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })

      return <div className="text-base text-muted-foreground">{formatted}</div>
    },
  },
]
