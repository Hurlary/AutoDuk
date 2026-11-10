import { Reveal } from '@/components/reveal'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { MktView } from './MarketingShell'

export function PlansPage({ onGetCovered, onNavigate }: {
  onGetCovered: (planId?: number) => void
  onNavigate: (v: MktView) => void
}) {
  const { plans } = useStore()

  return (
    <div className="mx-auto max-w-6xl px-5 pt-14 md:pt-20">
      <Reveal>
        <p className="micro-label">Plans</p>
        <h1 className="font-display mt-4 max-w-3xl text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.08]">
          Five plans. One covers your deductible.
        </h1>
        <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-foreground/70">
          Every plan works the same way — the only difference is the size of the deductible we
          cover. Match the plan to your auto policy and you’re done.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {plans.map((p, i) => {
          const featured = p.id === 2
          return (
            <Reveal key={p.id} delay={i * 90}>
              <div
                className={cn(
                  'flex h-full flex-col rounded-[3px] border p-6',
                  featured ? 'border-primary bg-card shadow-[0_0_0_1px_hsl(var(--primary))]' : 'border-foreground/10 bg-card',
                )}
              >
                {featured && (
                  <span className="tnum mb-3 w-max rounded-[3px] bg-[#ffbc95] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#231f20]">
                    Most chosen
                  </span>
                )}
                <p className="text-[15px] font-bold">{p.name}</p>
                <p className="tnum mt-3 text-[30px] font-semibold leading-none tracking-tight">
                  ${p.monthlyPrice}
                  <span className="text-[13px] font-medium text-muted-foreground">/mo</span>
                </p>
                <p className="mt-4 border-t border-foreground/10 pt-4 text-[13.5px] leading-relaxed text-foreground/70">
                  Covers a <span className="tnum font-semibold text-foreground">${p.deductibleCoverage.toLocaleString()}</span> deductible
                </p>
                <button
                  onClick={() => onGetCovered(p.id)}
                  className={cn(
                    'mt-auto pt-5',
                  )}
                >
                  <span className={cn(
                    'block w-full rounded-[3px] px-4 py-2.5 text-center text-[13.5px] font-semibold transition-colors',
                    featured
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border border-foreground/20 hover:border-foreground/50',
                  )}>
                    Choose {p.name}
                  </span>
                </button>
              </div>
            </Reveal>
          )
        })}
      </div>

      <Reveal delay={150}>
        <div className="mt-12 grid gap-px overflow-hidden rounded-[3px] border border-foreground/10 bg-foreground/10 sm:grid-cols-3">
          {[
            ['3-month wait', 'Claims open after your third month of membership.'],
            ['1 claim / 12 months', 'One covered claim per rolling 12-month window.'],
            ['Cancel anytime', 'Month to month. No contracts, no cancellation fees.'],
          ].map(([t, d]) => (
            <div key={t} className="bg-card p-6">
              <p className="text-[14px] font-bold">{t}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-[14.5px]">
          Not sure which tier matches your policy?{' '}
          <button onClick={() => onNavigate('calculator')} className="u-link font-medium text-primary">
            Run the calculator
          </button>
        </p>
      </Reveal>
    </div>
  )
}
