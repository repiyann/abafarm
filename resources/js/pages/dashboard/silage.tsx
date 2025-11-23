import { index } from '@/actions/App/Http/Controllers/Feeders/SilageController'
import { TableDialogs } from '@/components/data-table/table-dialogs'
import { TableMutateDrawer } from '@/components/data-table/table-mutate-drawer'
import { TablePrimaryButtons } from '@/components/data-table/table-primary-buttons'
import { createTableContext } from '@/components/data-table/table-provider'
import AppLayout from '@/layouts/app-layout'
import { cn } from '@/lib/utils'
import { BreadcrumbItem, SilagePaginatedResponse, SilageProps } from '@/types'
import { Head } from '@inertiajs/react'
import { useForm } from 'react-hook-form'
import { columns } from './data/columns'
import { DataTable } from './data/data-table'

export type PaymentForm = {
  amount: number
  status: 'pending' | 'processing' | 'success' | 'failed'
  email: string
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Silase',
    href: index().url,
  },
]
const { TableProvider, useTable } = createTableContext<SilageProps>()
export { useTable }

export default function Silage({
  paginatedData,
}: {
  paginatedData: SilagePaginatedResponse
}) {
  const form = useForm<PaymentForm>({
    defaultValues: { amount: 0, status: 'pending', email: '' },
  })

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <TableProvider>
        <main className={cn('flex flex-1 flex-col gap-4 px-4 py-6 sm:gap-6')}>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Silase</h2>
              <p className="text-muted-foreground">
                Ini adalah halaman silase.
              </p>
            </div>
            <TablePrimaryButtons useTable={useTable} />
          </div>
          <DataTable columns={columns} data={paginatedData} />
        </main>

        <TableDialogs
          useTable={useTable}
          renderMutate={({
            open,
            onOpenChange,
            currentRow,
            clearCurrentRow,
          }) => (
            <TableMutateDrawer<SilageProps, PaymentForm>
              key="task-create-or-update"
              open={open}
              onOpenChange={onOpenChange}
              currentRow={currentRow ?? undefined}
              form={form}
            >
              <form
                id="tasks-form"
                onSubmit={form.handleSubmit((data) => {
                  // handle submit: create/update logic here
                  console.log('submit', data, currentRow)
                  onOpenChange(false)
                  setTimeout(() => clearCurrentRow(), 500)
                })}
              >
                <div className="space-y-2 p-4">
                  <label className="block text-sm font-medium">Amount</label>
                  <input
                    type="number"
                    {...form.register('amount')}
                    className="w-full rounded border px-2 py-1"
                  />

                  <label className="mt-2 inline-flex items-center gap-2">
                    <input type="checkbox" {...form.register('status')} />
                    <span className="text-sm">Status</span>
                  </label>
                </div>
              </form>
            </TableMutateDrawer>
          )}
        />
      </TableProvider>
    </AppLayout>
  )
}
