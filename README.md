# AutoDuk Ops Console

Internal CRM for AutoDuk's auto-insurance deductible subscription business — leads, customers, claims, and support in one console.

## What it does

- **Dashboard** — MRR, active subscribers, open claims, resolution time, live activity feed
- **Leads** — Kanban pipeline (New → Contacted → Qualified → Converted / Lost), drag-and-drop, notes, assignment, calculator context
- **Customers** — plans, tenure, vehicles, claim history; syncs from Stripe webhooks
- **Claims** — review queue with automatic eligibility checks (3-month tenure + 1 claim / 12 months), document list, approve / deny / request-info with audit timeline
- **Support** — shared inbox for contact-form tickets with assignment and status

## Stack

React + TypeScript + Vite + Tailwind + shadcn/ui. Data layer targets **Supabase** (Auth, Postgres + RLS, Storage for claim documents). Stripe remains the billing engine.

## Run locally

```bash
npm install
npm run dev
```

## Connect the real database

1. Create a project at supabase.com
2. Run `supabase/schema.sql` in the SQL editor
3. Create a private Storage bucket named `claim-docs`
4. `cp .env.example .env` and fill in `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
5. Restart the dev server — the console hydrates from Supabase automatically

Without env vars the app runs in **demo mode** with sample data that resets on reload.

## Deploy to GitHub Pages

The app builds to static files (`dist/`), so GitHub Pages can host it as-is.
A ready-made workflow ships in `.github/workflows/deploy.yml`.

**One-time setup:**

```bash
git init
git add .
git commit -m "AutoDuk — marketing site, customer portal, staff CRM"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Then in the GitHub repo:

1. **Settings → Pages → Source:** choose **GitHub Actions**
2. Push (or re-run the workflow) — the site goes live at
   `https://<your-username>.github.io/<repo-name>/`

**Live data (optional):** without Supabase the deployed site runs in demo mode
(data resets on reload). To run against the real database, add
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under
**Settings → Secrets and variables → Actions** — the next deploy picks them up
automatically.
