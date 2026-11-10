import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Reveal } from '@/components/reveal'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function ContactPage() {
  const { addLead, addLeadNote } = useStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [err, setErr] = useState('')
  const [sent, setSent] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) return setErr('Your name is required.')
    if (!email.includes('@')) return setErr('A valid email address is required.')
    if (message.trim().length < 5) return setErr('Tell us what you need in a few words.')
    setErr('')
    const id = addLead({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, source: 'website' })
    addLeadNote(id, `Website contact form: ${message.trim()}`)
    setSent(true)
    toast.success('Message sent — we reply within one business day.')
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pt-14 md:pt-20">
      <div className="grid gap-14 md:grid-cols-2">
        <Reveal>
          <p className="micro-label">Contact</p>
          <h1 className="font-display mt-4 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.08]">
            Talk to a human.
          </h1>
          <p className="mt-5 max-w-md text-[15.5px] leading-relaxed text-foreground/70">
            Questions about plans, your policy math, or a claim in progress — write to us and a
            real person replies within one business day.
          </p>
          <div className="mt-10 space-y-5">
            <div>
              <p className="micro-label">Email</p>
              <p className="tnum mt-1.5 text-[15px] font-semibold">support@autoduk.com</p>
            </div>
            <div>
              <p className="micro-label">Response time</p>
              <p className="tnum mt-1.5 text-[15px] font-semibold">&lt; 1 business day</p>
            </div>
            <div>
              <p className="micro-label">Based in</p>
              <p className="tnum mt-1.5 text-[15px] font-semibold">United States</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          {sent ? (
            <div className="rounded-[3px] border border-foreground/10 bg-card p-10 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
              <h2 className="font-display mt-5 text-[24px]">Message received.</h2>
              <p className="mx-auto mt-3 max-w-xs text-[14.5px] leading-relaxed text-foreground/70">
                We’ll get back to <span className="tnum font-semibold">{email}</span> within one
                business day.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5 rounded-[3px] border border-foreground/10 bg-card p-7">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="c-name">Name</Label>
                  <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-phone">Phone <span className="text-muted-foreground">(optional)</span></Label>
                  <Input id="c-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 000-0000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-email">Email</Label>
                <Input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-msg">How can we help?</Label>
                <Textarea
                  id="c-msg"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="I have a $1,000 deductible and a $1,600 premium — is the Standard plan worth it for me?"
                  rows={5}
                />
              </div>
              {err && <p className="text-[13px] font-medium text-destructive">{err}</p>}
              <Button type="submit" className="w-full rounded-[3px]">Send message</Button>
              <p className="tnum text-center text-[10.5px] text-muted-foreground">
                Goes straight to our team’s inbox — no ticket bots.
              </p>
            </form>
          )}
        </Reveal>
      </div>
    </div>
  )
}
