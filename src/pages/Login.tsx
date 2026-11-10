import { useState } from 'react'
import { Shield } from 'lucide-react'
import { useStore } from '@/lib/store'
import { SquaresMark } from '@/components/bits'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function LoginPage({ onBack }: { onBack: () => void }) {
  const { signIn, staff } = useStore()
  const [email, setEmail] = useState('dana@autoduk.com')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'agent'>('admin')
  const [error, setError] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) {
      setError('Enter a valid staff email address.')
      return
    }
    if (password.length > 0 && password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setError('')
    signIn(email, role)
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center bg-primary">
            <Shield className="h-6 w-6 text-[#faf6ef]" strokeWidth={2.4} />
          </span>
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight">AutoDuk Ops Console</h1>
            <p className="mt-1 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <SquaresMark /> Staff sign-in
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4 border border-border bg-card p-6">
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Role">
            {(['admin', 'agent'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRole(r)
                  setEmail(r === 'admin' ? 'dana@autoduk.com' : 'marcus@autoduk.com')
                }}
                className={cn(
                  'rounded-[3px] border px-3 py-2 text-sm font-medium capitalize transition-colors duration-150',
                  'focus-visible:outline-2 focus-visible:outline-primary',
                  role === r
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-transparent hover:border-foreground/30',
                )}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email" type="email" value={email} autoComplete="username"
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-[3px] bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password" type="password" value={password} autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Anything works in demo mode"
              className="rounded-[3px] bg-background"
            />
          </div>

          {error && (
            <p role="alert" className="border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full rounded-[3px] font-semibold">
            Sign in
          </Button>

          <div className="border-t border-border pt-3 text-[13px] text-muted-foreground">
            <p className="micro-label mb-1.5">Demo staff accounts</p>
            {staff.map((s) => (
              <div key={s.id} className="flex justify-between py-0.5">
                <span className="tnum text-xs">{s.email}</span>
                <span className="capitalize">{s.role}</span>
              </div>
            ))}
          </div>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Customer portal access is separate. Staff accounts are created by invite only.
        </p>
        <p className="mt-2 text-center">
          <button onClick={onBack} className="text-xs text-muted-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-primary">
            ← Back to entrance
          </button>
        </p>
      </div>
    </div>
  )
}
