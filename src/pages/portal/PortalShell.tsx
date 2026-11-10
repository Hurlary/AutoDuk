import type { ReactNode } from 'react'
import { LogOut, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/store'

export type PortalView = 'dashboard' | 'claim' | 'support'

const NAV: { id: PortalView; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'claim', label: 'File a claim' },
  { id: 'support', label: 'Support' },
]

export function PortalShell({ view, onNavigate, children, onSignedOut }: {
  view: PortalView
  onNavigate: (v: PortalView) => void
  children: ReactNode
  onSignedOut?: () => void
}) {
  const { customer, customerSignOut } = useStore()

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center bg-primary">
              <Shield className="h-4.5 w-4.5 text-[#faf6ef]" strokeWidth={2.4} />
            </span>
            <div className="leading-tight">
              <div className="text-[15px] font-semibold tracking-tight">AutoDuk</div>
              <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Member portal</div>
            </div>
          </div>

          <nav className="ml-4 flex flex-1 items-center gap-1">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                aria-current={view === item.id ? 'page' : undefined}
                className={cn(
                  'rounded-[3px] px-3 py-1.5 text-sm font-medium transition-colors duration-150',
                  'focus-visible:outline-2 focus-visible:outline-primary',
                  view === item.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <span className="hidden text-sm text-muted-foreground sm:block">{customer?.name}</span>
            <button
              onClick={() => { customerSignOut(); onSignedOut?.() }}
              title="Sign out"
              className="rounded-[3px] p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-7">{children}</main>
    </div>
  )
}
