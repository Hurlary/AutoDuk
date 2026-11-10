import { ArrowRight, Shield, UserRound } from 'lucide-react'
import { SquaresMark } from '@/components/bits'

export function EntryPage({ onCustomer, onStaff }: { onCustomer: () => void; onStaff: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center gap-2.5 px-6 py-5">
        <span className="flex h-8 w-8 items-center justify-center bg-primary">
          <Shield className="h-4.5 w-4.5 text-[#faf6ef]" strokeWidth={2.4} />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">AutoDuk</span>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[720px] text-center">
          <SquaresMark className="mx-auto mb-4 text-foreground" />
          <h1 className="text-[30px] font-semibold leading-tight tracking-tight">
            Deductible protection, handled.
          </h1>
          <p className="mx-auto mt-2 max-w-[52ch] text-muted-foreground">
            One workspace for AutoDuk members and the team behind them. Choose where you're headed.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              onClick={onCustomer}
              className="group border border-border bg-card p-6 text-left transition-all duration-150 hover:border-primary hover:shadow-[0_3px_0_0_#2e54fe] focus-visible:outline-2 focus-visible:outline-primary"
            >
              <UserRound className="h-6 w-6 text-primary" strokeWidth={2} />
              <h2 className="mt-3 text-lg font-semibold">Customer portal</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your plan, add vehicles, and file a deductible claim.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Sign in or register <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </span>
            </button>

            <button
              onClick={onStaff}
              className="group border border-border bg-card p-6 text-left transition-all duration-150 hover:border-foreground/40 hover:shadow-[0_3px_0_0_#231f20] focus-visible:outline-2 focus-visible:outline-primary"
            >
              <Shield className="h-6 w-6" strokeWidth={2} />
              <h2 className="mt-3 text-lg font-semibold">Staff console</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Leads, customers, claims review, and support — for the AutoDuk team.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold">
                Ops console <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </span>
            </button>
          </div>

          <p className="mt-8 text-xs text-muted-foreground">
            Marketing site stays on the current domain until cutover — this build covers the portal and the console.
          </p>
        </div>
      </main>
    </div>
  )
}
