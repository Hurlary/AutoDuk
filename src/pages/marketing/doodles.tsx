import { Doodle } from './MarketingShell'

/** Simple line-drawn sedan, drawn with one continuous-feel stroke. */
export function CarDoodle({ className }: { className?: string }) {
  return (
    <Doodle className={className}>
      <svg viewBox="0 0 220 110" fill="none" className="h-auto w-full">
        {/* body */}
        <path
          pathLength={100}
          d="M18 78 L30 56 Q34 48 44 54 L58 34 Q62 28 70 28 L148 28 Q156 28 161 34 L178 54 L198 58 Q208 60 208 70 L208 78"
          stroke="#231f20" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* window line */}
        <path pathLength={100} d="M66 52 L74 36 L144 36 L154 52" stroke="#231f20" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* ground */}
        <path pathLength={100} d="M8 88 H212" stroke="#231f20" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="100" />
        {/* wheels */}
        <circle pathLength={100} cx="62" cy="80" r="12" stroke="#2e54fe" strokeWidth="3" fill="none" />
        <circle pathLength={100} cx="164" cy="80" r="12" stroke="#2e54fe" strokeWidth="3" fill="none" />
        {/* wheel hubs */}
        <circle pathLength={100} cx="62" cy="80" r="3.5" stroke="#231f20" strokeWidth="2.5" fill="none" />
        <circle pathLength={100} cx="164" cy="80" r="3.5" stroke="#231f20" strokeWidth="2.5" fill="none" />
      </svg>
    </Doodle>
  )
}

/** Shield with check — the coverage promise. */
export function ShieldDoodle({ className }: { className?: string }) {
  return (
    <Doodle className={className}>
      <svg viewBox="0 0 100 110" fill="none" className="h-auto w-full">
        <path
          pathLength={100}
          d="M50 8 L88 22 V52 Q88 82 50 102 Q12 82 12 52 V22 Z"
          stroke="#2e54fe" strokeWidth="3" strokeLinejoin="round"
        />
        <path
          pathLength={100}
          d="M34 54 L46 66 L70 40"
          stroke="#231f20" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    </Doodle>
  )
}

/** Dashed road divider with a travelling centre line. */
export function RoadDivider({ className }: { className?: string }) {
  return (
    <Doodle className={className}>
      <svg viewBox="0 0 600 24" fill="none" className="h-auto w-full" preserveAspectRatio="none">
        <path
          pathLength={100}
          d="M0 12 H600"
          stroke="#231f20" strokeWidth="2" strokeLinecap="round"
          style={{ strokeDasharray: '100' }}
        />
      </svg>
    </Doodle>
  )
}
