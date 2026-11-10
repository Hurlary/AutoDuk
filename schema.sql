-- ============================================================
-- AutoDuk CRM — Supabase schema
-- Run in the Supabase SQL editor (or `supabase db push`).
-- ============================================================

create type user_role       as enum ('admin', 'agent', 'customer');
create type lead_status     as enum ('new', 'contacted', 'qualified', 'converted', 'lost');
create type customer_status as enum ('active', 'past_due', 'cancelled');
create type claim_status    as enum ('submitted', 'under_review', 'info_requested',
                                     'approved', 'denied', 'paid');
create type ticket_status   as enum ('open', 'in_progress', 'resolved');

-- ---------- users (extends Supabase Auth) ----------
create table profiles (
  id         uuid primary key references auth.users on delete cascade,
  full_name  text not null,
  email      text not null,
  phone      text,
  role       user_role not null default 'customer',
  created_at timestamptz not null default now()
);

-- ---------- plans ----------
create table plans (
  id                  smallint primary key,
  name                text not null,
  monthly_price       numeric(6,2) not null,
  deductible_coverage numeric(8,2) not null,
  stripe_price_id     text,
  is_active           boolean not null default true
);

insert into plans values
  (1, 'Basic',     5,  500,  null, true),
  (2, 'Standard',  10, 1000, null, true),
  (3, 'Plus',      15, 1500, null, true),
  (4, 'Premium',   20, 2000, null, true),
  (5, 'Max',       25, 2500, null, true);

-- ---------- leads ----------
create table leads (
  id                 uuid primary key default gen_random_uuid(),
  full_name          text not null,
  email              text not null,
  phone              text,
  source             text default 'website',
  status             lead_status not null default 'new',
  assigned_to        uuid references profiles(id),
  current_deductible numeric(8,2),
  annual_premium     numeric(8,2),
  new_deductible     numeric(8,2),
  state              text,
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ---------- customers ----------
create table customers (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid unique references profiles(id),
  lead_id                uuid references leads(id),
  full_name              text not null,
  email                  text not null,
  phone                  text,
  plan_id                smallint references plans(id),
  status                 customer_status not null default 'active',
  member_since           timestamptz not null default now(),
  stripe_customer_id     text,
  stripe_subscription_id text,
  created_at             timestamptz not null default now()
);

create table vehicles (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  year int, make text, model text,
  is_primary  boolean not null default true
);

-- ---------- claims ----------
create table claims (
  id                uuid primary key default gen_random_uuid(),
  claim_number      text unique,
  customer_id       uuid not null references customers(id),
  vehicle_id        uuid references vehicles(id),
  incident_date     date not null,
  description       text not null,
  street text, city text, state text, zip text,
  status            claim_status not null default 'submitted',
  deductible_amount numeric(8,2),
  approved_amount   numeric(8,2),
  denial_reason     text,
  assigned_to       uuid references profiles(id),
  submitted_at      timestamptz not null default now(),
  resolved_at       timestamptz
);

create table claim_documents (
  id          uuid primary key default gen_random_uuid(),
  claim_id    uuid not null references claims(id) on delete cascade,
  file_path   text not null,
  doc_type    text not null default 'damage_photo',
  uploaded_at timestamptz not null default now()
);

-- ---------- payments (Stripe is the source of truth) ----------
create table payments (
  id                uuid primary key default gen_random_uuid(),
  customer_id       uuid not null references customers(id),
  amount            numeric(8,2) not null,
  status            text not null,
  stripe_invoice_id text,
  paid_at           timestamptz
);

-- ---------- support ----------
create table support_tickets (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  name        text not null,
  email       text not null,
  phone       text,
  message     text not null,
  status      ticket_status not null default 'open',
  assigned_to uuid references profiles(id),
  created_at  timestamptz not null default now()
);

-- ---------- activity log ----------
create table activities (
  id          bigint generated always as identity primary key,
  entity_type text not null,
  entity_id   uuid not null,
  actor_id    uuid references profiles(id),
  action      text not null,
  body        text,
  created_at  timestamptz not null default now()
);

-- ---------- eligibility rule (3-month tenure, 1 claim / 12 months) ----------
create or replace function is_claim_eligible(p_customer_id uuid)
returns boolean language sql stable as $$
  select c.member_since <= now() - interval '3 months'
     and not exists (
           select 1 from claims
           where customer_id = c.id
             and submitted_at >= now() - interval '12 months'
         )
  from customers c where c.id = p_customer_id;
$$;

-- ---------- Row Level Security ----------
alter table profiles          enable row level security;
alter table plans             enable row level security;
alter table leads             enable row level security;
alter table customers         enable row level security;
alter table vehicles          enable row level security;
alter table claims            enable row level security;
alter table claim_documents   enable row level security;
alter table payments          enable row level security;
alter table support_tickets   enable row level security;
alter table activities        enable row level security;

-- helper: is the current user staff?
create or replace function is_staff()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('admin', 'agent')
  );
$$;

-- staff full access (repeat this pattern per table)
create policy "staff_all_leads"    on leads            for all using (is_staff());
create policy "staff_all_customers" on customers       for all using (is_staff());
create policy "staff_all_vehicles" on vehicles         for all using (is_staff());
create policy "staff_all_claims"   on claims           for all using (is_staff());
create policy "staff_all_docs"     on claim_documents  for all using (is_staff());
create policy "staff_all_payments" on payments         for all using (is_staff());
create policy "staff_all_tickets"  on support_tickets  for all using (is_staff());
create policy "staff_all_activity" on activities       for all using (is_staff());
create policy "staff_read_plans"   on plans            for select using (true);

-- customers see only their own rows (portal)
create policy "own_profile"  on profiles for select using (id = auth.uid());
create policy "own_customer" on customers for select using (user_id = auth.uid());
create policy "own_vehicles" on vehicles  for select using (
  exists (select 1 from customers c where c.id = customer_id and c.user_id = auth.uid()));
create policy "own_claims"   on claims    for select using (
  exists (select 1 from customers c where c.id = customer_id and c.user_id = auth.uid()));
create policy "own_claim_insert" on claims for insert with check (
  exists (select 1 from customers c where c.id = customer_id and c.user_id = auth.uid()));

-- private bucket for claim documents (create in dashboard: 'claim-docs', public = false)
