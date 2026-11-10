import { useMemo, useState } from 'react'
import { ArrowRight, CircleHelp, TrendingDown } from 'lucide-react'
import { Reveal } from '@/components/reveal'
import {
  DEDUCTIBLE_TIERS, PLAN_TIERS, STATE_OPTIONS,
  computeSavings, money, planForDeductible, verdict,
} from '@/lib/calc'
import { Slider } from '@/components/ui/slider'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

/** Plain-English tooltip next to a label (click/tap — works on touch). */
function Hint({ text }: { text: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="What does this mean?"
          className="ml-1.5 inline-flex translate-y-[1px] text-muted-foreground/70 transition-colors hover:text-primary"
        >
          <CircleHelp className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 rounded-[3px] text-[13px] leading-relaxed">
        {text}
      </PopoverContent>
    </Popover>
  )
}

/** Slider across the deductible tiers with labeled stops. */
function TierSlider({ label, hint, tiers, value, onChange }: {
  label: string
  hint: string
  tiers: readonly number[]
  value: number
  onChange: (v: number) => void
}) {
  const idx = Math.max(0, tiers.indexOf(value))
  return (
    <div>
      <p className="micro-label flex items-center">
        {label}
        <Hint text={hint} />
      </p>
      <div className="mt-4 px-1">
        <Slider
          min={0}
          max={tiers.length - 1}
          step={1}
          value={[idx]}
          onValueChange={([i]) => onChange(tiers[i])}
        />
        <div className="mt-2 flex justify-between">
          {tiers.map((t, i) => (
            <button
              key={t}
              onClick={() => onChange(t)}
              className={cn(
                'tnum text-[10.5px] transition-colors',
                i === idx ? 'font-bold text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              ${t.toLocaleString()}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CalculatorPage({ onGetCovered }: { onGetCovered: (planId?: number) => void }) {
  const [currentDed, setCurrentDed] = useState(500)
  const [newDed, setNewDed] = useState(1000)
  const [premium, setPremium] = useState(1400)
  const [stateName, setStateName] = useState('National Average')

  const stateFactor = STATE_OPTIONS.find((s) => s.name === stateName)?.factor ?? 1
  const r = useMemo(
    () => computeSavings(premium, currentDed, newDed, stateFactor),
    [premium, currentDed, newDed, stateFactor],
  )

  // before/after bars — monthly figures, third bar stacks the plan on the new premium
  const nowMo = r.currentMonthly
  const newMo = r.newMonthly
  const planMo = r.plan?.monthlyPrice ?? 0
  const barMax = Math.max(nowMo, newMo + planMo, 1)
  const bars = [
    { label: 'Now', value: nowMo, color: '#231f20' },
    { label: 'New premium', value: newMo, color: '#2e54fe' },
    { label: 'New + AutoDuk', value: newMo + planMo, color: '#2e54fe', stack: planMo },
  ]

  return (
    <div className="mx-auto max-w-6xl px-5 pt-14 md:pt-20">
      <Reveal>
        <p className="micro-label">Deductible savings calculator</p>
        <h1 className="font-display mt-4 max-w-3xl text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.08]">
          What does the trade look like for you?
        </h1>
        <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-foreground/70">
          Slide the numbers around — the results update as you go. We estimate your premium
          savings, match the plan that covers the new deductible, and show what you keep.
        </p>
      </Reveal>

      <div className="mt-12 grid items-start gap-6 lg:grid-cols-[5fr_7fr]">
        {/* inputs */}
        <Reveal className="rounded-[3px] border border-foreground/10 bg-card p-7">
          <div className="space-y-9">
            <TierSlider
              label="Your current deductible"
              hint="The amount you pay out of pocket today before your insurer pays. It’s on your policy’s declarations page."
              tiers={DEDUCTIBLE_TIERS}
              value={currentDed}
              onChange={setCurrentDed}
            />
            <TierSlider
              label="Deductible you’d move to"
              hint="A higher deductible means a lower monthly premium. AutoDuk covers this bigger amount for you, so you keep the savings without the risk."
              tiers={PLAN_TIERS}
              value={newDed}
              onChange={setNewDed}
            />
            <div>
              <p className="micro-label flex items-center">
                Your annual premium
                <Hint text="What you pay for car insurance per year, before any deductible change. A typical US full-coverage policy runs $1,200–$2,400." />
              </p>
              <div className="mt-4 flex items-center gap-4 px-1">
                <Slider
                  min={600}
                  max={5000}
                  step={50}
                  value={[Math.min(5000, Math.max(600, premium))]}
                  onValueChange={([v]) => setPremium(v)}
                  className="flex-1"
                />
                <div className="flex w-28 items-center rounded-[3px] border border-foreground/15 bg-background px-2.5 focus-within:border-primary">
                  <span className="tnum text-[13px] text-muted-foreground">$</span>
                  <input
                    value={premium || ''}
                    onChange={(e) => setPremium(Math.max(0, parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0))}
                    inputMode="numeric"
                    className="tnum w-full bg-transparent px-1.5 py-2 text-[13.5px] font-semibold outline-none"
                  />
                </div>
              </div>
            </div>
            <div>
              <p className="micro-label flex items-center">
                State
                <Hint text="Insurance costs vary by state. Pick yours for a regional estimate, or leave it on National Average." />
              </p>
              <Select value={stateName} onValueChange={setStateName}>
                <SelectTrigger className="mt-3 rounded-[3px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATE_OPTIONS.map((s) => (
                    <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {newDed <= currentDed && (
            <p className="mt-7 rounded-[3px] bg-[#ffbc95]/40 px-4 py-3 text-[13px] leading-relaxed">
              The savings come from moving <em>up</em> — slide the new deductible above your current one.
            </p>
          )}
        </Reveal>

        {/* results */}
        <Reveal delay={120}>
          {/* before/after visual */}
          <div className="rounded-[3px] border border-foreground/10 bg-card p-7">
            <div className="flex items-baseline justify-between">
              <p className="micro-label">Before / after — monthly cost</p>
              <TrendingDown className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-6 flex h-44 items-end gap-8 border-b border-foreground/15 px-2 sm:px-6">
              {bars.map((b) => (
                <div key={b.label} className="flex flex-1 flex-col items-center justify-end self-stretch">
                  <p className="tnum mb-1.5 text-[13px] font-semibold">{money(b.value)}</p>
                  <div
                    className="flex w-full max-w-24 flex-col-reverse overflow-hidden rounded-t-[3px] transition-all duration-700 ease-out"
                    style={{ height: `${(b.value / barMax) * 100}%` }}
                  >
                    <div className="w-full transition-all duration-700" style={{ background: b.color, height: b.stack ? `${((b.value - b.stack) / b.value) * 100}%` : '100%' }} />
                    {b.stack ? <div className="w-full bg-[#ffbc95] transition-all duration-700" style={{ height: `${(b.stack / b.value) * 100}%` }} /> : null}
                  </div>
                  <p className="mt-2 text-center text-[11.5px] font-medium leading-tight text-muted-foreground">{b.label}</p>
                </div>
              ))}
            </div>
            <p className="tnum mt-4 text-[12px] text-muted-foreground">
              <span className="mr-1 inline-block h-2 w-2 bg-[#ffbc95]" /> AutoDuk plan ·
              you keep <span className="font-semibold text-foreground">{money(r.monthlySavings - planMo)}/mo</span> after coverage
              {stateName !== 'National Average' && <> · {stateName} estimate</>}
            </p>
          </div>

          {/* matched plan */}
          {r.plan && (
            <div className="mt-6 rounded-[3px] bg-[#231f20] p-6 text-[#faf6ef]">
              <p className="micro-label !text-[#faf6ef]/50">The plan that covers it</p>
              <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
                <p className="text-[19px] font-bold">
                  {r.plan.name} · covers {money(r.plan.deductibleCoverage)}
                </p>
                <p className="tnum text-[24px] font-semibold">{money(r.plan.monthlyPrice)}<span className="text-[13px] font-medium text-[#faf6ef]/60">/mo</span></p>
              </div>
              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="text-[14.5px] leading-relaxed text-[#faf6ef]/85">
                  {verdict(r)}
                </p>
                <p className="tnum mt-3 text-[12px] text-[#faf6ef]/55">
                  {money(r.annualSavings)} saved − {money(r.planAnnualCost)} plan ={' '}
                  <span className={r.netAnnual >= 0 ? 'text-[#ffbc95]' : 'text-[#faf6ef]/60'}>
                    {money(r.netAnnual)}/yr net
                  </span>
                </p>
              </div>
              <button
                onClick={() => onGetCovered(r.plan!.id)}
                className="group mt-6 flex items-center gap-2 rounded-[3px] bg-[#faf6ef] px-5 py-3 text-[14px] font-semibold text-[#231f20] transition-colors hover:bg-white"
              >
                Get covered — {money(r.plan.monthlyPrice)}/mo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          )}

          {/* comparison table */}
          <div className="mt-6 overflow-x-auto rounded-[3px] border border-foreground/10 bg-card">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-foreground/10">
                  {['If you move to', 'Premium/mo', 'You save/yr', 'AutoDuk plan', 'Net/yr covered'].map((h) => (
                    <th key={h} className="micro-label px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLAN_TIERS.map((t) => {
                  const row = computeSavings(premium, currentDed, t, stateFactor)
                  const active = t === newDed
                  return (
                    <tr
                      key={t}
                      onClick={() => setNewDed(t)}
                      className={cn(
                        'cursor-pointer border-b border-foreground/5 transition-colors last:border-0',
                        active ? 'bg-[#ffbc95]/25' : 'hover:bg-foreground/[0.03]',
                      )}
                    >
                      <td className="tnum px-4 py-3 text-[13.5px] font-semibold">
                        ${t.toLocaleString()}{active && <span className="ml-1.5 text-primary">✓</span>}
                      </td>
                      <td className="tnum px-4 py-3 text-[13.5px]">{money(row.newMonthly)}</td>
                      <td className="tnum px-4 py-3 text-[13.5px]">{money(row.annualSavings)}</td>
                      <td className="tnum px-4 py-3 text-[13.5px]">
                        {planForDeductible(t) ? `${planForDeductible(t)!.name} · ${money(planForDeductible(t)!.monthlyPrice)}/mo` : '—'}
                      </td>
                      <td className={cn('tnum px-4 py-3 text-[13.5px] font-semibold', row.netAnnual >= 0 ? 'text-primary' : 'text-foreground/50')}>
                        {money(row.netAnnual)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="tnum mt-4 max-w-2xl text-[10.5px] leading-relaxed text-muted-foreground">
            Estimates use industry-average savings rates by deductible tier, adjusted by region.
            Actual premiums vary by insurer, vehicle, driving history, and coverage type — confirm
            with your provider. AutoDuk is a deductible reimbursement membership, not an insurance policy.
          </p>
        </Reveal>
      </div>
    </div>
  )
}
