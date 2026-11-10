import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from 'react'
import type {
  Claim, ClaimDoc, ClaimStatus, Customer, Eligibility, Lead, LeadStatus,
  Plan, StaffUser, Ticket, TicketStatus, Vehicle,
} from '@/types'
import { DEMO_CLAIMS, DEMO_CUSTOMERS, DEMO_LEADS, DEMO_TICKETS, PLANS, STAFF } from '@/lib/demo-data'
import { supabase, supabaseEnabled, camelize } from '@/lib/supabase'

export interface NewClaimInput {
  customerId: string
  vehicleLabel: string
  incidentDate: string
  description: string
  street: string
  city: string
  state: string
  zip: string
  docs: ClaimDoc[]
}

interface Store {
  ready: boolean
  // staff session
  user: StaffUser | null
  signIn: (email: string, role: 'admin' | 'agent') => void
  signOut: () => void
  // customer session
  customer: Customer | null
  customerSignIn: (email: string) => boolean
  customerSignOut: () => void
  registerCustomer: (data: { name: string; email: string; phone?: string; planId: number }) => Customer
  updateCustomerProfile: (id: string, data: { name: string; phone?: string }) => void
  addVehicle: (customerId: string, v: Omit<Vehicle, 'id'>) => void
  submitClaim: (data: NewClaimInput) => Claim
  addTicket: (data: { name: string; email: string; message: string; customerId?: string }) => void
  // data
  plans: Plan[]
  staff: StaffUser[]
  leads: Lead[]
  customers: Customer[]
  claims: Claim[]
  tickets: Ticket[]
  // staff actions
  moveLead: (id: string, status: LeadStatus) => void
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'notes' | 'status'>) => string
  addLeadNote: (id: string, body: string) => void
  assignLead: (id: string, staffId: string | undefined) => void
  setClaimStatus: (id: string, status: ClaimStatus, detail?: { amount?: number; reason?: string }) => void
  assignClaim: (id: string, staffId: string | undefined) => void
  setTicketStatus: (id: string, status: TicketStatus) => void
  assignTicket: (id: string, staffId: string | undefined) => void
  // helpers
  customerById: (id: string) => Customer | undefined
  planById: (id: number) => Plan | undefined
  staffById: (id?: string) => StaffUser | undefined
  eligibilityFor: (claim: Claim) => Eligibility
  eligibilityForCustomer: (customerId: string) => Eligibility
}

const Ctx = createContext<Store | null>(null)

const uid = () => Math.random().toString(36).slice(2, 10)
const now = () => new Date().toISOString()

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!supabaseEnabled)
  const [user, setUser] = useState<StaffUser | null>(null)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [leads, setLeads] = useState<Lead[]>(DEMO_LEADS)
  const [customers, setCustomers] = useState<Customer[]>(DEMO_CUSTOMERS)
  const [claims, setClaims] = useState<Claim[]>(DEMO_CLAIMS)
  const [tickets, setTickets] = useState<Ticket[]>(DEMO_TICKETS)

  const customer = customers.find((c) => c.id === customerId) ?? null

  // When Supabase env vars are present, hydrate from the real database.
  // Falls back to demo data if anything fails so the UI never dead-ends.
  useEffect(() => {
    if (!supabaseEnabled || !supabase) return
    ;(async () => {
      try {
        const [l, c, cl, t] = await Promise.all([
          supabase.from('leads').select('*').order('created_at', { ascending: false }),
          supabase.from('customers').select('*, vehicles(*)'),
          supabase.from('claims').select('*, claim_documents(*)').order('submitted_at', { ascending: false }),
          supabase.from('support_tickets').select('*').order('created_at', { ascending: false }),
        ])
        if (l.error) throw l.error
        if (c.error) throw c.error
        if (cl.error) throw cl.error
        if (t.error) throw t.error
        setLeads(l.data.map((r) => {
          const m = camelize<Record<string, unknown>>(r)
          return { ...m, name: m.fullName, notes: [] } as unknown as Lead
        }))
        setCustomers(c.data.map((r) => {
          const m = camelize<Record<string, unknown>>(r)
          const vs = (m.vehicles as Record<string, unknown>[] | undefined) ?? []
          return { ...m, name: (m.fullName as string) ?? (m.name as string) ?? '', vehicles: vs.map((v) => camelize(v)) } as unknown as Customer
        }))
        setClaims(cl.data.map((r) => {
          const m = camelize<Record<string, unknown>>(r)
          const docs = (m.claimDocuments as Record<string, unknown>[] | undefined) ?? []
          return {
            ...m,
            vehicleLabel: (m.vehicleLabel as string) ?? '—',
            docs: docs.map((dd) => camelize(dd)),
            timeline: [],
          } as unknown as Claim
        }))
        setTickets(t.data.map((r) => camelize(r) as unknown as Ticket))
      } catch (err) {
        console.warn('Supabase load failed, using demo data', err)
      } finally {
        setReady(true)
      }
    })()
  }, [])

  // best-effort remote write; local state is already updated optimistically
  const persist = useCallback((fn: () => void) => {
    if (!supabaseEnabled) return
    try { fn() } catch { /* demo continues locally */ }
  }, [])

  // ---------- staff auth (demo) ----------
  const signIn = useCallback((email: string, role: 'admin' | 'agent') => {
    const match = STAFF.find((s) => s.email === email && s.role === role)
    setUser(match ?? { id: role === 'admin' ? 'u1' : 'u2', name: role === 'admin' ? 'Dana Whitfield' : 'Marcus Cole', email, role })
  }, [])
  const signOut = useCallback(() => setUser(null), [])

  // ---------- customer auth + onboarding (demo) ----------
  const customerSignIn = useCallback((email: string): boolean => {
    const found = customers.find((c) => c.email.toLowerCase() === email.trim().toLowerCase())
    if (!found) return false
    setCustomerId(found.id)
    return true
  }, [customers])
  const customerSignOut = useCallback(() => setCustomerId(null), [])

  const registerCustomer = useCallback((data: { name: string; email: string; phone?: string; planId: number }): Customer => {
    const c: Customer = {
      id: uid(), name: data.name, email: data.email, phone: data.phone,
      planId: data.planId, status: 'active', memberSince: now(), vehicles: [],
    }
    setCustomers((cs) => [c, ...cs])
    setCustomerId(c.id)
    persist(() => {
      void supabase?.from('customers').insert({
        id: c.id, full_name: c.name, email: c.email, phone: c.phone, plan_id: c.planId,
      })
    })
    return c
  }, [persist])

  const updateCustomerProfile = useCallback((id: string, data: { name: string; phone?: string }) => {
    setCustomers((cs) => cs.map((c) => (c.id === id ? { ...c, ...data } : c)))
  }, [])

  const addVehicle = useCallback((customerIdArg: string, v: Omit<Vehicle, 'id'>) => {
    setCustomers((cs) => cs.map((c) => (c.id === customerIdArg
      ? { ...c, vehicles: [...c.vehicles, { ...v, id: uid() }] }
      : c)))
  }, [])

  const submitClaim = useCallback((data: NewClaimInput): Claim => {
    const maxNum = claims.reduce((m, c) => {
      const n = parseInt(c.claimNumber.split('-')[2] ?? '0', 10)
      return Number.isFinite(n) ? Math.max(m, n) : m
    }, 104)
    const claim: Claim = {
      id: uid(),
      claimNumber: `ADK-2026-${String(maxNum + 1).padStart(4, '0')}`,
      customerId: data.customerId,
      vehicleLabel: data.vehicleLabel,
      incidentDate: data.incidentDate,
      description: data.description,
      city: data.city, state: data.state,
      status: 'submitted',
      deductibleAmount: PLANS.find((p) => p.id === customers.find((c) => c.id === data.customerId)?.planId)?.deductibleCoverage ?? 0,
      submittedAt: now(),
      docs: data.docs,
      timeline: [{ id: uid(), actor: 'System', action: 'Claim submitted by customer', at: now() }],
    }
    setClaims((cs) => [claim, ...cs])
    persist(() => {
      void supabase?.from('claims').insert({
        id: claim.id, claim_number: claim.claimNumber, customer_id: claim.customerId,
        incident_date: claim.incidentDate, description: claim.description,
        street: data.street, city: data.city, state: data.state, zip: data.zip,
        deductible_amount: claim.deductibleAmount,
      })
    })
    return claim
  }, [claims, customers, persist])

  const addTicket = useCallback((data: { name: string; email: string; message: string; customerId?: string }) => {
    const t: Ticket = { id: uid(), ...data, status: 'open', createdAt: now() }
    setTickets((ts) => [t, ...ts])
    persist(() => {
      void supabase?.from('support_tickets').insert({
        id: t.id, name: t.name, email: t.email, message: t.message, customer_id: t.customerId ?? null,
      })
    })
  }, [persist])

  // ---------- staff actions ----------
  const moveLead = useCallback((id: string, status: LeadStatus) => {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)))
    persist(() => { void supabase?.from('leads').update({ status }).eq('id', id) })
  }, [persist])

  const addLead = useCallback((lead: Omit<Lead, 'id' | 'createdAt' | 'notes' | 'status'>): string => {
    const id = uid()
    setLeads((ls) => [{ ...lead, id, status: 'new' as LeadStatus, notes: [], createdAt: now() }, ...ls])
    persist(() => {
      void supabase?.from('leads').insert({
        id, full_name: lead.name, email: lead.email, phone: lead.phone,
        source: lead.source, state: lead.state,
      })
    })
    return id
  }, [persist])

  const addLeadNote = useCallback((id: string, body: string) => {
    setLeads((ls) => ls.map((l) => l.id === id
      ? { ...l, notes: [...l.notes, { id: uid(), author: user?.name ?? 'You', body, at: now() }] }
      : l))
  }, [user])

  const assignLead = useCallback((id: string, staffId: string | undefined) => {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, assignedTo: staffId } : l)))
    persist(() => { void supabase?.from('leads').update({ assigned_to: staffId ?? null }).eq('id', id) })
  }, [persist])

  const setClaimStatus = useCallback((id: string, status: ClaimStatus, detail?: { amount?: number; reason?: string }) => {
    const actor = user?.name ?? 'You'
    setClaims((cs) => cs.map((c) => {
      if (c.id !== id) return c
      const action =
        status === 'approved' ? `Approved for $${(detail?.amount ?? c.deductibleAmount).toLocaleString()}.00`
        : status === 'denied' ? `Denied: ${detail?.reason ?? 'no reason given'}`
        : status === 'info_requested' ? 'Requested additional information'
        : status === 'paid' ? 'Marked as paid'
        : `Moved to ${status.replace('_', ' ')}`
      return {
        ...c,
        status,
        approvedAmount: status === 'approved' ? detail?.amount ?? c.deductibleAmount : c.approvedAmount,
        denialReason: status === 'denied' ? detail?.reason : c.denialReason,
        resolvedAt: status === 'paid' || status === 'denied' ? now() : c.resolvedAt,
        timeline: [...c.timeline, { id: uid(), actor, action, at: now() }],
      }
    }))
    persist(() => {
      void supabase?.from('claims').update({
        status,
        approved_amount: status === 'approved' ? detail?.amount ?? null : undefined,
        denial_reason: status === 'denied' ? detail?.reason : undefined,
        resolved_at: status === 'paid' || status === 'denied' ? now() : undefined,
      }).eq('id', id)
    })
  }, [persist, user])

  const assignClaim = useCallback((id: string, staffId: string | undefined) => {
    setClaims((cs) => cs.map((c) => (c.id === id ? { ...c, assignedTo: staffId } : c)))
    persist(() => { void supabase?.from('claims').update({ assigned_to: staffId ?? null }).eq('id', id) })
  }, [persist])

  const setTicketStatus = useCallback((id: string, status: TicketStatus) => {
    setTickets((ts) => ts.map((t) => (t.id === id ? { ...t, status } : t)))
    persist(() => { void supabase?.from('support_tickets').update({ status }).eq('id', id) })
  }, [persist])

  const assignTicket = useCallback((id: string, staffId: string | undefined) => {
    setTickets((ts) => ts.map((t) => (t.id === id ? { ...t, assignedTo: staffId } : t)))
    persist(() => { void supabase?.from('support_tickets').update({ assigned_to: staffId ?? null }).eq('id', id) })
  }, [persist])

  // ---------- helpers ----------
  const customerById = useCallback((id: string) => customers.find((c) => c.id === id), [customers])
  const planById = useCallback((id: number) => PLANS.find((p) => p.id === id), [])
  const staffById = useCallback((id?: string) => STAFF.find((s) => s.id === id), [])

  const eligibilityForCustomer = useCallback((customerIdArg: string): Eligibility => {
    const c = customers.find((x) => x.id === customerIdArg)
    if (!c) return { eligible: false, tenureOk: false, tenureMonths: 0, yearlyLimitOk: false, reasons: ['Customer record not found'] }
    const tenureMonths = Math.floor((Date.now() - new Date(c.memberSince).getTime()) / (30.44 * 864e5))
    const tenureOk = tenureMonths >= 3
    const twelveMonthsAgo = Date.now() - 365 * 864e5
    const priorClaims = claims.filter(
      (cl) => cl.customerId === customerIdArg && new Date(cl.submittedAt).getTime() >= twelveMonthsAgo,
    )
    const yearlyLimitOk = priorClaims.length === 0
    const reasons: string[] = []
    if (!tenureOk) reasons.push('You must be a customer for 3 months before filing a claim')
    if (!yearlyLimitOk) reasons.push('You have reached your yearly claim limit')
    if (c.status !== 'active') reasons.push(`Your account is ${c.status.replace('_', ' ')}`)
    return { eligible: tenureOk && yearlyLimitOk && c.status === 'active', tenureOk, tenureMonths, yearlyLimitOk, reasons }
  }, [claims, customers])

  const eligibilityFor = useCallback((claim: Claim): Eligibility => {
    // Staff-side: judge eligibility as of the moment the claim was filed,
    // excluding the claim itself from the 12-month lookback.
    const c = customers.find((x) => x.id === claim.customerId)
    if (!c) return { eligible: false, tenureOk: false, tenureMonths: 0, yearlyLimitOk: false, reasons: ['Customer record not found'] }
    const filedAt = new Date(claim.submittedAt).getTime()
    const tenureMonths = Math.floor((filedAt - new Date(c.memberSince).getTime()) / (30.44 * 864e5))
    const tenureOk = tenureMonths >= 3
    const windowStart = filedAt - 365 * 864e5
    const priorClaims = claims.filter(
      (cl) => cl.customerId === claim.customerId && cl.id !== claim.id
        && new Date(cl.submittedAt).getTime() >= windowStart
        && new Date(cl.submittedAt).getTime() <= filedAt,
    )
    const yearlyLimitOk = priorClaims.length === 0
    const reasons: string[] = []
    if (!tenureOk) reasons.push('Member for under 3 months when claim was filed')
    if (!yearlyLimitOk) reasons.push('Already filed a claim within 12 months')
    if (c.status !== 'active') reasons.push(`Account is ${c.status.replace('_', ' ')}`)
    return { eligible: tenureOk && yearlyLimitOk && c.status === 'active', tenureOk, tenureMonths, yearlyLimitOk, reasons }
  }, [claims, customers])

  const value = useMemo<Store>(() => ({
    ready, user, signIn, signOut,
    customer, customerSignIn, customerSignOut, registerCustomer, updateCustomerProfile, addVehicle,
    submitClaim, addTicket,
    plans: PLANS, staff: STAFF, leads, customers, claims, tickets,
    moveLead, addLead, addLeadNote, assignLead,
    setClaimStatus, assignClaim, setTicketStatus, assignTicket,
    customerById, planById, staffById, eligibilityFor, eligibilityForCustomer,
  }), [ready, user, signIn, signOut, customer, customerSignIn, customerSignOut,
    registerCustomer, updateCustomerProfile, addVehicle, submitClaim, addTicket,
    leads, customers, claims, tickets,
    moveLead, addLead, addLeadNote, assignLead, setClaimStatus, assignClaim,
    setTicketStatus, assignTicket, customerById, planById, staffById, eligibilityFor, eligibilityForCustomer])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore(): Store {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore outside provider')
  return s
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 6e4)
  if (mins < 60) return `${Math.max(mins, 1)}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return fmtDate(iso)
}

export function tenureLabel(iso: string): string {
  const months = Math.floor((Date.now() - new Date(iso).getTime()) / (30.44 * 864e5))
  if (months < 1) return '<1 mo'
  return `${months} mo`
}
