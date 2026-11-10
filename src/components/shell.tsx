import type { ReactNode } from 'react'
import {
  Car, ClipboardCheck, LayoutDashboard, LogOut, Shield, TicketCheck, Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/store'
import { supabaseEnabled } from '@/lib/supabase'
import { SquaresMark } from '@/components/bits'
import type { View } from '@/App'

const NAV: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'customers', label: 'Customers', icon: Car },
  { id: 'claims', label: 'Claims', icon: ClipboardCheck },
  { id: 'tickets', label: 'Support', icon: TicketCheck },
]

export function AppShell({ view, onNavigate, children, onSignedOut }: { view: View; onNavigate: (v: View) => void; children: ReactNode; onSignedOut?: () => void }) {
  const { user, signOut, leads, claims, tickets } = useStore()
  const openClaims = claims.filter((c) => !['paid', 'denied'].includes(c.status)).length
  const newLeads = leads.filter((l) => l.status === 'new').length
  const openTickets = tickets.filter((t) => t.status === 'open').length

  const badgeFor = (id: View): number | null => {
    if (id === 'leads') return newLeads || null
    if (id === 'claims') return openClaims || null
    if (id === 'tickets') return openTickets || null
    return null
  }

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Ink sidebar */}
      <aside className="sticky top-0 flex h-dvh w-[212px] shrink-0 flex-col bg-[#231f20] text-[#e8e2d8] max-md:hidden">
        <div className="flex items-center gap-2.5 px-5 pb-6 pt-5">
          <span className="flex h-8 w-8 items-center justify-center bg-primary">
            <Shield className="h-4.5 w-4.5 text-[#faf6ef]" strokeWidth={2.4} />
          </span>
          <div className="leading-tight">
            <div className="text-[15px] font-semibold tracking-tight text-[#faf6ef]">AutoDuk</div>
            <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#96908c]">Ops Console</div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-2.5">
          {NAV.map((item) => {
            const active = view === item.id
            const badge = badgeFor(item.id)
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-[3px] px-3 py-2 text-left text-[14px] transition-colors duration-150',
                  'focus-visible:outline-2 focus-visible:outline-primary',
                  active
                    ? 'bg-primary font-medium text-[#faf6ef]'
                    : 'text-[#c9c2b8] hover:bg-white/5 hover:text-[#faf6ef]',
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span className="flex-1">{item.label}</span>
                {badge !== null && (
                  <span className={cn(
                    'tnum rounded-[2px] px-1.5 py-px text-[11px] font-semibold',
                    active ? 'bg-white/20 text-[#faf6ef]' : 'bg-[#ffbc95] text-[#231f20]',
                  )}>
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-2.5 px-1 py-1.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ffbc95] text-[13px] font-semibold text-[#231f20]">
              {user?.name.split(' ').map((w) => w[0]).join('')}
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-[13px] font-medium text-[#faf6ef]">{user?.name}</div>
              <div className="text-[11px] capitalize text-[#96908c]">{user?.role}</div>
            </div>
            <button
              onClick={() => { signOut(); onSignedOut?.() }}
              title="Sign out"
              className="rounded-[3px] p-1.5 text-[#96908c] transition-colors hover:bg-white/10 hover:text-[#faf6ef] focus-visible:outline-2 focus-visible:outline-primary"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center gap-1 overflow-x-auto border-b border-border bg-[#231f20] px-3 py-2 md:hidden">
        <Shield className="mr-1 h-5 w-5 shrink-0 text-primary" />
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              'whitespace-nowrap rounded-[3px] px-2.5 py-1.5 text-[13px] transition-colors',
              view === item.id ? 'bg-primary font-medium text-[#faf6ef]' : 'text-[#c9c2b8]',
            )}
          >
            {item.label}
          </button>
        ))}
        <button onClick={() => { signOut(); onSignedOut?.() }} className="ml-auto p-1.5 text-[#96908c]" title="Sign out">
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      <main className="min-w-0 flex-1 px-5 py-6 max-md:pt-16 md:px-8 md:py-7">
        {!supabaseEnabled && (
          <div className="mb-5 flex items-center gap-2 border border-[#ffbc95] bg-[#ffbc95]/15 px-3.5 py-2 text-[13px] text-[#7a4a20]">
            <SquaresMark />
            <span>
              <strong>Demo workspace</strong> — data resets on reload. Connect Supabase credentials to run on the live database.
            </span>
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
