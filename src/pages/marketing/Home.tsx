import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { CarDoodle, RoadDivider, ShieldDoodle } from './doodles'
import type { MktView } from './MarketingShell'

const STEPS = [
  {
    n: '01',
    title: 'Raise your deductible',
    body: 'Bumping your auto policy from $500 to $1,000 typically cuts your premium ~10%. Your insurer pays you to take on more risk.',
  },
  {
    n: '02',
    title: 'Pick a plan',
    body: 'AutoDuk covers your new deductible from $5/month. The premium savings usually pay for the plan — often with money left over.',
  },
  {
    n: '03',
    title: 'File when it happens',
    body: 'Accident? File in your portal with photos and the estimate. Approved claims are paid out within 3–5 business days.',
  },
]

export function HomePage({ onNavigate, onGetCovered }: {
  onNavigate: (v: MktView) => void
  onGetCovered: (planId?: number) => void
}) {
  return (
    <div>
      {/* hero */}
      <section className="mx-auto max-w-6xl px-5 pt-16 md:pt-24">
        <Reveal>
          <p className="micro-label">Auto insurance deductible coverage</p>
          <h1 className="font-display mt-5 max-w-4xl text-[clamp(2.6rem,6.5vw,5.2rem)] leading-[1.04]">
            Raise your deductible.{' '}
            <span className="text-primary">Keep the savings.</span>{' '}
            We cover the gap.
          </h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-7 max-w-xl text-[17px] leading-relaxed text-foreground/75">
            A higher deductible means a lower premium — but nobody wants a $1,500 surprise
            after a fender bender. AutoDuk covers your deductible for a few dollars a month,
            so the math finally works in your favor.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-6">
            <button
              onClick={() => onNavigate('calculator')}
              className="group flex items-center gap-2 rounded-[3px] bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Run your numbers
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button onClick={() => onNavigate('how')} className="u-link text-[15px] font-medium">
              How it works
            </button>
          </div>
        </Reveal>
        <Reveal media delay={200} className="mt-14">
          <div className="rounded-[3px] border border-foreground/10 bg-card p-8 md:p-12">
            <CarDoodle className="mx-auto max-w-md" />
          </div>
        </Reveal>
      </section>

      {/* the math */}
      <section className="mx-auto max-w-6xl px-5 pt-24">
        <Reveal>
          <p className="micro-label">The math, in plain numbers</p>
          <h2 className="font-display mt-4 max-w-2xl text-[clamp(1.8rem,3.6vw,2.8rem)] leading-[1.15]">
            A typical driver, a $500 → $1,000 move
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-px overflow-hidden rounded-[3px] border border-foreground/10 bg-foreground/10 sm:grid-cols-3">
          {[
            { k: 'Premium saved', v: '$120/yr', d: 'when your deductible moves $500 → $1,000' },
            { k: 'Standard plan', v: '$120/yr', d: '$10/month to cover the new $1,000 deductible' },
            { k: 'Net position', v: '$0', d: 'protection pays for itself — savings past $1,000 are profit', hi: true },
          ].map((s, i) => (
            <Reveal key={s.k} delay={i * 120} className="bg-card">
              <div className="p-7">
                <p className="micro-label">{s.k}</p>
                <p className="tnum mt-3 text-[34px] font-semibold tracking-tight">
                  {s.hi ? <span className="bg-[#ffbc95] px-2 -mx-2">{s.v}</span> : s.v}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={100}>
          <button onClick={() => onNavigate('calculator')} className="u-link mt-6 text-[14px] font-medium text-primary">
            Try it with your own premium →
          </button>
        </Reveal>
      </section>

      <RoadDivider className="mx-auto mt-24 max-w-6xl px-5" />

      {/* steps */}
      <section className="mx-auto max-w-6xl px-5 pt-24">
        <Reveal>
          <p className="micro-label">How it works</p>
        </Reveal>
        <div className="mt-8 grid gap-10 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 140}>
              <p className="tnum text-[13px] text-primary">{s.n}</p>
              <h3 className="font-display mt-3 text-[22px]">{s.title}</h3>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-foreground/70">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* rules band */}
      <section className="mt-24 bg-[#231f20] py-20 text-[#faf6ef]">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-[1fr_auto]">
          <Reveal>
            <p className="micro-label !text-[#faf6ef]/50">Straight rules, no fine print</p>
            <h2 className="font-display mt-4 text-[clamp(1.8rem,3.6vw,2.6rem)] leading-[1.15]">
              Three things decide a claim
            </h2>
            <ul className="mt-8 space-y-5">
              {[
                ['3 months', 'You\'ve been a member at least 3 months when you file.'],
                ['1 claim / 12 mo', 'One covered claim per rolling 12 months.'],
                ['Active plan', 'Your subscription is paid up when the incident happens.'],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-5">
                  <span className="tnum w-28 shrink-0 pt-0.5 text-[13px] font-semibold text-[#ffbc95]">{t}</span>
                  <span className="text-[14.5px] leading-relaxed text-[#faf6ef]/80">{d}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal media>
            <ShieldDoodle className="mx-auto w-40 md:w-52" />
          </Reveal>
        </div>
      </section>

      {/* closing CTA */}
      <section className="mx-auto max-w-6xl px-5 pt-24 text-center">
        <Reveal>
          <h2 className="font-display mx-auto max-w-3xl text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.1]">
            Run your numbers in twenty seconds.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[15.5px] text-foreground/70">
            Two deductibles and your annual premium — that’s all the calculator needs.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-6">
            <button
              onClick={() => onNavigate('calculator')}
              className="rounded-[3px] bg-primary px-7 py-3.5 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Open the calculator
            </button>
            <button onClick={() => onGetCovered()} className="u-link text-[15px] font-medium">
              Or pick a plan directly
            </button>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
