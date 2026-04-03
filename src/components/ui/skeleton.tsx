import { cn } from "@/utils/cn"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-muted dark:bg-muted/60",
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
