import { Reveal } from '@/components/reveal'
import { RoadDivider } from './doodles'

const PHASES = [
  {
    n: '01',
    title: 'Change your policy',
    body: 'Call your insurer or open their app and raise your comprehensive/collision deductible — say from $500 to $1,000. Premiums typically drop around 10% for that move, more for bigger steps. That saving is yours to keep.',
    meta: '~10 min · your insurer',
  },
  {
    n: '02',
    title: 'Subscribe with AutoDuk',
    body: 'Pick the plan matching your new deductible — $5 to $25 a month. Register your vehicle, set up payment, and your membership clock starts. Coverage opens in your third month.',
    meta: '~5 min · this site',
  },
  {
    n: '03',
    title: 'File when it happens',
    body: 'Accident? File from your portal: what happened, where, photos of the damage, and the repair estimate or your insurer\'s claim summary. You\'ll get a claim number immediately.',
    meta: '~10 min · your portal',
  },
  {
    n: '04',
    title: 'Get paid out',
    body: 'Our team reviews every claim against the membership rules. Approved claims pay out your deductible amount within 3–5 business days. You\'ll see every status change in your portal.',
    meta: '3–5 days · after approval',
  },
]

export function HowItWorksPage({ onGetCovered }: { onGetCovered: (planId?: number) => void }) {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-14 md:pt-20">
      <Reveal>
        <p className="micro-label">How it works</p>
        <h1 className="font-display mt-4 max-w-3xl text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.08]">
          Four steps between you and a covered deductible.
        </h1>
      </Reveal>

      <div className="mt-14 space-y-0">
        {PHASES.map((p, i) => (
          <div key={p.n}>
            <Reveal>
              <div className="grid gap-4 py-10 md:grid-cols-[100px_1fr_180px]">
                <p className="tnum text-[15px] font-semibold text-primary">{p.n}</p>
                <div>
                  <h2 className="font-display text-[clamp(1.4rem,2.6vw,2rem)]">{p.title}</h2>
                  <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-foreground/70">{p.body}</p>
                </div>
                <p className="tnum text-[12px] text-muted-foreground md:text-right">{p.meta}</p>
              </div>
            </Reveal>
            {i < PHASES.length - 1 && <RoadDivider className="opacity-30" />}
          </div>
        ))}
      </div>

      {/* rules */}
      <Reveal className="mt-16">
        <div className="rounded-[3px] bg-[#231f20] p-8 text-[#faf6ef] md:p-12">
          <p className="micro-label !text-[#faf6ef]/50">The rules, in full</p>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {[
              ['3 months', 'Membership must be at least 3 months old when you file. Sign up today, covered from month three.'],
              ['1 claim / 12 months', 'One approved claim per rolling 12-month window, per membership.'],
              ['Active account', 'Your subscription must be current when the incident happens.'],
            ].map(([t, d]) => (
              <div key={t}>
                <p className="tnum text-[13px] font-semibold text-[#ffbc95]">{t}</p>
                <p className="mt-2.5 text-[14px] leading-relaxed text-[#faf6ef]/80">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-16 text-center">
        <h2 className="font-display text-[clamp(1.7rem,3.4vw,2.6rem)]">Ready when you are.</h2>
        <button
          onClick={() => onGetCovered()}
          className="mt-7 rounded-[3px] bg-primary px-7 py-3.5 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Get covered
        </button>
      </Reveal>
    </div>
  )
}
