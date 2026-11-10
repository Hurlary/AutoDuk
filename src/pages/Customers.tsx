import { useState } from 'react'
import { useStore, fmtDate, tenureLabel } from '@/lib/store'
import type { Customer } from '@/types'
import { EmptyState, InfoBlock, PageHeader, StatusChip } from '@/components/bits'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

export function CustomersPage() {
  const { customers, plans } = useStore()
  const [openId, setOpenId] = useState<string | null>(null)
  const open = customers.find((c) => c.id === openId)

  return (
    <div>
      <PageHeader title="Customers" sub="Active subscribers, their plans, vehicles, and claim history." />
      {customers.length === 0 ? (
        <EmptyState title="No customers yet" hint="A customer record is created automatically the moment checkout completes." />
      ) : (
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="micro-label px-4 py-2.5 font-semibold">Customer</th>
                <th className="micro-label px-4 py-2.5 font-semibold">Plan</th>
                <th className="micro-label px-4 py-2.5 font-semibold">Monthly</th>
                <th className="micro-label px-4 py-2.5 font-semibold">Tenure</th>
                <th className="micro-label px-4 py-2.5 font-semibold">Vehicles</th>
                <th className="micro-label px-4 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((c) => {
                const plan = plans.find((p) => p.id === c.planId)
                return (
                  <tr
                    key={c.id}
                    onClick={() => setOpenId(c.id)}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenId(c.id) } }}
                    className="cursor-pointer transition-colors hover:bg-secondary/60"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{c.name}</div>
                      <div className="tnum text-xs text-muted-foreground">{c.email}</div>
                    </td>
                    <td className="px-4 py-3">{plan?.name} <span className="text-muted-foreground">(${plan?.deductibleCoverage.toLocaleString()})</span></td>
                    <td className="tnum px-4 py-3">${plan?.monthlyPrice}/mo</td>
                    <td className="tnum px-4 py-3">{tenureLabel(c.memberSince)}</td>
                    <td className="tnum px-4 py-3">{c.vehicles.length}</td>
                    <td className="px-4 py-3"><StatusChip status={c.status} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <CustomerDrawer customer={open} onClose={() => setOpenId(null)} />
    </div>
  )
}

function CustomerDrawer({ customer, onClose }: { customer?: Customer; onClose: () => void }) {
  const { plans, claims } = useStore()
  if (!customer) {
    return <Sheet open={false} onOpenChange={(o) => !o && onClose()}><SheetContent className="hidden" /></Sheet>
  }
  const plan = plans.find((p) => p.id === customer.planId)
  const history = claims.filter((c) => c.customerId === customer.id)

  return (
    <Sheet open={!!customer} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto rounded-none bg-background sm:max-w-md">
        <SheetDescription className="sr-only">Customer details and history</SheetDescription>
        <SheetHeader className="mb-4">
          <div className="flex items-center gap-3">
            <SheetTitle className="text-xl">{customer.name}</SheetTitle>
            <StatusChip status={customer.status} />
          </div>
          <p className="tnum text-sm text-muted-foreground">{customer.email}{customer.phone ? ` · ${customer.phone}` : ''}</p>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-4 border-y border-border py-4">
          <InfoBlock label="Plan">{plan?.name}</InfoBlock>
          <InfoBlock label="Monthly"><span className="tnum">${plan?.monthlyPrice}/mo</span></InfoBlock>
          <InfoBlock label="Coverage"><span className="tnum">${plan?.deductibleCoverage.toLocaleString()} deductible</span></InfoBlock>
          <InfoBlock label="Member since">{fmtDate(customer.memberSince)}</InfoBlock>
        </div>

        <section className="mt-5">
          <h3 className="micro-label mb-2">Vehicles</h3>
          <ul className="space-y-1.5">
            {customer.vehicles.map((v) => (
              <li key={v.id} className="flex items-center justify-between border border-border bg-card px-3 py-2 text-sm">
                <span>{v.year} {v.make} {v.model}</span>
                {v.primary && <span className="text-xs font-medium text-primary">Primary</span>}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-5">
          <h3 className="micro-label mb-2">Claim history ({history.length})</h3>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No claims filed.</p>
          ) : (
            <ul className="space-y-1.5">
              {history.map((c) => (
                <li key={c.id} className="flex items-center justify-between border border-border bg-card px-3 py-2 text-sm">
                  <span className="tnum">{c.claimNumber}</span>
                  <StatusChip status={c.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="mt-6 text-xs text-muted-foreground">
          Billing (invoices, card, cancellations) is managed in Stripe — this record syncs from Stripe webhooks.
        </p>
      </SheetContent>
    </Sheet>
  )
}
