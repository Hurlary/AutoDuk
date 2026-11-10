import type { Claim, Customer, Lead, Plan, StaffUser, Ticket } from '@/types'

const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 864e5).toISOString()

export const PLANS: Plan[] = [
  { id: 1, name: 'Basic', monthlyPrice: 5, deductibleCoverage: 500 },
  { id: 2, name: 'Standard', monthlyPrice: 10, deductibleCoverage: 1000 },
  { id: 3, name: 'Plus', monthlyPrice: 15, deductibleCoverage: 1500 },
  { id: 4, name: 'Premium', monthlyPrice: 20, deductibleCoverage: 2000 },
  { id: 5, name: 'Max', monthlyPrice: 25, deductibleCoverage: 2500 },
]

export const STAFF: StaffUser[] = [
  { id: 'u1', name: 'Dana Whitfield', email: 'dana@autoduk.com', role: 'admin' },
  { id: 'u2', name: 'Marcus Cole', email: 'marcus@autoduk.com', role: 'agent' },
  { id: 'u3', name: 'Priya Nair', email: 'priya@autoduk.com', role: 'agent' },
]

export const DEMO_LEADS: Lead[] = [
  {
    id: 'l1', name: 'Jordan Reyes', email: 'jordan.reyes@gmail.com', phone: '(512) 555-0147',
    source: 'calculator', status: 'new', currentDeductible: 500, annualPremium: 1450,
    newDeductible: 1000, state: 'TX', createdAt: d(0),
    notes: [],
  },
  {
    id: 'l2', name: 'Samantha Ortiz', email: 'sam.ortiz@outlook.com', phone: '(305) 555-0192',
    source: 'website', status: 'new', state: 'FL', createdAt: d(1), notes: [],
  },
  {
    id: 'l3', name: 'Devon Carter', email: 'dcarter.rides@gmail.com', phone: '(404) 555-0113',
    source: 'ad', status: 'contacted', assignedTo: 'u2', currentDeductible: 1000,
    annualPremium: 2100, newDeductible: 2000, state: 'GA', createdAt: d(3),
    notes: [
      { id: 'n1', author: 'Marcus Cole', body: 'Uber driver full-time. Interested in Premium plan. Call back Thursday afternoon.', at: d(2) },
    ],
  },
  {
    id: 'l4', name: 'Mei-Ling Chen', email: 'meiling.chen@yahoo.com',
    source: 'calculator', status: 'contacted', assignedTo: 'u3', currentDeductible: 250,
    annualPremium: 1100, newDeductible: 500, state: 'WA', createdAt: d(4), notes: [],
  },
  {
    id: 'l5', name: 'Robert Kowalski', email: 'rkowalski@icloud.com', phone: '(312) 555-0178',
    source: 'referral', status: 'qualified', assignedTo: 'u2', state: 'IL', createdAt: d(6),
    notes: [
      { id: 'n2', author: 'Marcus Cole', body: 'Referred by existing customer T. Alvarez. Has GEICO policy, $1,000 deductible. Sent plan comparison.', at: d(5) },
      { id: 'n3', author: 'Marcus Cole', body: 'Confirmed active policy. Ready to check out — sent payment link.', at: d(3) },
    ],
  },
  {
    id: 'l6', name: 'Aisha Bello', email: 'aisha.bello@gmail.com', phone: '(718) 555-0129',
    source: 'website', status: 'qualified', assignedTo: 'u3', state: 'NY', createdAt: d(8),
    notes: [],
  },
  {
    id: 'l7', name: 'Tom Becker', email: 'tom.becker@proton.me',
    source: 'calculator', status: 'converted', currentDeductible: 500, annualPremium: 980,
    newDeductible: 1000, state: 'OH', createdAt: d(12), notes: [],
  },
  {
    id: 'l8', name: 'Lisa Hammond', email: 'lhammond@gmail.com', phone: '(206) 555-0164',
    source: 'ad', status: 'lost', assignedTo: 'u2', state: 'WA', createdAt: d(15),
    notes: [
      { id: 'n4', author: 'Marcus Cole', body: 'Chose a competitor with bundled roadside assistance. Keep for win-back campaign.', at: d(13) },
    ],
  },
  {
    id: 'l9', name: 'Carlos Mendez', email: 'cmendez.drives@gmail.com',
    source: 'website', status: 'new', state: 'AZ', createdAt: d(2), notes: [],
  },
]

export const DEMO_CUSTOMERS: Customer[] = [
  {
    id: 'c1', name: 'Tom Becker', email: 'tom.becker@proton.me', phone: '(614) 555-0110',
    planId: 2, status: 'active', memberSince: d(11),
    vehicles: [{ id: 'v1', year: 2021, make: 'Honda', model: 'Civic', primary: true }],
  },
  {
    id: 'c2', name: 'Teresa Alvarez', email: 't.alvarez@gmail.com', phone: '(210) 555-0188',
    planId: 4, status: 'active', memberSince: d(152),
    vehicles: [
      { id: 'v2', year: 2022, make: 'Toyota', model: 'RAV4', primary: true },
      { id: 'v3', year: 2018, make: 'Ford', model: 'F-150', primary: false },
    ],
  },
  {
    id: 'c3', name: 'Nathan Cole', email: 'nate.cole@outlook.com',
    planId: 1, status: 'active', memberSince: d(45),
    vehicles: [{ id: 'v4', year: 2019, make: 'Mazda', model: 'CX-5', primary: true }],
  },
  {
    id: 'c4', name: 'Grace Okafor', email: 'grace.okafor@gmail.com', phone: '(770) 555-0135',
    planId: 3, status: 'active', memberSince: d(220),
    vehicles: [{ id: 'v5', year: 2023, make: 'Tesla', model: 'Model 3', primary: true }],
  },
  {
    id: 'c5', name: 'Henry Walsh', email: 'hwalsh@icloud.com',
    planId: 2, status: 'past_due', memberSince: d(340),
    vehicles: [{ id: 'v6', year: 2017, make: 'Chevrolet', model: 'Malibu', primary: true }],
  },
  {
    id: 'c6', name: 'Fatima Al-Sayed', email: 'fatima.alsayed@gmail.com', phone: '(480) 555-0171',
    planId: 5, status: 'active', memberSince: d(400),
    vehicles: [{ id: 'v7', year: 2024, make: 'Hyundai', model: 'Palisade', primary: true }],
  },
  {
    id: 'c7', name: 'Derek Johnson', email: 'djohnson.rides@yahoo.com', phone: '(901) 555-0143',
    planId: 4, status: 'active', memberSince: d(95),
    vehicles: [{ id: 'v8', year: 2020, make: 'Kia', model: 'Telluride', primary: true }],
  },
  {
    id: 'c8', name: 'Paula Nguyen', email: 'p.nguyen@gmail.com',
    planId: 1, status: 'cancelled', memberSince: d(500),
    vehicles: [{ id: 'v8b', year: 2016, make: 'Nissan', model: 'Sentra', primary: true }],
  },
  {
    id: 'c9', name: 'Maya Torres', email: 'maya.torres@gmail.com', phone: '(619) 555-0159',
    planId: 2, status: 'active', memberSince: d(190),
    vehicles: [{ id: 'v9', year: 2022, make: 'Subaru', model: 'Outback', primary: true }],
  },
]

export const DEMO_CLAIMS: Claim[] = [
  {
    id: 'cl1', claimNumber: 'ADK-2026-0104', customerId: 'c2', vehicleLabel: '2022 Toyota RAV4',
    incidentDate: d(2).slice(0, 10),
    description: 'Rear-ended at a stoplight on I-35 frontage road. Bumper and tailgate damage, other driver at fault. Police report attached.',
    city: 'Austin', state: 'TX', status: 'submitted', deductibleAmount: 2000,
    submittedAt: d(1),
    docs: [
      { id: 'doc1', name: 'rear-damage-01.jpg', type: 'damage_photo', sizeLabel: '2.4 MB' },
      { id: 'doc2', name: 'rear-damage-02.jpg', type: 'damage_photo', sizeLabel: '2.1 MB' },
      { id: 'doc3', name: 'police-report-88613.pdf', type: 'police_report', sizeLabel: '480 KB' },
      { id: 'doc4', name: 'geico-claim-summary.pdf', type: 'insurance_doc', sizeLabel: '310 KB' },
    ],
    timeline: [{ id: 'a1', actor: 'System', action: 'Claim submitted by customer', at: d(1) }],
  },
  {
    id: 'cl2', claimNumber: 'ADK-2026-0103', customerId: 'c4', vehicleLabel: '2023 Tesla Model 3',
    incidentDate: d(6).slice(0, 10),
    description: 'Hail damage across hood and roof after storm. Estimates from two body shops attached.',
    city: 'Atlanta', state: 'GA', status: 'under_review', deductibleAmount: 1500,
    assignedTo: 'u3', submittedAt: d(4),
    docs: [
      { id: 'doc5', name: 'hail-hood.jpg', type: 'damage_photo', sizeLabel: '3.1 MB' },
      { id: 'doc6', name: 'hail-roof.jpg', type: 'damage_photo', sizeLabel: '2.8 MB' },
      { id: 'doc7', name: 'bodyshop-estimate.pdf', type: 'insurance_doc', sizeLabel: '220 KB' },
    ],
    timeline: [
      { id: 'a2', actor: 'System', action: 'Claim submitted by customer', at: d(4) },
      { id: 'a3', actor: 'Priya Nair', action: 'Moved to Under Review', at: d(3) },
    ],
  },
  {
    id: 'cl3', claimNumber: 'ADK-2026-0102', customerId: 'c7', vehicleLabel: '2020 Kia Telluride',
    incidentDate: d(9).slice(0, 10),
    description: 'Sideswiped in parking structure, driver-side doors dented. Other party uninsured.',
    city: 'Memphis', state: 'TN', status: 'info_requested', deductibleAmount: 2000,
    assignedTo: 'u2', submittedAt: d(7),
    docs: [
      { id: 'doc8', name: 'driver-side-dent.jpg', type: 'damage_photo', sizeLabel: '1.9 MB' },
    ],
    timeline: [
      { id: 'a4', actor: 'System', action: 'Claim submitted by customer', at: d(7) },
      { id: 'a5', actor: 'Marcus Cole', action: 'Moved to Under Review', at: d(6) },
      { id: 'a5b', actor: 'Marcus Cole', action: 'Requested insurance claim documents from customer', at: d(5) },
    ],
  },
  {
    id: 'cl4', claimNumber: 'ADK-2026-0098', customerId: 'c6', vehicleLabel: '2024 Hyundai Palisade',
    incidentDate: d(14).slice(0, 10),
    description: 'Rock strike cracked windshield on US-60, full replacement required.',
    city: 'Mesa', state: 'AZ', status: 'approved', deductibleAmount: 2500, approvedAmount: 2500,
    assignedTo: 'u1', submittedAt: d(12),
    docs: [
      { id: 'doc9', name: 'windshield-crack.jpg', type: 'damage_photo', sizeLabel: '2.2 MB' },
      { id: 'doc10', name: 'insurance-approval.pdf', type: 'insurance_doc', sizeLabel: '190 KB' },
    ],
    timeline: [
      { id: 'a6', actor: 'System', action: 'Claim submitted by customer', at: d(12) },
      { id: 'a7', actor: 'Dana Whitfield', action: 'Moved to Under Review', at: d(11) },
      { id: 'a8', actor: 'Dana Whitfield', action: 'Approved for $2,500.00', at: d(9) },
    ],
  },
  {
    id: 'cl5', claimNumber: 'ADK-2026-0091', customerId: 'c2', vehicleLabel: '2018 Ford F-150',
    incidentDate: d(120).slice(0, 10),
    description: 'Backed into a post, tailgate and rear quarter damage.',
    city: 'San Antonio', state: 'TX', status: 'paid', deductibleAmount: 2000, approvedAmount: 2000,
    assignedTo: 'u2', submittedAt: d(118), resolvedAt: d(112),
    docs: [{ id: 'doc11', name: 'tailgate.jpg', type: 'damage_photo', sizeLabel: '1.7 MB' }],
    timeline: [
      { id: 'a9', actor: 'System', action: 'Claim submitted by customer', at: d(118) },
      { id: 'a10', actor: 'Marcus Cole', action: 'Approved for $2,000.00', at: d(114) },
      { id: 'a11', actor: 'Dana Whitfield', action: 'Marked as paid', at: d(112) },
    ],
  },
  {
    id: 'cl6', claimNumber: 'ADK-2026-0088', customerId: 'c5', vehicleLabel: '2017 Chevrolet Malibu',
    incidentDate: d(30).slice(0, 10),
    description: 'Front-end collision at intersection, airbag deployed.',
    city: 'Springfield', state: 'IL', status: 'denied', deductibleAmount: 1000,
    denialReason: 'Subscription payment past due at time of incident — account not active.',
    assignedTo: 'u1', submittedAt: d(28), resolvedAt: d(24),
    docs: [{ id: 'doc12', name: 'front-end.jpg', type: 'damage_photo', sizeLabel: '2.6 MB' }],
    timeline: [
      { id: 'a12', actor: 'System', action: 'Claim submitted by customer', at: d(28) },
      { id: 'a13', actor: 'Dana Whitfield', action: 'Denied: subscription past due at time of incident', at: d(24) },
    ],
  },
]

export const DEMO_TICKETS: Ticket[] = [
  {
    id: 't1', customerId: 'c3', name: 'Nathan Cole', email: 'nate.cole@outlook.com',
    message: 'Hi — I want to add a second car to my plan. Do I need a separate subscription or can I upgrade?',
    status: 'open', createdAt: d(0),
  },
  {
    id: 't2', name: 'Vanessa Price', email: 'vprice@gmail.com',
    message: 'I used the deductible calculator and have a question about whether AutoDuk works with my State Farm policy. Not a customer yet.',
    status: 'open', createdAt: d(1),
  },
  {
    id: 't3', customerId: 'c5', name: 'Henry Walsh', email: 'hwalsh@icloud.com',
    message: 'My card was declined and I got an email about payment. How long do I have before my coverage lapses?',
    status: 'in_progress', assignedTo: 'u2', createdAt: d(2),
  },
  {
    id: 't4', customerId: 'c7', name: 'Derek Johnson', email: 'djohnson.rides@yahoo.com',
    message: 'Where do I send the insurance documents you asked for on my claim? Can I just reply to the email?',
    status: 'in_progress', assignedTo: 'u2', createdAt: d(3),
  },
  {
    id: 't5', customerId: 'c4', name: 'Grace Okafor', email: 'grace.okafor@gmail.com',
    message: 'Can I switch from Plus to Premium mid-month? We just bought a second car with a higher deductible.',
    status: 'resolved', assignedTo: 'u3', createdAt: d(6),
  },
]
