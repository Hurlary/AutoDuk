import { Reveal } from '@/components/reveal'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import type { MktView } from './MarketingShell'

const FAQS = [
  {
    q: 'Is AutoDuk insurance?',
    a: 'No. AutoDuk is a deductible reimbursement membership. Your auto insurance stays with your insurer — we reimburse your deductible when a covered incident happens. It\'s a complement to your policy, not a replacement.',
  },
  {
    q: 'When can I file my first claim?',
    a: 'After 3 months of continuous membership. The wait keeps the pool honest and the monthly price low. Sign up today and coverage opens in month three.',
  },
  {
    q: 'How many claims can I file?',
    a: 'One approved claim per rolling 12-month window per membership. If you file on June 1st, your next claim window opens the following June.',
  },
  {
    q: 'What do I need to file a claim?',
    a: 'A description of the incident, where it happened, photos of the damage, and a repair estimate or your insurer\'s claim summary. The portal walks you through it in about ten minutes.',
  },
  {
    q: 'How fast do I get paid?',
    a: 'Approved claims are paid within 3–5 business days. You\'ll see every status change — submitted, under review, approved, paid — in your portal as it happens.',
  },
  {
    q: 'Does raising my deductible really save that much?',
    a: 'Industry averages put the savings around 10% of your premium for a $500 → $1,000 move, and up to ~34% going all the way to $2,500. Your exact figure depends on your insurer — our calculator gives you the estimate to bring to them.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Plans are month to month with no contracts and no cancellation fees. Coverage stops at the end of your paid month.',
  },
  {
    q: 'How do payments work?',
    a: 'Monthly subscription billed by Stripe. We never see or store your card number — Stripe handles all of it.',
  },
]

export function FaqPage({ onNavigate }: { onNavigate: (v: MktView) => void }) {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-14 md:pt-20">
      <Reveal>
        <p className="micro-label">FAQ</p>
        <h1 className="font-display mt-4 text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.08]">
          Asked, answered.
        </h1>
      </Reveal>
      <Reveal delay={120} className="mt-10">
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`f${i}`} className="border-foreground/10">
              <AccordionTrigger className="text-left text-[15.5px] font-semibold hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="max-w-2xl text-[14.5px] leading-relaxed text-foreground/70">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
      <Reveal delay={150}>
        <p className="mt-10 text-[14.5px]">
          Still stuck?{' '}
          <button onClick={() => onNavigate('contact')} className="u-link font-medium text-primary">
            Talk to a human
          </button>
        </p>
      </Reveal>
    </div>
  )
}
