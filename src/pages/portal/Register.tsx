import { useState } from 'react'
import { Check, Shield } from 'lucide-react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const STEPS = ['Account', 'Plan', 'Payment'] as const

export function RegisterPage({ onSignIn, onDone, onBack, initialPlanId = 2 }: {
  onSignIn: () => void
  onDone: () => void
  onBack?: () => void
  initialPlanId?: number
}) {
  const { plans, registerCustomer } = useStore()
  const [step, setStep] = useState(0)

  // step 1
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [err, setErr] = useState('')
  // step 2
  const [planId, setPlanId] = useState(initialPlanId)
  // step 3
  const [cardName, setCardName] = useState('')
  const [cardNum, setCardNum] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [zip, setZip] = useState('')

  const plan = plans.find((p) => p.id === planId)!

  const nextAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) return setErr('Full name is required.')
    if (!email.includes('@')) return setErr('A valid email address is required.')
    if (password.length < 6) return setErr('Password must be at least 6 characters.')
    if (password !== confirm) return setErr('Passwords do not match.')
    setErr('')
    setStep(1)
  }

  const pay = (e: React.FormEvent) => {
    e.preventDefault()
    if (cardName.trim().length < 2) return setErr('Cardholder name is required.')
    if (cardNum.replace(/\s/g, '').length !== 16) return setErr('Enter the 16-digit card number.')
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return setErr('Expiry as MM/YY.')
    if (cvv.length < 3) return setErr('Enter the CVV.')
    if (zip.trim().length < 5) return setErr('Billing ZIP is required.')
    setErr('')
    registerCustomer({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, planId })
    toast.success(`Welcome to AutoDuk — ${plan.name} plan activated`)
    onDone()
  }

  return (
    <div className="min-h-dvh bg-background px-4 py-8">
      <div className="mx-auto max-w-[520px]">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-10 w-10 items-center justify-center bg-primary">
            <Shield className="h-5 w-5 text-[#faf6ef]" strokeWidth={2.4} />
          </span>
          <h1 className="text-[24px] font-semibold tracking-tight">Join AutoDuk</h1>
        </div>

        {/* stepper */}
        <ol className="mb-6 flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              <span className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                i < step ? 'bg-[#2f7d4f] text-white' : i === step ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground',
              )}>
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className={cn('text-sm', i === step ? 'font-semibold' : 'text-muted-foreground')}>{s}</span>
              {i < STEPS.length - 1 && <span className="mx-1 h-px w-8 bg-border" aria-hidden />}
            </li>
          ))}
        </ol>

        <div className="border border-border bg-card p-6">
          {step === 0 && (
            <form onSubmit={nextAccount} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="r-name">Full name</Label>
                <Input id="r-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="rounded-[3px] bg-background" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="r-email">Email address</Label>
                <Input id="r-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="rounded-[3px] bg-background" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="r-phone">Phone number</Label>
                <Input id="r-phone" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" className="rounded-[3px] bg-background" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="r-pass">Password</Label>
                  <Input id="r-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className="rounded-[3px] bg-background" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="r-confirm">Confirm password</Label>
                  <Input id="r-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" className="rounded-[3px] bg-background" />
                </div>
              </div>
              {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
              <Button type="submit" className="w-full rounded-[3px] font-semibold">Continue to plans</Button>
              <p className="text-center text-sm text-muted-foreground">
                Already a member?{' '}
                <button type="button" onClick={onSignIn} className="font-semibold text-primary underline-offset-4 hover:underline">Sign in</button>
              </p>
              {onBack && (
                <p className="text-center">
                  <button type="button" onClick={onBack} className="text-[12.5px] text-muted-foreground underline-offset-4 hover:underline">
                    ← Back to site
                  </button>
                </p>
              )}
            </form>
          )}

          {step === 1 && (
            <div>
              <p className="mb-3 text-sm text-muted-foreground">Choose your deductible protection level.</p>
              <div className="space-y-2">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlanId(p.id)}
                    aria-pressed={planId === p.id}
                    className={cn(
                      'flex w-full items-center justify-between border px-4 py-3 text-left transition-colors duration-150',
                      'focus-visible:outline-2 focus-visible:outline-primary',
                      planId === p.id ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/30',
                    )}
                  >
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-sm text-muted-foreground">Covers up to <span className="tnum">${p.deductibleCoverage.toLocaleString()}</span> deductible</div>
                    </div>
                    <div className="tnum text-lg font-semibold">${p.monthlyPrice}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="ghost" className="rounded-[3px]" onClick={() => setStep(0)}>Back</Button>
                <Button className="flex-1 rounded-[3px] font-semibold" onClick={() => { setErr(''); setStep(2) }}>
                  Continue to payment
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={pay} className="space-y-3.5">
              <div className="flex items-center justify-between border border-border bg-background px-4 py-3 text-sm">
                <span>{plan.name} plan</span>
                <span className="tnum font-semibold">${plan.monthlyPrice}/mo</span>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-name">Cardholder name</Label>
                <Input id="c-name" value={cardName} onChange={(e) => setCardName(e.target.value)} autoComplete="cc-name" className="rounded-[3px] bg-background" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-num">Card number</Label>
                <Input
                  id="c-num" inputMode="numeric" placeholder="4242 4242 4242 4242"
                  value={cardNum}
                  onChange={(e) => setCardNum(e.target.value.replace(/[^\d]/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '))}
                  className="tnum rounded-[3px] bg-background"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="c-exp">Expiry</Label>
                  <Input id="c-exp" placeholder="MM/YY" value={expiry}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^\d]/g, '').slice(0, 4)
                      setExpiry(v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v)
                    }}
                    className="tnum rounded-[3px] bg-background" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-cvv">CVV</Label>
                  <Input id="c-cvv" inputMode="numeric" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/[^\d]/g, '').slice(0, 4))} className="tnum rounded-[3px] bg-background" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-zip">Billing ZIP</Label>
                  <Input id="c-zip" inputMode="numeric" value={zip} onChange={(e) => setZip(e.target.value.slice(0, 10))} className="tnum rounded-[3px] bg-background" />
                </div>
              </div>
              {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
              <p className="border border-accent bg-accent/20 px-3 py-2 text-xs text-[#7a4a20]">
                Test checkout — no real charge. At cutover this step runs through Stripe Elements, so card data never touches our servers.
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" className="rounded-[3px]" onClick={() => setStep(1)}>Back</Button>
                <Button type="submit" className="flex-1 rounded-[3px] font-semibold">
                  Pay ${plan.monthlyPrice}/mo & activate
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
