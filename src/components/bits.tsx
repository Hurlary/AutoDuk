import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { ClaimStatus, CustomerStatus, LeadStatus, TicketStatus } from '@/types'

/** 3x3 square-grid brand mark */
export function SquaresMark({ className }: { className?: string }) {
  return (
    <span className={cn('grid w-max grid-cols-3 gap-[2px]', className)} aria-hidden>
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} className={cn('h-[3px] w-[3px]', i === 4 ? 'bg-primary' : 'bg-current opacity-70')} />
      ))}
    </span>
  )
}

const CHIP_STYLES: Record<string, string> = {
  // lead statuses
  new: 'bg-[#2e54fe]/10 text-[#2e54fe]',
  contacted: 'bg-[#f99e76]/25 text-[#9a4a1f]',
  qualified: 'bg-[#ffbc95]/40 text-[#8a4a12]',
  converted: 'bg-[#2f7d4f]/12 text-[#2f7d4f]',
  lost: 'bg-[#96908c]/15 text-[#6b6663]',
  // claim statuses
  submitted: 'bg-[#96908c]/15 text-[#6b6663]',
  under_review: 'bg-[#f99e76]/25 text-[#9a4a1f]',
  info_requested: 'bg-[#ffbc95]/40 text-[#8a4a12]',
  approved: 'bg-[#2e54fe]/10 text-[#2e54fe]',
  paid: 'bg-[#2f7d4f]/10 text-[#2f7d4f]',
  denied: 'bg-[#c2402a]/10 text-[#c2402a]',
  // customer statuses
  active: 'bg-[#2f7d4f]/12 text-[#2f7d4f]',
  past_due: 'bg-[#f99e76]/25 text-[#9a4a1f]',
  cancelled: 'bg-[#96908c]/15 text-[#6b6663]',
  // ticket statuses
  open: 'bg-[#2e54fe]/10 text-[#2e54fe]',
  in_progress: 'bg-[#f99e76]/25 text-[#9a4a1f]',
  resolved: 'bg-[#2f7d4f]/12 text-[#2f7d4f]',
}

export function StatusChip({ status, className }: { status: LeadStatus | ClaimStatus | CustomerStatus | TicketStatus; className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-[3px] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em]',
      CHIP_STYLES[status], className,
    )}>
      <span className="h-1.5 w-1.5 bg-current" aria-hidden />
      {status.replace('_', ' ')}
    </span>
  )
}

export function Kpi({ label, value, sub, mono = true }: { label: string; value: string; sub?: string; mono?: boolean }) {
  return (
    <div className="border border-border bg-card px-4 py-3.5">
      <div className="micro-label">{label}</div>
      <div className={cn('mt-1.5 text-[26px] font-semibold leading-none tracking-tight', mono && 'tnum')}>{value}</div>
      {sub && <div className="mt-1.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  )
}

export function InfoBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="micro-label">{label}</div>
      <div className="mt-0.5 text-[15px]">{children}</div>
    </div>
  )
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-border px-6 py-14 text-center">
      <SquaresMark className="text-muted-foreground" />
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="max-w-[42ch] text-sm text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function PageHeader({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="mb-1.5 flex items-center gap-2">
          <SquaresMark className="text-foreground" />
          <span className="micro-label">AutoDuk CRM</span>
        </div>
        <h1 className="text-[26px] leading-tight">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
