import { useState } from 'react'
import { Shield } from 'lucide-react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function PortalLogin({ onRegister, onBack }: { onRegister: () => void; onBack: () => void }) {
  const { customerSignIn, customers, eligibilityForCustomer } = useStore()
  const [email, setEmail] = useState('maya.torres@gmail.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  const DEMO_EMAILS = ['maya.torres@gmail.com', 'grace.okafor@gmail.com', 'tom.becker@proton.me', 't.alvarez@gmail.com']
  const demoAccounts = DEMO_EMAILS.map((e) => customers.find((c) => c.email === e)).filter((c): c is NonNullable<typeof c> => !!c)

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center bg-primary">
            <Shield className="h-6 w-6 text-[#faf6ef]" strokeWidth={2.4} />
          </span>
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to your AutoDuk account</p>
          </div>
        </div>

        <form
          className="space-y-4 border border-border bg-card p-6"
          onSubmit={(e) => {
            e.preventDefault()
            if (!email.includes('@')) return setError('Enter the email you registered with.')
            if (password.length > 0 && password.length < 6) return setError('Password must be at least 6 characters.')
            if (!customerSignIn(email)) return setError('No AutoDuk account found for that email.')
            setError('')
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="p-email">Email address</Label>
            <Input id="p-email" type="email" value={email} autoComplete="username"
              onChange={(e) => setEmail(e.target.value)} className="rounded-[3px] bg-background" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="p-pass">Password</Label>
              <button
                type="button"
                onClick={() => setForgotSent(true)}
                className="text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-primary"
              >
                Forgot password?
              </button>
            </div>
            <Input id="p-pass" type="password" value={password} autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Anything works in demo mode"
              className="rounded-[3px] bg-background" />
          </div>

          {forgotSent && (
            <p role="status" className="border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
              If that email is registered, a reset link is on its way. (Demo: nothing is actually sent.)
            </p>
          )}
          {error && (
            <p role="alert" className="border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full rounded-[3px] font-semibold">Sign in</Button>

          <div className="border-t border-border pt-3 text-center text-sm">
            New to AutoDuk?{' '}
            <button type="button" onClick={onRegister} className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-primary">
              Create an account
            </button>
          </div>
        </form>

        <div className="mt-4 border border-border bg-card p-4 text-[13px]">
          <p className="micro-label mb-1.5">Demo customer accounts</p>
          {demoAccounts.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setEmail(c.email)}
              className="flex w-full justify-between py-0.5 text-left transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
            >
              <span className="tnum text-xs">{c.email}</span>
              <span className="text-muted-foreground">{c.name.split(' ')[0]}{eligibilityForCustomer(c.id).eligible ? ' · eligible' : ''}</span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-center">
          <button onClick={onBack} className="text-xs text-muted-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-primary">
            ← Back to entrance
          </button>
        </p>
      </div>
    </div>
  )
}
