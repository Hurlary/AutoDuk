import { useMemo, useState } from 'react'
import { ArrowLeft, FileText, Image as ImageIcon, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useStore, fmtDate, timeAgo } from '@/lib/store'
import { CLAIM_STAGES, type Claim, type ClaimStatus } from '@/types'
import { EmptyState, InfoBlock, PageHeader, StatusChip } from '@/components/bits'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function ClaimsPage() {
  const { claims } = useStore()
  const [filter, setFilter] = useState<'active' | ClaimStatus | 'all'>('active')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const list = filter === 'all' ? claims
      : filter === 'active' ? claims.filter((c) => !['paid', 'denied'].includes(c.status))
      : claims.filter((c) => c.status === filter)
    return [...list].sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt))
  }, [claims, filter])

  const selected = claims.find((c) => c.id === selectedId)
  if (selected) return <ClaimDetail claim={selected} onBack={() => setSelectedId(null)} />

  const counts = (id: ClaimStatus) => claims.filter((c) => c.status === id).length

  return (
    <div>
      <PageHeader title="Claims queue" sub="Eligibility is checked automatically against the 3-month tenure and 1-claim-per-year rules." />

      <div className="mb-4 flex flex-wrap gap-1.5" role="tablist" aria-label="Filter claims">
        {(['active', ...CLAIM_STAGES.map((s) => s.id), 'all'] as const).map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-[3px] border px-3 py-1.5 text-[13px] font-medium transition-colors duration-150',
              'focus-visible:outline-2 focus-visible:outline-primary',
              filter === f ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-foreground/30',
            )}
          >
            {f === 'active' ? 'Needs action' : f === 'all' ? 'All' : CLAIM_STAGES.find((s) => s.id === f)?.label}
            <span className="tnum ml-1.5 opacity-70">
              {f === 'active' ? claims.filter((c) => !['paid', 'denied'].includes(c.status)).length : f === 'all' ? claims.length : counts(f as ClaimStatus)}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No claims in this view" hint="New submissions land here the moment a customer files from the portal." />
      ) : (
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="micro-label px-4 py-2.5 font-semibold">Claim</th>
                <th className="micro-label px-4 py-2.5 font-semibold">Customer</th>
                <th className="micro-label px-4 py-2.5 font-semibold">Vehicle</th>
                <th className="micro-label px-4 py-2.5 font-semibold">Deductible</th>
                <th className="micro-label px-4 py-2.5 font-semibold">Status</th>
                <th className="micro-label px-4 py-2.5 font-semibold">Eligibility</th>
                <th className="micro-label px-4 py-2.5 font-semibold">Filed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <ClaimRow key={c.id} claim={c} onOpen={() => setSelectedId(c.id)} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ClaimRow({ claim, onOpen }: { claim: Claim; onOpen: () => void }) {
  const { customerById, eligibilityFor } = useStore()
  const customer = customerById(claim.customerId)
  const elig = eligibilityFor(claim)
  const isFinal = ['paid', 'denied'].includes(claim.status)
  return (
    <tr
      onClick={onOpen}
      className="cursor-pointer transition-colors hover:bg-secondary/60 focus-visible:outline-2 focus-visible:outline-primary"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen() } }}
    >
      <td className="tnum px-4 py-3 font-medium">{claim.claimNumber}</td>
      <td className="px-4 py-3">{customer?.name ?? '—'}</td>
      <td className="px-4 py-3 text-muted-foreground">{claim.vehicleLabel}</td>
      <td className="tnum px-4 py-3">${claim.deductibleAmount.toLocaleString()}</td>
      <td className="px-4 py-3"><StatusChip status={claim.status} /></td>
      <td className="px-4 py-3">
        {isFinal ? <span className="text-xs text-muted-foreground">—</span> : elig.eligible
          ? <span className="inline-flex items-center gap-1 text-[13px] font-medium text-[#2f7d4f]"><ShieldCheck className="h-3.5 w-3.5" /> Eligible</span>
          : <span className="inline-flex items-center gap-1 text-[13px] font-medium text-destructive"><ShieldAlert className="h-3.5 w-3.5" /> Blocked</span>}
      </td>
      <td className="px-4 py-3 text-muted-foreground">{timeAgo(claim.submittedAt)}</td>
    </tr>
  )
}

function ClaimDetail({ claim, onBack }: { claim: Claim; onBack: () => void }) {
  const { customerById, planById, eligibilityFor, setClaimStatus, assignClaim, staff, user } = useStore()
  const [approveOpen, setApproveOpen] = useState(false)
  const [denyOpen, setDenyOpen] = useState(false)
  const [amount, setAmount] = useState(String(claim.deductibleAmount))
  const [reason, setReason] = useState('')

  const customer = customerById(claim.customerId)
  const plan = customer ? planById(customer.planId) : undefined
  const elig = eligibilityFor(claim)
  const isFinal = ['paid', 'denied'].includes(claim.status)

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to queue
      </button>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="tnum text-[24px] font-semibold tracking-tight">{claim.claimNumber}</h1>
        <StatusChip status={claim.status} />
        <span className="text-sm text-muted-foreground">filed {timeAgo(claim.submittedAt)}</span>
      </div>

      {/* Eligibility banner */}
      {!isFinal && (
        <div className={cn(
          'mb-5 flex items-start gap-3 border px-4 py-3',
          elig.eligible ? 'border-[#2f7d4f]/40 bg-[#2f7d4f]/8' : 'border-destructive/40 bg-destructive/8',
        )}>
          {elig.eligible
            ? <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#2f7d4f]" />
            : <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />}
          <div className="text-sm">
            <p className="font-semibold">{elig.eligible ? 'Eligible for payout' : 'Eligibility blocked'}</p>
            <p className="mt-0.5 text-muted-foreground">
              Tenure: {elig.tenureMonths} months {elig.tenureOk ? '(meets 3-month rule)' : '(needs 3)'} ·
              Yearly limit: {elig.yearlyLimitOk ? ' no prior claim in 12 months' : ' prior claim within 12 months'}
            </p>
            {elig.reasons.length > 0 && (
              <ul className="mt-1 list-inside list-disc text-destructive">
                {elig.reasons.map((r) => <li key={r}>{r}</li>)}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Incident */}
          <section className="border border-border bg-card p-5">
            <h2 className="mb-3 text-[15px] font-semibold">Incident</h2>
            <p className="text-[15px] leading-relaxed">{claim.description}</p>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
              <InfoBlock label="Incident date">{fmtDate(claim.incidentDate)}</InfoBlock>
              <InfoBlock label="Location">{claim.city}, {claim.state}</InfoBlock>
              <InfoBlock label="Vehicle">{claim.vehicleLabel}</InfoBlock>
              <InfoBlock label="Deductible"><span className="tnum font-semibold">${claim.deductibleAmount.toLocaleString()}</span></InfoBlock>
            </div>
          </section>

          {/* Documents */}
          <section className="border border-border bg-card p-5">
            <h2 className="mb-3 text-[15px] font-semibold">Documents ({claim.docs.length})</h2>
            <ul className="divide-y divide-border">
              {claim.docs.map((doc) => (
                <li key={doc.id} className="flex items-center gap-3 py-2.5">
                  {doc.type === 'damage_photo'
                    ? <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    : <FileText className="h-4 w-4 text-muted-foreground" />}
                  <span className="tnum flex-1 text-sm">{doc.name}</span>
                  <span className="text-xs capitalize text-muted-foreground">{doc.type.replace('_', ' ')}</span>
                  <span className="tnum text-xs text-muted-foreground">{doc.sizeLabel}</span>
                </li>
              ))}
              {claim.docs.length === 0 && <li className="py-2 text-sm text-muted-foreground">No documents uploaded.</li>}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">Stored in the private claim-docs bucket. Files open for the assigned agent and the customer only.</p>
          </section>

          {/* Timeline */}
          <section className="border border-border bg-card p-5">
            <h2 className="mb-3 text-[15px] font-semibold">Timeline</h2>
            <ol className="space-y-0">
              {claim.timeline.map((t, i) => (
                <li key={t.id} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < claim.timeline.length - 1 && <span className="absolute left-[5px] top-4 h-full w-px bg-border" aria-hidden />}
                  <span className="mt-1.5 h-[11px] w-[11px] shrink-0 border-2 border-primary bg-background" aria-hidden />
                  <div className="text-sm">
                    <p><span className="font-medium">{t.actor}</span> · {t.action}</p>
                    <p className="tnum text-xs text-muted-foreground">{fmtDate(t.at)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Right rail: customer + actions */}
        <div className="space-y-5">
          <section className="border border-border bg-card p-5">
            <h2 className="mb-3 text-[15px] font-semibold">Customer</h2>
            <div className="space-y-3">
              <InfoBlock label="Name">{customer?.name ?? '—'}</InfoBlock>
              <InfoBlock label="Email"><span className="tnum text-sm">{customer?.email}</span></InfoBlock>
              <InfoBlock label="Plan">
                {plan ? <>{plan.name} · <span className="tnum">${plan.monthlyPrice}/mo</span> · covers ${plan.deductibleCoverage.toLocaleString()}</> : '—'}
              </InfoBlock>
              <InfoBlock label="Member since">{customer ? fmtDate(customer.memberSince) : '—'}</InfoBlock>
              {customer && <StatusChip status={customer.status} />}
            </div>
          </section>

          <section className="border border-border bg-card p-5">
            <h2 className="mb-3 text-[15px] font-semibold">Handling</h2>
            <Label className="micro-label">Assigned agent</Label>
            <Select value={claim.assignedTo ?? 'unassigned'} onValueChange={(v) => assignClaim(claim.id, v === 'unassigned' ? undefined : v)}>
              <SelectTrigger className="mt-1 rounded-[3px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {staff.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>

            {!isFinal && (
              <div className="mt-4 space-y-2">
                {claim.status === 'submitted' && (
                  <Button variant="secondary" className="w-full rounded-[3px]" onClick={() => { setClaimStatus(claim.id, 'under_review'); toast.success('Claim moved to Under Review') }}>
                    Start review
                  </Button>
                )}
                <Button variant="secondary" className="w-full rounded-[3px]" onClick={() => { setClaimStatus(claim.id, 'info_requested'); toast.success('Customer asked for more info') }}>
                  Request more info
                </Button>
                <Button
                  className="w-full rounded-[3px] font-semibold"
                  disabled={!elig.eligible}
                  title={elig.eligible ? undefined : 'Eligibility rules block approval'}
                  onClick={() => { setAmount(String(claim.approvedAmount ?? claim.deductibleAmount)); setApproveOpen(true) }}
                >
                  Approve
                </Button>
                <Button variant="destructive" className="w-full rounded-[3px]" onClick={() => setDenyOpen(true)}>
                  Deny
                </Button>
                {claim.status === 'approved' && (
                  <Button className="w-full rounded-[3px] bg-[#2f7d4f] font-semibold text-white hover:bg-[#2f7d4f]/90" onClick={() => { setClaimStatus(claim.id, 'paid'); toast.success('Claim marked as paid') }}>
                    Mark as paid
                  </Button>
                )}
                {!elig.eligible && user?.role === 'admin' && (
                  <p className="text-xs text-muted-foreground">Approval is blocked by eligibility rules. Admins can override in the database if an exception is granted.</p>
                )}
              </div>
            )}
            {isFinal && claim.approvedAmount && (
              <p className="mt-3 text-sm">Final amount: <span className="tnum font-semibold">${claim.approvedAmount.toLocaleString()}</span></p>
            )}
            {claim.denialReason && <p className="mt-3 text-sm text-destructive">{claim.denialReason}</p>}
          </section>
        </div>
      </div>

      {/* Approve dialog */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="rounded-[4px]">
          <DialogHeader><DialogTitle>Approve {claim.claimNumber}</DialogTitle><DialogDescription className="sr-only">Set the approved payout amount and confirm.</DialogDescription></DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              const amt = Number(amount)
              if (!amt || amt <= 0) return toast.error('Enter a valid amount')
              setClaimStatus(claim.id, 'approved', { amount: amt })
              setApproveOpen(false)
              toast.success(`Approved for $${amt.toLocaleString()}`)
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="appr-amt">Approved amount (USD)</Label>
              <Input id="appr-amt" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} className="tnum rounded-[3px]" />
              <p className="text-xs text-muted-foreground">Deductible on file: ${claim.deductibleAmount.toLocaleString()} · Plan covers up to ${plan?.deductibleCoverage.toLocaleString() ?? '—'}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" className="rounded-[3px]" onClick={() => setApproveOpen(false)}>Cancel</Button>
              <Button type="submit" className="rounded-[3px] font-semibold">Confirm approval</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deny dialog */}
      <Dialog open={denyOpen} onOpenChange={setDenyOpen}>
        <DialogContent className="rounded-[4px]">
          <DialogHeader><DialogTitle>Deny {claim.claimNumber}</DialogTitle><DialogDescription className="sr-only">Give the customer-facing denial reason and confirm.</DialogDescription></DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              if (reason.trim().length < 10) return toast.error('A clear reason is required (min. 10 characters)')
              setClaimStatus(claim.id, 'denied', { reason: reason.trim() })
              setDenyOpen(false)
              setReason('')
              toast.success('Claim denied — customer will be emailed')
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="deny-reason">Reason shown to the customer</Label>
              <Textarea id="deny-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[90px] rounded-[3px]" placeholder="e.g. Policy was inactive at the time of the incident…" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" className="rounded-[3px]" onClick={() => setDenyOpen(false)}>Cancel</Button>
              <Button type="submit" variant="destructive" className="rounded-[3px] font-semibold">Confirm denial</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
