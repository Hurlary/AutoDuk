import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export function SupportPage() {
  const { customer, addTicket } = useStore()
  const [name, setName] = useState(customer?.name ?? '')
  const [email, setEmail] = useState(customer?.email ?? '')
  const [phone, setPhone] = useState(customer?.phone ?? '')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')

  if (sent) {
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-[#2f7d4f]" strokeWidth={1.8} />
        <h1 className="mt-4 text-[24px] font-semibold tracking-tight">Message received</h1>
        <p className="mt-2 text-muted-foreground">
          Our team typically replies within one business day. Your message is now in the staff support inbox.
        </p>
        <Button className="mt-6 rounded-[3px]" variant="secondary" onClick={() => { setSent(false); setMessage('') }}>
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-[24px] font-semibold tracking-tight">Contact support</h1>
      <p className="mt-1 text-sm text-muted-foreground">Questions about your plan, a claim, or billing — we answer within one business day.</p>

      <form
        className="mt-5 space-y-3.5 border border-border bg-card p-5"
        onSubmit={(e) => {
          e.preventDefault()
          if (name.trim().length < 2) return setErr('Name is required.')
          if (!email.includes('@')) return setErr('A valid email is required.')
          if (message.trim().length < 10) return setErr('Tell us a little more (min. 10 characters).')
          setErr('')
          addTicket({ name: name.trim(), email: email.trim(), message: message.trim(), customerId: customer?.id })
          toast.success('Message sent to support')
          setSent(true)
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="s-name">Name</Label>
            <Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-[3px] bg-background" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-email">Email</Label>
            <Input id="s-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-[3px] bg-background" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="s-phone">Phone (optional)</Label>
          <Input id="s-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-[3px] bg-background" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="s-msg">Message</Label>
          <Textarea id="s-msg" value={message} onChange={(e) => setMessage(e.target.value)}
            className="min-h-[110px] rounded-[3px] bg-background" placeholder="How can we help?" />
        </div>
        {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
        <Button type="submit" className="w-full rounded-[3px] font-semibold">Send message</Button>
      </form>
    </div>
  )
}
