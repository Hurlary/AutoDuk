export type Role = 'admin' | 'agent'

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
export type ClaimStatus =
  | 'submitted'
  | 'under_review'
  | 'info_requested'
  | 'approved'
  | 'denied'
  | 'paid'
export type CustomerStatus = 'active' | 'past_due' | 'cancelled'
export type TicketStatus = 'open' | 'in_progress' | 'resolved'

export interface Plan {
  id: number
  name: string
  monthlyPrice: number
  deductibleCoverage: number
}

export interface StaffUser {
  id: string
  name: string
  email: string
  role: Role
}

export interface Note {
  id: string
  author: string
  body: string
  at: string
}

export interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  source: 'website' | 'calculator' | 'referral' | 'ad'
  status: LeadStatus
  assignedTo?: string
  currentDeductible?: number
  annualPremium?: number
  newDeductible?: number
  state?: string
  notes: Note[]
  createdAt: string
}

export interface Vehicle {
  id: string
  year: number
  make: string
  model: string
  primary: boolean
}

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  planId: number
  status: CustomerStatus
  memberSince: string
  vehicles: Vehicle[]
}

export interface ClaimDoc {
  id: string
  name: string
  type: 'damage_photo' | 'police_report' | 'insurance_doc'
  sizeLabel: string
}

export interface Activity {
  id: string
  actor: string
  action: string
  at: string
}

export interface Claim {
  id: string
  claimNumber: string
  customerId: string
  vehicleLabel: string
  incidentDate: string
  description: string
  city: string
  state: string
  status: ClaimStatus
  deductibleAmount: number
  approvedAmount?: number
  denialReason?: string
  assignedTo?: string
  submittedAt: string
  resolvedAt?: string
  docs: ClaimDoc[]
  timeline: Activity[]
}

export interface Ticket {
  id: string
  customerId?: string
  name: string
  email: string
  message: string
  status: TicketStatus
  assignedTo?: string
  createdAt: string
}

export const LEAD_STAGES: { id: LeadStatus; label: string }[] = [
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'converted', label: 'Converted' },
  { id: 'lost', label: 'Lost' },
]

export const CLAIM_STAGES: { id: ClaimStatus; label: string }[] = [
  { id: 'submitted', label: 'Submitted' },
  { id: 'under_review', label: 'Under Review' },
  { id: 'info_requested', label: 'Info Requested' },
  { id: 'approved', label: 'Approved' },
  { id: 'paid', label: 'Paid' },
  { id: 'denied', label: 'Denied' },
]

export interface Eligibility {
  eligible: boolean
  tenureOk: boolean
  tenureMonths: number
  yearlyLimitOk: boolean
  reasons: string[]
}
