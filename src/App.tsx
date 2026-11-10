import { useState } from 'react'
import { StoreProvider, useStore } from '@/lib/store'
import { AppShell } from '@/components/shell'
import { LoginPage } from '@/pages/Login'
import { DashboardPage } from '@/pages/Dashboard'
import { LeadsPage } from '@/pages/Leads'
import { CustomersPage } from '@/pages/Customers'
import { ClaimsPage } from '@/pages/Claims'
import { TicketsPage } from '@/pages/Tickets'
import { PortalLogin } from '@/pages/portal/PortalLogin'
import { RegisterPage } from '@/pages/portal/Register'
import { PortalShell, type PortalView } from '@/pages/portal/PortalShell'
import { CustomerDashboard } from '@/pages/portal/CustomerDashboard'
import { FileClaimPage } from '@/pages/portal/FileClaim'
import { SupportPage } from '@/pages/portal/Support'
import { MarketingShell, type MktView } from '@/pages/marketing/MarketingShell'
import { HomePage } from '@/pages/marketing/Home'
import { HowItWorksPage } from '@/pages/marketing/HowItWorks'
import { PlansPage } from '@/pages/marketing/PlansPage'
import { CalculatorPage } from '@/pages/marketing/CalculatorPage'
import { FaqPage } from '@/pages/marketing/FaqPage'
import { ContactPage } from '@/pages/marketing/ContactPage'
import { Toaster } from '@/components/ui/sonner'

export type View = 'dashboard' | 'leads' | 'customers' | 'claims' | 'tickets'
type Mode = 'marketing' | 'staff-auth' | 'portal-auth' | 'portal-register'

function Inner() {
  const { user, customer } = useStore()
  const [mode, setMode] = useState<Mode>('marketing')
  const [view, setView] = useState<View>('dashboard')
  const [portalView, setPortalView] = useState<PortalView>('dashboard')
  const [mktView, setMktView] = useState<MktView>('home')
  const [registerPlan, setRegisterPlan] = useState<number>(2)

  const goMarketing = (v: MktView) => {
    setMktView(v)
    window.scrollTo(0, 0)
  }
  const goRegister = (planId?: number) => {
    if (planId) setRegisterPlan(planId)
    setMode('portal-register')
    window.scrollTo(0, 0)
  }

  // staff console
  if (user) {
    return (
      <AppShell view={view} onNavigate={setView} onSignedOut={() => { setMode('marketing'); setMktView('home'); window.scrollTo(0, 0) }}>
        {view === 'dashboard' && <DashboardPage onNavigate={setView} />}
        {view === 'leads' && <LeadsPage />}
        {view === 'customers' && <CustomersPage />}
        {view === 'claims' && <ClaimsPage />}
        {view === 'tickets' && <TicketsPage />}
      </AppShell>
    )
  }

  // customer portal (signed in)
  if (customer) {
    return (
      <PortalShell
        view={portalView}
        onNavigate={setPortalView}
        onSignedOut={() => { setMode('marketing'); setMktView('home'); window.scrollTo(0, 0) }}
      >
        {portalView === 'dashboard' && <CustomerDashboard onNavigate={setPortalView} />}
        {portalView === 'claim' && <FileClaimPage onNavigate={setPortalView} />}
        {portalView === 'support' && <SupportPage />}
      </PortalShell>
    )
  }

  // signed out
  if (mode === 'staff-auth') return <LoginPage onBack={() => setMode('marketing')} />
  if (mode === 'portal-register') {
    return (
      <RegisterPage
        initialPlanId={registerPlan}
        onSignIn={() => setMode('portal-auth')}
        onBack={() => setMode('marketing')}
        onDone={() => setPortalView('dashboard')}
      />
    )
  }
  if (mode === 'portal-auth') {
    return <PortalLogin onRegister={() => goRegister()} onBack={() => setMode('marketing')} />
  }
  return (
    <MarketingShell
      view={mktView}
      onNavigate={goMarketing}
      onSignIn={() => setMode('portal-auth')}
      onGetCovered={() => goRegister()}
      onStaff={() => setMode('staff-auth')}
    >
      {mktView === 'home' && <HomePage onNavigate={goMarketing} onGetCovered={goRegister} />}
      {mktView === 'how' && <HowItWorksPage onGetCovered={goRegister} />}
      {mktView === 'plans' && <PlansPage onGetCovered={goRegister} onNavigate={goMarketing} />}
      {mktView === 'calculator' && <CalculatorPage onGetCovered={goRegister} />}
      {mktView === 'faq' && <FaqPage onNavigate={goMarketing} />}
      {mktView === 'contact' && <ContactPage />}
    </MarketingShell>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Inner />
      <Toaster position="bottom-right" toastOptions={{ style: { borderRadius: 3 } }} />
    </StoreProvider>
  )
}
