import { useRef, useState } from 'react'
import { CheckCircle2, ShieldAlert, Upload, X } from 'lucide-react'
import { useStore, fmtDate } from '@/lib/store'
import type { Claim, ClaimDoc } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SquaresMark } from '@/components/bits'
import { toast } from 'sonner'
import type { PortalView } from './PortalShell'

const uid = () => Math.random().toString(36).slice(2, 10)

export function FileClaimPage({ onNavigate }: { onNavigate: (v: PortalView) => void }) {
  const { customer, planById, eligibilityForCustomer, submitClaim } = useStore()
  const [submitted, setSubmitted] = useState<Claim | null>(null)

  // form state
  const [vehicleLabel, setVehicleLabel] = useState('')
  const [incidentDate, setIncidentDate] = useState('')
  const [description, setDescription] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [damageDocs, setDamageDocs] = useState<ClaimDoc[]>([])
  const [policeDocs, setPoliceDocs] = useState<ClaimDoc[]>([])
  const [insuranceDocs, setInsuranceDocs] = useState<ClaimDoc[]>([])
  const [err, setErr] = useState('')

  if (!customer) return null
  const plan = planById(customer.planId)
  const elig = eligibilityForCustomer(customer.id)

  // ---------- confirmation screen ----------
  if (submitted) {
    return (
      <div className="mx-auto max-w-lg py-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-[#2f7d4f]" strokeWidth={1.8} />
        <h1 className="mt-4 text-[24px] font-semibold tracking-tight">Your claim has been submitted successfully</h1>
        <p className="mt-2 text-muted-foreground">
          Reference number <span className="tnum font-semibold text-foreground">{submitted.claimNumber}</span>
        </p>
        <div className="mt-6 border border-border bg-card p-5 text-left text-sm">
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground">Estimated processing time</span>
            <span className="font-medium">3–5 business days</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground">Coverage on your plan</span>
            <span className="tnum font-medium">up to ${plan?.deductibleCoverage.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground">Confirmation email</span>
            <span className="font-medium">Sent to {customer.email}</span>
          </div>
        </div>
        <Button className="mt-6 rounded-[3px] font-semibold" onClick={() => onNavigate('dashboard')}>
          Return to dashboard
        </Button>
      </div>
    )
  }

  // ---------- eligibility gate ----------
  if (!elig.eligible) {
    return (
      <div className="mx-auto max-w-lg py-8">
        <div className="border border-destructive/40 bg-destructive/8 p-6 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-destructive" strokeWidth={1.8} />
          <h1 className="mt-3 text-xl font-semibold">Not eligible to file yet</h1>
          <ul className="mt-3 space-y-1.5 text-sm">
            {elig.reasons.map((r) => <li key={r} className="font-medium text-destructive">{r}</li>)}
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            Member for {elig.tenureMonths} {elig.tenureMonths === 1 ? 'month' : 'months'} · questions? Visit Support and we'll help.
          </p>
          <Button variant="secondary" className="mt-5 rounded-[3px]" onClick={() => onNavigate('dashboard')}>
            Back to dashboard
          </Button>
        </div>
      </div>
    )
  }

  // ---------- claim form ----------
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicleLabel) return setErr('Select the vehicle involved.')
    if (!incidentDate) return setErr('Date of accident is required.')
    if (new Date(incidentDate) > new Date()) return setErr('Incident date cannot be in the future.')
    if (description.trim().length < 20) return setErr('Please describe the incident in a bit more detail (min. 20 characters).')
    if (!street.trim() || !city.trim() || !state.trim() || !zip.trim()) return setErr('Full incident address is required.')
    if (damageDocs.length === 0) return setErr('At least one photo of the damage is required.')
    setErr('')
    const claim = submitClaim({
      customerId: customer.id,
      vehicleLabel, incidentDate, description: description.trim(),
      street: street.trim(), city: city.trim(), state: state.trim(), zip: zip.trim(),
      docs: [...damageDocs, ...policeDocs, ...insuranceDocs],
    })
    setSubmitted(claim)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-[24px] font-semibold tracking-tight">File a claim</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Deductible assistance up to <span className="tnum font-medium text-foreground">${plan?.deductibleCoverage.toLocaleString()}</span> on your {plan?.name} plan.
        Fields marked * are required.
      </p>

      <form onSubmit={submit} className="mt-5 space-y-5">
        <section className="border border-border bg-card p-5">
          <h2 className="mb-3 text-[15px] font-semibold">Personal information</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label className="micro-label">Full name</Label>
              <Input value={customer.name} readOnly className="tnum mt-1 rounded-[3px] bg-secondary/60" /></div>
            <div><Label className="micro-label">Email</Label>
              <Input value={customer.email} readOnly className="tnum mt-1 rounded-[3px] bg-secondary/60" /></div>
          </div>
        </section>

        <section className="border border-border bg-card p-5">
          <h2 className="mb-3 text-[15px] font-semibold">Incident information</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="fc-vehicle" className="micro-label">Vehicle *</Label>
              {customer.vehicles.length > 0 ? (
                <Select value={vehicleLabel} onValueChange={setVehicleLabel}>
                  <SelectTrigger id="fc-vehicle" className="mt-1 rounded-[3px] bg-background"><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                  <SelectContent>
                    {customer.vehicles.map((v) => (
                      <SelectItem key={v.id} value={`${v.year} ${v.make} ${v.model}`}>{v.year} {v.make} {v.model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input id="fc-vehicle" value={vehicleLabel} onChange={(e) => setVehicleLabel(e.target.value)}
                  placeholder="e.g. 2021 Honda Civic" className="mt-1 rounded-[3px] bg-background" />
              )}
            </div>
            <div>
              <Label htmlFor="fc-date" className="micro-label">Date of accident *</Label>
              <Input id="fc-date" type="date" value={incidentDate} max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setIncidentDate(e.target.value)} className="tnum mt-1 rounded-[3px] bg-background" />
            </div>
          </div>
          <div className="mt-3">
            <Label htmlFor="fc-desc" className="micro-label">Description of incident *</Label>
            <Textarea id="fc-desc" value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened, where, and what was damaged…"
              className="mt-1 min-h-[96px] rounded-[3px] bg-background" />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="fc-street" className="micro-label">Street *</Label>
              <Input id="fc-street" value={street} onChange={(e) => setStreet(e.target.value)} className="mt-1 rounded-[3px] bg-background" />
            </div>
            <div><Label htmlFor="fc-city" className="micro-label">City *</Label>
              <Input id="fc-city" value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 rounded-[3px] bg-background" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label htmlFor="fc-state" className="micro-label">State *</Label>
                <Input id="fc-state" value={state} onChange={(e) => setState(e.target.value)} maxLength={2} placeholder="TX" className="mt-1 rounded-[3px] bg-background uppercase" /></div>
              <div><Label htmlFor="fc-zip" className="micro-label">ZIP *</Label>
                <Input id="fc-zip" inputMode="numeric" value={zip} onChange={(e) => setZip(e.target.value.slice(0, 10))} className="tnum mt-1 rounded-[3px] bg-background" /></div>
            </div>
          </div>
        </section>

        <section className="border border-border bg-card p-5">
          <h2 className="mb-1 text-[15px] font-semibold">Proof of accident / damages</h2>
          <p className="mb-3 text-xs text-muted-foreground">Photos of the damage are required. Police report and insurance documents help us pay out faster.</p>
          <div className="space-y-3">
            <UploadField label="Damage photos *" docs={damageDocs} setDocs={setDamageDocs} docType="damage_photo" accept="image/*" />
            <UploadField label="Police report (optional)" docs={policeDocs} setDocs={setPoliceDocs} docType="police_report" />
            <UploadField label="Insurance claim documents (optional)" docs={insuranceDocs} setDocs={setInsuranceDocs} docType="insurance_doc" />
          </div>
        </section>

        {err && <p role="alert" className="border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}

        <Button type="submit" className="w-full rounded-[3px] py-5 text-[15px] font-semibold">
          Submit claim
        </Button>
        <p className="pb-4 text-center text-xs text-muted-foreground">
          Submitting on {fmtDate(new Date().toISOString())} · one claim allowed per 12-month period
        </p>
      </form>
    </div>
  )
}

function UploadField({ label, docs, setDocs, docType, accept }: {
  label: string
  docs: ClaimDoc[]
  setDocs: (d: ClaimDoc[]) => void
  docType: ClaimDoc['type']
  accept?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="border border-dashed border-border bg-background p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{label}</span>
        <Button type="button" size="sm" variant="secondary" className="rounded-[3px]" onClick={() => ref.current?.click()}>
          <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload
        </Button>
        <input
          ref={ref} type="file" multiple accept={accept} className="sr-only" aria-label={label}
          onChange={(e) => {
            const files = Array.from(e.target.files ?? [])
            if (files.length === 0) return
            setDocs([...docs, ...files.map((f) => ({
              id: uid(), name: f.name, type: docType,
              sizeLabel: f.size > 1048576 ? `${(f.size / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(f.size / 1024))} KB`,
            }))])
            toast.success(`${files.length} file${files.length > 1 ? 's' : ''} attached`)
            e.target.value = ''
          }}
        />
      </div>
      {docs.length > 0 && (
        <ul className="mt-2 space-y-1">
          {docs.map((d) => (
            <li key={d.id} className="flex items-center gap-2 text-sm">
              <SquaresMark className="text-muted-foreground" />
              <span className="tnum min-w-0 flex-1 truncate text-xs">{d.name}</span>
              <span className="tnum text-xs text-muted-foreground">{d.sizeLabel}</span>
              <button type="button" aria-label={`Remove ${d.name}`} onClick={() => setDocs(docs.filter((x) => x.id !== d.id))}
                className="rounded-[2px] p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary">
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-1.5 text-[11px] text-muted-foreground">Demo mode stores file names only; real uploads go to encrypted storage at cutover.</p>
    </div>
  )
}
