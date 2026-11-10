import { useMemo } from 'react'
import { useStore, timeAgo } from '@/lib/store'
import { Kpi, PageHeader, StatusChip, EmptyState } from '@/components/bits'
import { CLAIM_STAGES } from '@/types'
import type { View } from '@/App'
import { cn } from '@/lib/utils'

export function DashboardPage({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { leads, customers, claims, tickets, plans, customerById } = useStore()

  const stats = useMemo(() => {
    const active = customers.filter((c) => c.status === 'active')
    const mrr = active.reduce((sum, c) => sum + (plans.find((p) => p.id === c.planId)?.monthlyPrice ?? 0), 0)
    const weekAgo = Date.now() - 7 * 864e5
    const newLeads = leads.filter((l) => new Date(l.createdAt).getTime() >= weekAgo).length
    const openClaims = claims.filter((c) => !['paid', 'denied'].includes(c.status))
    const resolved = claims.filter((c) => c.resolvedAt)
    const avgDays = resolved.length
      ? (resolved.reduce((s, c) => s + (new Date(c.resolvedAt!).getTime() - new Date(c.submittedAt).getTime()) / 864e5, 0) / resolved.length).toFixed(1)
      : '—'
    return { mrr, activeCount: active.length, newLeads, openClaims, avgDays }
  }, [leads, customers, claims, plans])

  const byStage = useMemo(() => {
    const max = Math.max(1, ...CLAIM_STAGES.map((s) => claims.filter((c) => c.status === s.id).length))
    return CLAIM_STAGES.map((s) => ({
      ...s,
      count: claims.filter((c) => c.status === s.id).length,
      pct: (claims.filter((c) => c.status === s.id).length / max) * 100,
    }))
  }, [claims])

  const activity = useMemo(() => {
    const items = claims.flatMap((c) =>
      c.timeline.map((t) => ({ ...t, ref: c.claimNumber })),
    )
    return items.sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 7)
  }, [claims])

  const queue = useMemo(
    () => claims.filter((c) => ['submitted', 'under_review', 'info_requested'].includes(c.status))
      .sort((a, b) => +new Date(a.submittedAt) - +new Date(b.submittedAt))
      .slice(0, 5),
    [claims],
  )

  return (
    <div>
      <PageHeader title="Operations overview" sub="Everything moving across sales, claims, and support right now." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="MRR" value={`$${stats.mrr}`} sub={`${stats.activeCount} active subscribers`} />
        <Kpi label="New leads (7d)" value={String(stats.newLeads)} sub="from site + calculator" />
        <Kpi label="Open claims" value={String(stats.openClaims.length)} sub="need review or payout" />
        <Kpi label="Avg. resolution" value={stats.avgDays === '—' ? '—' : `${stats.avgDays}d`} sub="submit → paid/denied" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Claims by stage */}
        <section className="border border-border bg-card p-5 lg:col-span-2">
          <h2 className="mb-4 text-[15px] font-semibold">Claims by stage</h2>
          <div className="space-y-2.5">
            {byStage.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-[13px] text-muted-foreground">{s.label}</span>
                <div className="h-4 flex-1 bg-secondary">
                  <div
                    className={cn('h-full transition-[width] duration-200', s.id === 'denied' ? 'bg-destructive' : 'bg-primary')}
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
                <span className="tnum w-6 text-right text-[13px] font-semibold">{s.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-border pt-3 text-[13px] text-muted-foreground">
            {tickets.filter((t) => t.status !== 'resolved').length} open support tickets ·{' '}
            {leads.filter((l) => l.status === 'new').length} untouched leads
          </div>
        </section>

        {/* Claims queue */}
        <section className="border border-border bg-card lg:col-span-3">
          <div className="flex items-center justify-between px-5 pb-2 pt-4">
            <h2 className="text-[15px] font-semibold">Claims queue</h2>
            <button
              onClick={() => onNavigate('claims')}
              className="text-[13px] font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-primary"
            >
              View all
            </button>
          </div>
          {queue.length === 0 ? (
            <div className="p-5"><EmptyState title="Queue is clear" hint="New claims appear here the moment a customer files." /></div>
          ) : (
            <ul className="divide-y divide-border">
              {queue.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => onNavigate('claims')}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-secondary/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                  >
                    <span className="tnum w-32 shrink-0 text-[13px] font-medium">{c.claimNumber}</span>
                    <span className="min-w-0 flex-1 truncate text-sm">{customerById(c.customerId)?.name}</span>
                    <span className="tnum hidden text-sm text-muted-foreground sm:block">${c.deductibleAmount.toLocaleString()}</span>
                    <StatusChip status={c.status} />
                    <span className="hidden w-16 text-right text-xs text-muted-foreground md:block">{timeAgo(c.submittedAt)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Activity */}
      <section className="mt-6 border border-border bg-card p-5">
        <h2 className="mb-3 text-[15px] font-semibold">Recent activity</h2>
        <ol className="space-y-2">
          {activity.map((a) => (
            <li key={a.id} className="flex items-baseline gap-3 text-sm">
              <span className="tnum w-20 shrink-0 text-xs text-muted-foreground">{timeAgo(a.at)}</span>
              <span className="tnum shrink-0 text-xs text-muted-foreground">{a.ref}</span>
              <span className="text-muted-foreground">{a.actor}</span>
              <span className="min-w-0 flex-1 truncate">{a.action}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
