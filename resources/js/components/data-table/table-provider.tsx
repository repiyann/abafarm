import useDialogState from '@/hooks/use-dialog-state'
import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'

type TableDialogType = 'create' | 'update' | 'delete' | 'import'

export type TableContextType<T> = {
  open: TableDialogType | null
  setOpen: (str: TableDialogType | null) => void
  currentRow: T | null
  setCurrentRow: Dispatch<SetStateAction<T | null>>
}

/**
 * Factory to create a typed Tasks context for a specific row type T.
 * Usage:
 *   const { TasksProvider, useTasks } = createTasksContext<MyRowType>()
 */
export function createTableContext<T>() {
  const TableContext = createContext<TableContextType<T> | null>(null)

  function TableProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useDialogState<TableDialogType>(null)
    const [currentRow, setCurrentRow] = useState<T | null>(null)

    return (
      <TableContext.Provider
        value={{ open, setOpen, currentRow, setCurrentRow }}
      >
        {children}
      </TableContext.Provider>
    )
  }

  function useTable() {
    const tableContext = useContext(TableContext)

    if (!tableContext) {
      throw new Error(
        'useTable has to be used within a TableProvider created by createTableContext',
      )
    }

    return tableContext
  }

  return { TableProvider, useTable }
}
