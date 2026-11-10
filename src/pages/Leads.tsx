import { useMemo, useState } from 'react'
import { Calculator, Globe, Megaphone, Plus, UserPlus } from 'lucide-react'
import { useStore, timeAgo } from '@/lib/store'
import { LEAD_STAGES, type Lead, type LeadStatus } from '@/types'
import { PageHeader, StatusChip, InfoBlock } from '@/components/bits'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const SOURCE_ICON = { website: Globe, calculator: Calculator, referral: UserPlus, ad: Megaphone }

export function LeadsPage() {
  const { leads, moveLead } = useStore()
  const [dragId, setDragId] = useState<string | null>(null)
  const [overStage, setOverStage] = useState<LeadStatus | null>(null)
  const [openLead, setOpenLead] = useState<Lead | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const columns = useMemo(
    () => LEAD_STAGES.map((s) => ({ ...s, leads: leads.filter((l) => l.status === s.id) })),
    [leads],
  )

  return (
    <div>
      <PageHeader title="Lead pipeline" sub="Everyone who raised a hand — drag cards between stages or open one to work it.">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-[3px] font-semibold"><Plus className="mr-1.5 h-4 w-4" /> Add lead</Button>
          </DialogTrigger>
          <DialogContent className="rounded-[4px]">
            <DialogHeader><DialogTitle>Add a lead manually</DialogTitle><DialogDescription className="sr-only">Create a lead from a call or walk-in.</DialogDescription></DialogHeader>
            <AddLeadForm onDone={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {columns.map((col) => (
          <section
            key={col.id}
            onDragOver={(e) => { e.preventDefault(); setOverStage(col.id) }}
            onDragLeave={() => setOverStage((s) => (s === col.id ? null : s))}
            onDrop={(e) => {
              e.preventDefault()
              if (dragId) {
                const lead = leads.find((l) => l.id === dragId)
                if (lead && lead.status !== col.id) {
                  moveLead(dragId, col.id)
                  toast.success(`${lead.name} → ${col.label}`)
                }
              }
              setDragId(null)
              setOverStage(null)
            }}
            className={cn(
              'flex min-h-[180px] flex-col border bg-card transition-colors duration-150',
              overStage === col.id ? 'border-primary bg-primary/5' : 'border-border',
            )}
          >
            <header className="flex items-center justify-between border-b border-border px-3 py-2.5">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em]">{col.label}</h2>
              <span className="tnum text-[13px] font-semibold text-muted-foreground">{col.leads.length}</span>
            </header>
            <div className="flex-1 space-y-2 p-2">
              {col.leads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} onOpen={() => setOpenLead(lead)} onDragStart={() => setDragId(lead.id)} onDragEnd={() => { setDragId(null); setOverStage(null) }} />
              ))}
              {col.leads.length === 0 && (
                <p className="px-2 py-6 text-center text-xs text-muted-foreground">Drop leads here</p>
              )}
            </div>
          </section>
        ))}
      </div>

      <LeadDrawer lead={openLead} onClose={() => setOpenLead(null)} />
    </div>
  )
}

function LeadCard({ lead, onOpen, onDragStart, onDragEnd }: {
  lead: Lead; onOpen: () => void; onDragStart: () => void; onDragEnd: () => void
}) {
  const Icon = SOURCE_ICON[lead.source]
  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="group cursor-grab border border-border bg-background p-3 transition-shadow duration-150 hover:shadow-[0_2px_0_0_#2e54fe] active:cursor-grabbing"
    >
      <button onClick={onOpen} className="w-full text-left focus-visible:outline-2 focus-visible:outline-primary">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[14px] font-semibold leading-snug">{lead.name}</h3>
          <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-label={`source: ${lead.source}`} />
        </div>
        <p className="tnum mt-0.5 truncate text-xs text-muted-foreground">{lead.email}</p>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{lead.state ?? '—'}{lead.newDeductible ? ` · $${lead.newDeductible} ded.` : ''}</span>
          <span>{timeAgo(lead.createdAt)}</span>
        </div>
        {lead.notes.length > 0 && (
          <p className="mt-1.5 border-t border-border pt-1.5 text-xs text-muted-foreground">
            {lead.notes.length} note{lead.notes.length > 1 ? 's' : ''}
          </p>
        )}
      </button>
    </article>
  )
}

function LeadDrawer({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
  const { staff, moveLead, assignLead, addLeadNote, staffById } = useStore()
  const [note, setNote] = useState('')

  return (
    <Sheet open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto rounded-none bg-background sm:max-w-md">
        <SheetDescription className="sr-only">Lead details, notes, and actions</SheetDescription>
        {lead && (
          <>
            <SheetHeader className="mb-4">
              <div className="flex items-center gap-3">
                <SheetTitle className="text-xl">{lead.name}</SheetTitle>
                <StatusChip status={lead.status} />
              </div>
              <p className="tnum text-sm text-muted-foreground">{lead.email}{lead.phone ? ` · ${lead.phone}` : ''}</p>
            </SheetHeader>

            <div className="grid grid-cols-2 gap-4 border-y border-border py-4">
              <InfoBlock label="Source"><span className="capitalize">{lead.source}</span></InfoBlock>
              <InfoBlock label="State">{lead.state ?? '—'}</InfoBlock>
              <InfoBlock label="Current deductible">{lead.currentDeductible ? `$${lead.currentDeductible.toLocaleString()}` : '—'}</InfoBlock>
              <InfoBlock label="Considering">{lead.newDeductible ? `$${lead.newDeductible.toLocaleString()} deductible` : '—'}</InfoBlock>
              <InfoBlock label="Annual premium">{lead.annualPremium ? `$${lead.annualPremium.toLocaleString()}` : '—'}</InfoBlock>
              <InfoBlock label="In pipeline">{timeAgo(lead.createdAt)}</InfoBlock>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <Label className="micro-label">Assign to</Label>
                <Select value={lead.assignedTo ?? 'unassigned'} onValueChange={(v) => assignLead(lead.id, v === 'unassigned' ? undefined : v)}>
                  <SelectTrigger className="mt-1 rounded-[3px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {staff.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="micro-label">Move to stage</Label>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {LEAD_STAGES.filter((s) => s.id !== lead.status).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { moveLead(lead.id, s.id); toast.success(`Moved to ${s.label}`) }}
                      className="rounded-[3px] border border-border px-2.5 py-1 text-[13px] font-medium transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="micro-label">Notes</Label>
                <ul className="mt-1.5 space-y-2">
                  {lead.notes.map((n) => (
                    <li key={n.id} className="border-l-2 border-accent bg-card px-3 py-2 text-sm">
                      <p>{n.body}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{n.author} · {timeAgo(n.at)}</p>
                    </li>
                  ))}
                  {lead.notes.length === 0 && <li className="text-sm text-muted-foreground">No notes yet.</li>}
                </ul>
                <div className="mt-2 flex gap-2">
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note…"
                    className="min-h-[64px] rounded-[3px] bg-card text-sm"
                  />
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-2 rounded-[3px]"
                  disabled={!note.trim()}
                  onClick={() => { addLeadNote(lead.id, note.trim()); setNote(''); toast.success('Note added') }}
                >
                  Add note
                </Button>
              </div>

              <p className="pt-2 text-xs text-muted-foreground">
                Assigned to {lead.assignedTo ? staffById(lead.assignedTo)?.name : 'no one'} · Lead converts automatically when checkout completes.
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function AddLeadForm({ onDone }: { onDone: () => void }) {
  const { addLead } = useStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [state, setState] = useState('')
  const [source, setSource] = useState<Lead['source']>('website')
  const [err, setErr] = useState('')

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        if (name.trim().length < 2) return setErr('Name is required.')
        if (!email.includes('@')) return setErr('A valid email is required.')
        addLead({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, state: state.trim() || undefined, source })
        toast.success('Lead added to New')
        onDone()
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="nl-name">Full name</Label>
        <Input id="nl-name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-[3px]" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="nl-email">Email</Label>
        <Input id="nl-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-[3px]" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="nl-phone">Phone</Label>
          <Input id="nl-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-[3px]" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nl-state">State</Label>
          <Input id="nl-state" value={state} onChange={(e) => setState(e.target.value)} maxLength={2} placeholder="TX" className="rounded-[3px]" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Source</Label>
        <Select value={source} onValueChange={(v) => setSource(v as Lead['source'])}>
          <SelectTrigger className="rounded-[3px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(['website', 'calculator', 'referral', 'ad'] as const).map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onDone} className="rounded-[3px]">Cancel</Button>
        <Button type="submit" className="rounded-[3px] font-semibold">Add lead</Button>
      </div>
    </form>
  )
}
