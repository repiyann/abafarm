'use client'

import { ConfirmDialog } from '@/components/molecules/confirm-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn, getPageNumbers, sleep } from '@/lib/utils'
import { PaginatedResponse } from '@/types'
import { router } from '@inertiajs/react'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'
import { AlertTriangle, ChevronDown, Download, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { bulkDestroy } from '@/actions/App/Http/Controllers/Feeders/SilageController'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: PaginatedResponse<TData>
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState<{ [key: string]: boolean }>(
    {},
  )
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [searchValue, setSearchValue] = useState<string>('')
  const [value, setValue] = useState<string>('')
  const [announcement, setAnnouncement] = useState<string>('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const toolbarRef = useRef<HTMLDivElement>(null)
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null)
  const CONFIRM_WORD = 'HAPUS'

  const table = useReactTable({
    data: data.data,
    columns,
    rowCount: data.total,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableRowSelection: true,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
  })

  useEffect(() => {
    const serverPageIndex = data?.current_page ? data.current_page - 1 : 0
    const serverPageSize = data?.per_page ?? 10
    setPagination((prev) => {
      if (
        prev.pageIndex !== serverPageIndex ||
        prev.pageSize !== serverPageSize
      ) {
        return { pageIndex: serverPageIndex, pageSize: serverPageSize }
      }
      return prev
    })
  }, [data?.current_page, data?.per_page])

  useEffect(() => {
    if (sorting.length > 0) {
      const sort = sorting[0]
      router.get(
        data.path,
        {
          page: 1,
          per_page: table.getState().pagination.pageSize,
          sort_by: sort.id,
          sort_order: sort.desc ? 'desc' : 'asc',
          search: searchValue || undefined,
        },
        {
          preserveState: true,
          preserveScroll: true,
        },
      )
    }
  }, [sorting])

  function handleSearch(value: string) {
    setSearchValue(value)

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }

    searchTimerRef.current = setTimeout(() => {
      router.get(
        data.path,
        {
          page: 1,
          per_page: table.getState().pagination.pageSize,
          search: value || undefined,
          sort_by: sorting[0]?.id,
          sort_order: sorting[0]?.desc ? 'desc' : 'asc',
        },
        {
          preserveState: true,
          preserveScroll: true,
        },
      )
    }, 500)
  }

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }
    }
  }, [])

  const currentPage = table.getState().pagination.pageIndex
  const pageCount = table.getPageCount()
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length

  // Announce selection changes to screen readers
  useEffect(() => {
    if (selectedCount > 0) {
      const message = `${selectedCount} data dipilih. Toolbar aksi massal tersedia.`

      // Use queueMicrotask to defer state update and avoid cascading renders
      queueMicrotask(() => {
        setAnnouncement(message)
      })

      // Clear announcement after a delay
      const timer = setTimeout(() => setAnnouncement(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [selectedCount])

  function handleBulkExport() {
    const selectedTasks = selectedRows.map((row) => row.original as TData)
    toast.promise(sleep(2000), {
      loading: `Mengekspor data...`,
      success: () => {
        table.resetRowSelection()
        return `Berhasil mengekspor ${selectedTasks.length} data ke CSV.`
      },
      error: 'Gagal mengekspor',
    })
    table.resetRowSelection()
  }

  function handleDelete() {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Tolong ketik "${CONFIRM_WORD}" untuk mengonfirmasi.`)
      return
    }

    setShowDeleteConfirm(false)

    const selectedIds = selectedRows.map((row) => (row.original as TData).id)

    router.delete(bulkDestroy(), {
      data: { ids: selectedIds },
      preserveScroll: true,
      onSuccess: () => {
        toast.success(`Berhasil menghapus ${selectedRows.length} data.`)
        table.resetRowSelection()
        setValue('')
      },
      onError: (errors) => {
        toast.error('Gagal menghapus data.')
        console.error(errors)
      },
    })
  }

  return (
    <div className="w-full">
      <div className="flex items-center pb-4">
        <Input
          placeholder="Cari data..."
          onChange={(e) => handleSearch(e.target.value)}
          value={searchValue}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Kolom <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Tidak ada hasil.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between gap-1 py-4">
        <div className="flex items-center gap-2 @max-2xl/content:flex-row-reverse">
          <Select
            value={`${data.per_page}`}
            onValueChange={(value) => {
              const per_page = Number(value)
              table.setPageSize(per_page)
              router.get(data.path, {
                per_page,
                page: 1,
                search: searchValue || undefined,
                sort_by: sorting[0]?.id,
                sort_order: sorting[0]?.desc ? 'desc' : 'asc',
              })
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="hidden text-sm font-medium sm:block">
            Baris per halaman
          </p>
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <Button
              disabled={data.prev_page_url === null}
              size="sm"
              variant="outline"
              className="cursor-pointer"
              onClick={() => {
                router.get(data.prev_page_url ?? '#', {
                  per_page: table.getState().pagination.pageSize,
                  search: searchValue || undefined,
                  sort_by: sorting[0]?.id,
                  sort_order: sorting[0]?.desc ? 'desc' : 'asc',
                })
              }}
            >
              Sebelumnya
            </Button>
            {getPageNumbers(currentPage, pageCount).map((page, index) =>
              typeof page === 'number' ? (
                <Button
                  className="h-8 w-8 cursor-pointer p-0"
                  key={index}
                  disabled={currentPage === page}
                  onClick={() => {
                    router.get(data.path, {
                      page: page + 1,
                      per_page: table.getState().pagination.pageSize,
                      search: searchValue || undefined,
                      sort_by: sorting[0]?.id,
                      sort_order: sorting[0]?.desc ? 'desc' : 'asc',
                    })
                  }}
                  size="sm"
                  variant={currentPage === page ? 'default' : 'outline'}
                >
                  {page + 1}
                </Button>
              ) : (
                <span className="px-2" key={index}>
                  {page}
                </span>
              ),
            )}
            <Button
              disabled={data.next_page_url === null}
              size="sm"
              variant="outline"
              className="cursor-pointer"
              onClick={() => {
                router.get(data.next_page_url ?? '#', {
                  per_page: table.getState().pagination.pageSize,
                  search: searchValue || undefined,
                  sort_by: sorting[0]?.id,
                  sort_order: sorting[0]?.desc ? 'desc' : 'asc',
                })
              }}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      </div>

      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {announcement}
      </div>

      {selectedCount > 0 && (
        <div
          ref={toolbarRef}
          role="toolbar"
          aria-label={`Aksi massal untuk ${selectedCount} data yang dipilih`}
          aria-describedby="bulk-actions-description"
          tabIndex={-1}
          className={cn(
            'fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl',
            'transition-all delay-100 duration-300 ease-out hover:scale-105',
            'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none',
          )}
        >
          <div
            className={cn(
              'p-2 shadow-xl',
              'rounded-xl border',
              'bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60',
              'flex items-center gap-x-2',
            )}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.resetRowSelection()}
                  className="size-6 rounded-full"
                  aria-label="Hapus pilihan"
                  title="Hapus pilihan"
                >
                  <X />
                  <span className="sr-only">Hapus pilihan</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Hapus pilihan (Escape)</p>
              </TooltipContent>
            </Tooltip>

            <Separator
              className="h-5"
              orientation="vertical"
              aria-hidden="true"
            />

            <div
              className="flex items-center gap-x-1 text-sm"
              id="bulk-actions-description"
            >
              <Badge
                variant="default"
                className="min-w-8 rounded-lg"
                aria-label={`${selectedCount} dipilih`}
              >
                {selectedCount}
              </Badge>{' '}
              <span className="hidden sm:inline">data</span> dipilih
            </div>

            <Separator
              className="h-5"
              orientation="vertical"
              aria-hidden="true"
            />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleBulkExport()}
                  className="size-8"
                  aria-label={`Ekspor data`}
                  title={`Ekspor data`}
                >
                  <Download />
                  <span className="sr-only">Ekspor data</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ekspor data</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="size-8"
                  aria-label={`Hapus data yang dipilih`}
                  title={`Hapus data yang dipilih`}
                >
                  <Trash2 />
                  <span className="sr-only">Hapus data yang dipilih</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Hapus data yang dipilih</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        handleConfirm={handleDelete}
        disabled={value.trim() !== CONFIRM_WORD}
        title={
          <span className="text-destructive">
            <AlertTriangle
              className="me-1 inline-block stroke-destructive"
              size={18}
            />{' '}
            Hapus {selectedRows.length} data
          </span>
        }
        desc={
          <div className="space-y-4">
            <p className="mb-2">
              Apakah Anda yakin ingin menghapus data yang dipilih? <br />
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <Label className="my-4 flex flex-col items-start gap-1.5">
              <span className="">
                Konfirmasi dengan mengetik "{CONFIRM_WORD}":
              </span>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`Ketik "${CONFIRM_WORD}" untuk konfirmasi.`}
              />
            </Label>

            <Alert variant="destructive">
              <AlertTitle>Peringatan!</AlertTitle>
              <AlertDescription>
                Harap berhati-hati, operasi ini tidak dapat dikembalikan.
              </AlertDescription>
            </Alert>
          </div>
        }
        confirmText="Hapus"
        destructive
      />
    </div>
  )
}
