import { useState } from 'react'
import { useStore, timeAgo } from '@/lib/store'
import type { TicketStatus } from '@/types'
import { EmptyState, PageHeader, StatusChip } from '@/components/bits'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function TicketsPage() {
  const { tickets, staff, assignTicket, setTicketStatus, customerById } = useStore()
  const [selectedId, setSelectedId] = useState<string | null>(tickets[0]?.id ?? null)
  const selected = tickets.find((t) => t.id === selectedId)

  const ordered = [...tickets].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))

  return (
    <div>
      <PageHeader title="Support inbox" sub="Contact-form messages from customers and visitors." />
      {tickets.length === 0 ? (
        <EmptyState title="Inbox zero" hint="Messages from the portal's contact form land here." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          {/* List */}
          <div className="border border-border bg-card lg:col-span-2">
            <ul className="divide-y divide-border">
              {ordered.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setSelectedId(t.id)}
                    aria-current={selectedId === t.id}
                    className={cn(
                      'flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary',
                      selectedId === t.id ? 'bg-accent/25' : 'hover:bg-secondary/60',
                    )}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="font-medium">{t.name}</span>
                      <StatusChip status={t.status} />
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{t.message}</p>
                    <p className="text-xs text-muted-foreground">{t.customerId ? 'Customer' : 'Visitor'} · {timeAgo(t.createdAt)}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Detail */}
          <div className="border border-border bg-card p-5 lg:col-span-3">
            {selected ? (
              <>
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold">{selected.name}</h2>
                  <StatusChip status={selected.status} />
                  {selected.customerId && (
                    <span className="text-xs text-muted-foreground">
                      Customer: {customerById(selected.customerId)?.name ?? 'record linked'}
                    </span>
                  )}
                </div>
                <p className="tnum text-sm text-muted-foreground">{selected.email}</p>
                <blockquote className="mt-4 border-l-2 border-accent bg-background px-4 py-3 text-[15px] leading-relaxed">
                  {selected.message}
                </blockquote>
                <p className="mt-2 text-xs text-muted-foreground">Received {timeAgo(selected.createdAt)} · reply by email for now; in-app replies arrive in a later version.</p>

                <div className="mt-5 space-y-3 border-t border-border pt-4">
                  <div>
                    <Label className="micro-label">Assign to</Label>
                    <Select
                      value={selected.assignedTo ?? 'unassigned'}
                      onValueChange={(v) => assignTicket(selected.id, v === 'unassigned' ? undefined : v)}
                    >
                      <SelectTrigger className="mt-1 max-w-[260px] rounded-[3px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {staff.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(['open', 'in_progress', 'resolved'] as TicketStatus[])
                      .filter((s) => s !== selected.status)
                      .map((s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant={s === 'resolved' ? 'default' : 'secondary'}
                          className="rounded-[3px] capitalize"
                          onClick={() => { setTicketStatus(selected.id, s); toast.success(`Ticket marked ${s.replace('_', ' ')}`) }}
                        >
                          Mark {s.replace('_', ' ')}
                        </Button>
                      ))}
                  </div>
                </div>
              </>
            ) : (
              <EmptyState title="Select a ticket" hint="Choose a message on the left to read and work it." />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
