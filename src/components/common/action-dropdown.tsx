import type { ReactNode } from "react"
import { Eye, MoreVertical, Pencil, RefreshCw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/utils/cn"

export interface ActionDropdownProps {
  onView?: () => void
  onEdit?: () => void
  onRenew?: () => void
  onDelete?: () => void
  /** Shown before the ⋮ trigger (e.g. secondary quick action) */
  extra?: ReactNode
  className?: string
  align?: "start" | "center" | "end"
}

export function ActionDropdown({
  onView,
  onEdit,
  onRenew,
  onDelete,
  extra,
  className,
  align = "end",
}: ActionDropdownProps) {
  const hasPrimary = onView || onEdit || onRenew

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-end gap-1",
        className,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {extra}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Open row actions"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          className="w-44 rounded-xl p-1"
        >
          {onView ? (
            <DropdownMenuItem
              className="gap-2 rounded-lg py-2.5"
              onSelect={() => onView()}
            >
              <Eye className="h-4 w-4 opacity-80" />
              View
            </DropdownMenuItem>
          ) : null}
          {onEdit ? (
            <DropdownMenuItem
              className="gap-2 rounded-lg py-2.5"
              onSelect={() => onEdit()}
            >
              <Pencil className="h-4 w-4 opacity-80" />
              Edit
            </DropdownMenuItem>
          ) : null}
          {onRenew ? (
            <DropdownMenuItem
              className="gap-2 rounded-lg py-2.5"
              onSelect={() => onRenew()}
            >
              <RefreshCw className="h-4 w-4 opacity-80" />
              Renew membership
            </DropdownMenuItem>
          ) : null}
          {onDelete ? (
            <>
              {hasPrimary ? <DropdownMenuSeparator className="my-1" /> : null}
              <DropdownMenuItem
                className="gap-2 rounded-lg py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive"
                onSelect={() => onDelete()}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
