export function AppLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-[var(--shadow-soft-lg)]"
        aria-hidden
      >
        FP
      </div>
      <div className="space-y-2 text-center">
        <p className="text-lg font-semibold tracking-tight">FitPulse</p>
        <p className="text-sm text-muted-foreground">Loading your workspace…</p>
      </div>
      <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
      </div>
    </div>
  )
}
