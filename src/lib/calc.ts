import { PLANS } from '@/lib/demo-data'
import type { Plan } from '@/types'

// Deductible tiers used across the calculator ($250 is an input-only tier
// for a driver's *current* deductible; AutoDuk plans cover $500–$2,500).
export const DEDUCTIBLE_TIERS = [250, 500, 1000, 1500, 2000, 2500] as const
export const PLAN_TIERS = [500, 1000, 1500, 2000, 2500]

// Industry-average premium multipliers, relative to a $500 deductible = 1.00.
// Derived from published industry averages: raising a deductible lowers the
// premium, lowering it raises the premium.
const PREMIUM_FACTOR: Record<number, number> = {
  250: 1.054,
  500: 1.0,
  1000: 0.9,
  1500: 0.81,
  2000: 0.729,
  2500: 0.656,
}

// Regional estimate adjustments — applied to the savings rate. 1.00 = national
// average; higher-cost states tend to see slightly larger deductible savings.
export const STATE_OPTIONS: { name: string; factor: number }[] = [
  { name: 'National Average', factor: 1.0 },
  { name: 'California', factor: 1.05 },
  { name: 'Florida', factor: 1.08 },
  { name: 'Georgia', factor: 1.02 },
  { name: 'Illinois', factor: 1.01 },
  { name: 'Louisiana', factor: 1.08 },
  { name: 'Maine', factor: 0.92 },
  { name: 'Michigan', factor: 1.1 },
  { name: 'New York', factor: 1.04 },
  { name: 'Ohio', factor: 0.96 },
  { name: 'Pennsylvania', factor: 0.99 },
  { name: 'Texas', factor: 1.03 },
  { name: 'Vermont', factor: 0.9 },
  { name: 'Washington', factor: 1.02 },
]

export interface CalcResult {
  currentAnnual: number
  newAnnual: number
  currentMonthly: number
  newMonthly: number
  monthlySavings: number
  annualSavings: number
  savingsPct: number
  plan: Plan | null
  planAnnualCost: number
  netAnnual: number // annualSavings minus plan cost (can be negative)
}

export function planForDeductible(deductible: number): Plan | null {
  return PLANS.find((p) => p.deductibleCoverage === deductible) ?? null
}

export function computeSavings(annualPremium: number, currentDeductible: number, newDeductible: number, stateFactor = 1): CalcResult {
  const base = annualPremium / PREMIUM_FACTOR[currentDeductible]
  const newAnnualRaw = base * PREMIUM_FACTOR[newDeductible]
  const newAnnual = Math.round(annualPremium - (annualPremium - newAnnualRaw) * stateFactor)
  const currentAnnual = Math.round(annualPremium)
  const annualSavings = currentAnnual - newAnnual
  const plan = planForDeductible(newDeductible)
  const planAnnualCost = plan ? plan.monthlyPrice * 12 : 0
  return {
    currentAnnual,
    newAnnual,
    currentMonthly: currentAnnual / 12,
    newMonthly: newAnnual / 12,
    monthlySavings: annualSavings / 12,
    annualSavings,
    savingsPct: annualPremium > 0 ? (annualSavings / currentAnnual) * 100 : 0,
    plan,
    planAnnualCost,
    netAnnual: annualSavings - planAnnualCost,
  }
}

export function money(n: number, decimals = 0): string {
  const abs = Math.abs(n)
  const s = abs.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return `${n < 0 ? '−' : ''}$${s}`
}

/** One-line verdict for the net position. */
export function verdict(r: CalcResult): string {
  if (!r.plan) return ''
  if (r.annualSavings <= 0) {
    return 'The savings come from raising your deductible — pick a higher tier to see the trade.'
  }
  if (r.netAnnual > 0) {
    return `You come out ${money(r.netAnnual)} ahead every year — and your new deductible is covered.`
  }
  if (r.netAnnual === 0) {
    return `Your premium savings exactly cover the plan — protection at zero net cost.`
  }
  return `Coverage costs ${money(-r.netAnnual)}/yr beyond your savings — a year of protection for less than one tank of gas.`
}
