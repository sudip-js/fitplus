import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { EmptyState } from "@/components/layout/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/utils/cn"

export interface DataTableColumn<T> {
  id: string
  header: ReactNode
  cell: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowId: (row: T) => string
  loading?: boolean
  emptyState?: {
    icon: LucideIcon
    title: string
    description: string
    action?: ReactNode
  }
  onRowClick?: (row: T) => void
  leadingColumns?: DataTableColumn<T>[]
  getRowClassName?: (row: T) => string | undefined
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  loading,
  emptyState,
  onRowClick,
  leadingColumns,
  getRowClassName,
}: DataTableProps<T>) {
  const allColumns = [...(leadingColumns ?? []), ...columns]

  if (loading) {
    return (
      <div className="space-y-2 rounded-xl border border-border p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (data.length === 0 && emptyState) {
    return (
      <EmptyState
        icon={emptyState.icon}
        title={emptyState.title}
        description={emptyState.description}
        action={emptyState.action}
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {allColumns.map((c) => (
            <TableHead key={c.id} className={c.className}>
              {c.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow
            key={getRowId(row)}
            className={cn(
              onRowClick && "cursor-pointer transition-colors duration-150",
              getRowClassName?.(row),
            )}
            onClick={() => onRowClick?.(row)}
          >
            {allColumns.map((c) => (
              <TableCell key={c.id} className={c.className}>
                {c.cell(row)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
