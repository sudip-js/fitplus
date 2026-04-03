import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { format, formatDistanceToNow } from "date-fns"
import activity from "@/data/mock-activity.json"
import { ChartCard } from "@/components/charts/chart-card"
import { RevenueExpenseChart } from "@/components/charts/revenue-expense-chart"
import { EmptyState } from "@/components/layout/empty-state"
import { KpiCard } from "@/components/layout/kpi-card"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useExpenseStore } from "@/store/useExpenseStore"
import { useMemberStore } from "@/store/useMemberStore"
import { usePaymentStore } from "@/store/usePaymentStore"
import type { ActivityItem } from "@/types"
import { buildRevenueExpenseSeries } from "@/utils/dashboard-metrics"
import { formatDateIN, formatINR, monthKey, todayISO } from "@/utils/locale-in"
import { daysUntilExpiry, memberHasDuePayment } from "@/utils/member-insights"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CreditCard,
  IndianRupee,
  Landmark,
  Receipt,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react"

export function DashboardPage() {
  const members = useMemberStore((s) => s.members)
  const payments = usePaymentStore((s) => s.payments)
  const expenses = useExpenseStore((s) => s.expenses)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 450)
    return () => window.clearTimeout(t)
  }, [])

  const mk = monthKey()
  const today = todayISO()

  const paidPayments = useMemo(
    () => payments.filter((p) => p.status === "paid"),
    [payments],
  )

  const todayCollection = useMemo(
    () =>
      paidPayments
        .filter((p) => p.date === today)
        .reduce((a, p) => a + p.amount, 0),
    [paidPayments, today],
  )

  const monthlyRevenue = useMemo(
    () =>
      paidPayments
        .filter((p) => p.date.startsWith(mk))
        .reduce((a, p) => a + p.amount, 0),
    [paidPayments, mk],
  )

  const monthlyExpenses = useMemo(
    () =>
      expenses
        .filter((e) => e.date.startsWith(mk))
        .reduce((a, e) => a + e.amount, 0),
    [expenses, mk],
  )

  const netProfitMonth = monthlyRevenue - monthlyExpenses

  const totalMembers = members.length
  const activeMembers = members.filter((m) => m.status === "active").length
  const inactiveMembers = members.filter(
    (m) => m.status === "paused" || m.status === "churned",
  ).length

  const expiringSoon = members.filter((m) => {
    const d = daysUntilExpiry(m.expiresAt)
    return d >= 0 && d <= 30
  }).length

  const pendingPaymentsCount = payments.filter(
    (p) => p.status === "pending" || p.status === "overdue",
  ).length

  const membersWithDue = members.filter((m) =>
    memberHasDuePayment(m.id, payments),
  ).length

  const chartData = useMemo(
    () => buildRevenueExpenseSeries(payments, expenses, 6),
    [payments, expenses],
  )

  const recentPayments = useMemo(
    () =>
      [...payments]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 6),
    [payments],
  )

  const recentExpenses = useMemo(
    () =>
      [...expenses]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 4),
    [expenses],
  )

  const items = activity as ActivityItem[]

  const hasAlerts =
    pendingPaymentsCount > 0 || expiringSoon > 0 || inactiveMembers > 0

  return (
    <div className="space-y-10">
      <PageHeader
        title="Dashboard"
        description="Today’s cash, monthly P&amp;L, and renewal signals — tuned for Indian gyms."
      />

      {hasAlerts && !loading ? (
        <div
          role="status"
          className="flex gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 dark:bg-amber-500/15"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400" />
          <div className="min-w-0 space-y-2">
            <p className="font-medium leading-none text-foreground">
              Needs attention
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {pendingPaymentsCount > 0 ? (
                <li>
                  {pendingPaymentsCount} payment
                  {pendingPaymentsCount === 1 ? "" : "s"} pending or overdue —{" "}
                  <Link
                    to="/payments"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    collect now
                  </Link>
                </li>
              ) : null}
              {expiringSoon > 0 ? (
                <li>
                  {expiringSoon} membership
                  {expiringSoon === 1 ? "" : "s"} expiring in 30 days
                </li>
              ) : null}
              {inactiveMembers > 0 ? (
                <li>
                  {inactiveMembers} inactive member
                  {inactiveMembers === 1 ? "" : "s"} (paused / churned)
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          <>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-[132px] w-full" />
            ))}
          </>
        ) : (
          <>
            <KpiCard
              title="Today’s collection"
              value={formatINR(todayCollection)}
              hint="Paid payments dated today"
              icon={IndianRupee}
              trend={{ label: "Cash + UPI + card", positive: true }}
            />
            <KpiCard
              title="Monthly revenue"
              value={formatINR(monthlyRevenue)}
              hint={format(new Date(), "MMMM yyyy")}
              icon={TrendingUp}
              trend={{ label: "Completed collections", positive: true }}
            />
            <KpiCard
              title="Monthly expenses"
              value={formatINR(monthlyExpenses)}
              hint="Rent, salary, utilities…"
              icon={Receipt}
              trend={{ label: "This calendar month", positive: false }}
            />
            <KpiCard
              title="Net profit"
              value={formatINR(netProfitMonth)}
              hint="Revenue − expenses (this month)"
              icon={Landmark}
              trend={{
                label: netProfitMonth >= 0 ? "Healthy margin" : "Review costs",
                positive: netProfitMonth >= 0,
              }}
            />
            <KpiCard
              title="Total members"
              value={String(totalMembers)}
              hint="All-time roster"
              icon={Users}
            />
            <KpiCard
              title="Active members"
              value={String(activeMembers)}
              hint="Status: active"
              icon={UserCheck}
            />
            <KpiCard
              title="Due payments (members)"
              value={String(membersWithDue)}
              hint="Has pending / overdue bills"
              icon={CreditCard}
              trend={
                membersWithDue > 0
                  ? { label: "Follow up today", positive: false }
                  : { label: "All clear", positive: true }
              }
            />
            <KpiCard
              title="Expiring soon"
              value={String(expiringSoon)}
              hint="Within 30 days"
              icon={Sparkles}
              trend={
                expiringSoon > 0
                  ? { label: "Renewal calls", positive: false }
                  : { label: "No rush", positive: true }
              }
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ChartCard
            title="Revenue vs expenses"
            description="Last six months — paid collections vs logged spend."
          >
            <RevenueExpenseChart data={chartData} />
          </ChartCard>

          <Card className="shadow-[var(--shadow-soft)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4 text-primary" />
                Recent payments
              </CardTitle>
              <Button variant="ghost" size="sm" className="rounded-xl" asChild>
                <Link to="/payments">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {recentPayments.length === 0 ? (
                <EmptyState
                  className="border-0 bg-transparent py-8"
                  icon={CreditCard}
                  title="No payments yet"
                  description="Record cash, UPI, or card collections in Payments."
                />
              ) : (
                <ScrollArea className="h-[260px] px-6 pb-6">
                  <ul className="space-y-3">
                    {recentPayments.map((p) => (
                      <li
                        key={p.id}
                        className="rounded-xl border border-border bg-muted/15 px-4 py-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium tabular-nums">
                              {formatINR(p.amount)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateIN(p.date)} ·{" "}
                              <span className="capitalize">{p.method}</span> ·{" "}
                              <span className="capitalize">{p.status}</span>
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-[var(--shadow-soft)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Receipt className="h-4 w-4 text-primary" />
                Recent expenses
              </CardTitle>
              <Button variant="ghost" size="sm" className="rounded-xl" asChild>
                <Link to="/expenses">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {recentExpenses.length === 0 ? (
                <EmptyState
                  className="border-0 bg-transparent py-8"
                  icon={Receipt}
                  title="No spend logged"
                  description="Add rent, electricity, or salary in Expenses."
                />
              ) : (
                <ScrollArea className="h-[280px] px-6 pb-6">
                  <ul className="space-y-3">
                    {recentExpenses.map((e) => (
                      <li
                        key={e.id}
                        className="rounded-xl border border-border bg-muted/15 px-4 py-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">{e.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateIN(e.date)}
                            </p>
                          </div>
                          <p className="text-sm font-semibold tabular-nums">
                            {formatINR(e.amount)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-soft)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-primary" />
                Recent activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {items.length === 0 ? (
                <EmptyState
                  className="border-0 bg-transparent"
                  icon={Activity}
                  title="No activity yet"
                  description="Activity will stream here when you connect a backend."
                />
              ) : (
                <ScrollArea className="h-[220px] px-6 pb-6">
                  <ul className="space-y-4">
                    {items.map((a) => (
                      <li
                        key={a.id}
                        className="rounded-xl border border-border bg-muted/15 px-4 py-3"
                      >
                        <p className="text-sm font-medium leading-snug">
                          {a.message}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(a.at), {
                            addSuffix: true,
                          })}
                        </p>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
