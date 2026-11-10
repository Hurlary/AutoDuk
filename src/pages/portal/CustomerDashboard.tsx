import { useState } from 'react'
import { Car, Plus, ShieldCheck } from 'lucide-react'
import { useStore, fmtDate, tenureLabel } from '@/lib/store'
import { InfoBlock, StatusChip } from '@/components/bits'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import type { PortalView } from './PortalShell'

export function CustomerDashboard({ onNavigate }: { onNavigate: (v: PortalView) => void }) {
  const { customer, planById, claims, updateCustomerProfile, addVehicle, eligibilityForCustomer } = useStore()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(customer?.name ?? '')
  const [phone, setPhone] = useState(customer?.phone ?? '')
  const [addingVehicle, setAddingVehicle] = useState(false)
  const [year, setYear] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')

  if (!customer) return null
  const plan = planById(customer.planId)
  const myClaims = claims.filter((c) => c.customerId === customer.id)
  const elig = eligibilityForCustomer(customer.id)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[24px] font-semibold tracking-tight">Hi, {customer.name.split(' ')[0]}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Your protection, at a glance.</p>
      </div>

      {/* Plan summary */}
      <section className="border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="micro-label">Subscription</div>
            <div className="mt-1 flex items-center gap-2.5">
              <h2 className="text-xl font-semibold">{plan?.name} plan</h2>
              <StatusChip status={customer.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Covers up to <span className="tnum font-medium text-foreground">${plan?.deductibleCoverage.toLocaleString()}</span> of your deductible
            </p>
          </div>
          <div className="text-right">
            <div className="tnum text-2xl font-semibold">${plan?.monthlyPrice}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
            <div className="text-xs text-muted-foreground">renews monthly · manage billing in Stripe</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-3">
          <InfoBlock label="Member since">{fmtDate(customer.memberSince)}</InfoBlock>
          <InfoBlock label="Membership">{tenureLabel(customer.memberSince)}</InfoBlock>
          <InfoBlock label="Claim eligibility">
            {elig.eligible
              ? <span className="inline-flex items-center gap-1.5 font-medium text-[#2f7d4f]"><ShieldCheck className="h-4 w-4" /> Eligible</span>
              : <span className="text-muted-foreground">{elig.tenureMonths < 3 ? `Eligible in ${3 - elig.tenureMonths} mo` : 'Limit reached'}</span>}
          </InfoBlock>
        </div>
      </section>

      {/* Claims */}
      <section className="border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Your claims</h2>
          <Button size="sm" className="rounded-[3px] font-semibold" onClick={() => onNavigate('claim')}>
            File a claim
          </Button>
        </div>
        {myClaims.length === 0 ? (
          <p className="text-sm text-muted-foreground">No claims filed — we hope it stays that way.</p>
        ) : (
          <ul className="divide-y divide-border">
            {myClaims.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
                <span className="tnum font-medium">{c.claimNumber}</span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{c.description}</span>
                <StatusChip status={c.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Vehicles */}
      <section className="border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Your vehicles</h2>
          <Button size="sm" variant="secondary" className="rounded-[3px]" onClick={() => setAddingVehicle((v) => !v)}>
            <Plus className="mr-1 h-4 w-4" /> Add vehicle
          </Button>
        </div>
        {customer.vehicles.length === 0 && !addingVehicle && (
          <p className="text-sm text-muted-foreground">No vehicles on file yet.</p>
        )}
        <ul className="space-y-1.5">
          {customer.vehicles.map((v) => (
            <li key={v.id} className="flex items-center gap-3 border border-border bg-background px-3 py-2 text-sm">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span>{v.year} {v.make} {v.model}</span>
              {v.primary && <span className="ml-auto text-xs font-medium text-primary">Primary</span>}
            </li>
          ))}
        </ul>
        {addingVehicle && (
          <form
            className="mt-3 grid grid-cols-3 gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              const y = parseInt(year, 10)
              if (!y || y < 1990 || y > 2027) return toast.error('Enter a valid year')
              if (!make.trim() || !model.trim()) return toast.error('Make and model are required')
              addVehicle(customer.id, { year: y, make: make.trim(), model: model.trim(), primary: customer.vehicles.length === 0 })
              setAddingVehicle(false); setYear(''); setMake(''); setModel('')
              toast.success('Vehicle added')
            }}
          >
            <div><Label htmlFor="v-year" className="micro-label">Year</Label>
              <Input id="v-year" inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value.slice(0, 4))} className="tnum mt-1 rounded-[3px] bg-background" placeholder="2022" /></div>
            <div><Label htmlFor="v-make" className="micro-label">Make</Label>
              <Input id="v-make" value={make} onChange={(e) => setMake(e.target.value)} className="mt-1 rounded-[3px] bg-background" placeholder="Toyota" /></div>
            <div><Label htmlFor="v-model" className="micro-label">Model</Label>
              <Input id="v-model" value={model} onChange={(e) => setModel(e.target.value)} className="mt-1 rounded-[3px] bg-background" placeholder="RAV4" /></div>
            <div className="col-span-3 flex justify-end gap-2">
              <Button type="button" size="sm" variant="ghost" className="rounded-[3px]" onClick={() => setAddingVehicle(false)}>Cancel</Button>
              <Button type="submit" size="sm" className="rounded-[3px] font-semibold">Save vehicle</Button>
            </div>
          </form>
        )}
      </section>

      {/* Profile */}
      <section className="border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Profile</h2>
          {!editing && (
            <Button size="sm" variant="secondary" className="rounded-[3px]" onClick={() => { setName(customer.name); setPhone(customer.phone ?? ''); setEditing(true) }}>
              Edit
            </Button>
          )}
        </div>
        {editing ? (
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (name.trim().length < 2) return toast.error('Name is required')
              updateCustomerProfile(customer.id, { name: name.trim(), phone: phone.trim() || undefined })
              setEditing(false)
              toast.success('Profile updated')
            }}
          >
            <div><Label htmlFor="p-name" className="micro-label">Full name</Label>
              <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 rounded-[3px] bg-background" /></div>
            <div><Label htmlFor="p-phone" className="micro-label">Phone</Label>
              <Input id="p-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 rounded-[3px] bg-background" /></div>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" size="sm" className="rounded-[3px] font-semibold">Save</Button>
              <Button type="button" size="sm" variant="ghost" className="rounded-[3px]" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </form>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoBlock label="Email"><span className="tnum text-sm">{customer.email}</span></InfoBlock>
            <InfoBlock label="Phone">{customer.phone ?? '—'}</InfoBlock>
          </div>
        )}
      </section>
    </div>
  )
}
