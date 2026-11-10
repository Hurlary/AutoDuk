import { useEffect, useRef, type ReactNode } from 'react'
import { SquaresMark } from '@/components/bits'
import { cn } from '@/lib/utils'

export type MktView = 'home' | 'how' | 'plans' | 'calculator' | 'faq' | 'contact'

const NAV: { id: MktView; label: string }[] = [
  { id: 'how', label: 'How it works' },
  { id: 'plans', label: 'Plans' },
  { id: 'calculator', label: 'Calculator' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
]

export function MarketingShell({ view, onNavigate, onSignIn, onGetCovered, onStaff, children }: {
  view: MktView
  onNavigate: (v: MktView) => void
  onSignIn: () => void
  onGetCovered: () => void
  onStaff: () => void
  children: ReactNode
}) {
  return (
    <div className="page-in min-h-screen bg-background text-foreground">
      {/* fixed vertical rail — desktop only */}
      <div
        aria-hidden
        className="pointer-events-none fixed right-3 top-1/2 z-40 hidden origin-center -translate-y-1/2 rotate-90 xl:block"
      >
        <span className="tnum text-[10px] uppercase tracking-[0.5em] text-muted-foreground/70 whitespace-nowrap">
          Deductible coverage · From $5/mo · Cancel anytime
        </span>
      </div>

      <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2.5">
            <SquaresMark className="h-6 w-6 text-primary" />
            <span className="text-[17px] font-bold tracking-tight">AutoDuk</span>
          </button>
          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => onNavigate(n.id)}
                className={cn(
                  'u-link tnum text-[12px] uppercase tracking-[0.14em]',
                  view === n.id ? 'text-primary' : 'text-foreground/80 hover:text-foreground',
                )}
              >
                {n.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={onSignIn} className="u-link hidden text-[13px] font-medium sm:block">
              Sign in
            </button>
            <button
              onClick={onGetCovered}
              className="rounded-[3px] bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get covered
            </button>
          </div>
        </div>
        {/* mobile nav row */}
        <nav className="flex items-center gap-5 overflow-x-auto border-t border-foreground/5 px-5 py-2 md:hidden">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => onNavigate(n.id)}
              className={cn(
                'tnum whitespace-nowrap text-[11px] uppercase tracking-[0.14em]',
                view === n.id ? 'text-primary' : 'text-foreground/70',
              )}
            >
              {n.label}
            </button>
          ))}
        </nav>
      </header>

      <main>{children}</main>

      <footer className="mt-28 bg-[#231f20] text-[#faf6ef]">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="font-display max-w-2xl text-[clamp(1.9rem,4vw,3rem)] leading-[1.12]">
            Your deductible, covered — for less than a streaming subscription.
          </p>
          <div className="mt-12 grid gap-10 border-t border-white/10 pt-10 sm:grid-cols-3">
            <div>
              <p className="micro-label !text-[#faf6ef]/50">Explore</p>
              <ul className="mt-4 space-y-2.5 text-[14px]">
                {NAV.map((n) => (
                  <li key={n.id}>
                    <button onClick={() => onNavigate(n.id)} className="u-link text-[#faf6ef]/85">
                      {n.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="micro-label !text-[#faf6ef]/50">Account</p>
              <ul className="mt-4 space-y-2.5 text-[14px]">
                <li><button onClick={onSignIn} className="u-link text-[#faf6ef]/85">Sign in</button></li>
                <li><button onClick={onGetCovered} className="u-link text-[#faf6ef]/85">Get covered</button></li>
                <li><button onClick={onStaff} className="u-link text-[#faf6ef]/50">Staff console</button></li>
              </ul>
            </div>
            <div>
              <p className="micro-label !text-[#faf6ef]/50">Contact</p>
              <ul className="mt-4 space-y-2.5 text-[14px] text-[#faf6ef]/85">
                <li>support@autoduk.com</li>
                <li>United States</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
            <div className="flex items-center gap-2">
              <SquaresMark className="h-5 w-5 text-[#ffbc95]" />
              <span className="text-[13px] font-semibold">AutoDuk</span>
            </div>
            <p className="tnum max-w-xl text-[10.5px] leading-relaxed text-[#faf6ef]/40">
              © 2026 AutoDuk. Deductible reimbursement membership — not an insurance policy.
              Savings figures are estimates from industry-average rates. Payments handled by Stripe.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

/** Stroke-drawn doodle wrapper — paths draw themselves when scrolled into view. */
export function Doodle({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && el.classList.add('visible')),
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={cn('draw', className)} aria-hidden>
      {children}
    </div>
  )
}
