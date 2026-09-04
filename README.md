# SIVILIE HIGH SCHOOL — Demo App

This is an MVP scaffold for SIVILIE HIGH SCHOOL with real-time updates for results and fees using Next.js, Prisma (SQLite), and Socket.IO.

Quick start:

1. Install
   npm install

2. Generate Prisma client
   npx prisma generate

3. Create DB & run migrations
   npx prisma migrate dev --name init

4. Seed example data
   npx ts-node prisma/seed.ts

5. Start dev server
   npm run dev

Open http://localhost:3000 — the dashboard shows grades and invoices. Use the demo forms to publish a grade or create an invoice; changes are emitted in real time via Socket.IO.

Notes & next steps:
- Replace SQLite with Postgres for production (update prisma schema datasource).
- Add authentication (NextAuth) and role-based checks on API routes.
- Integrate Africa's Talking for SMS and Flutterwave/Daraja for payments in `/api/fees` and `/api/payments/webhook`.
- Add background worker for bulk messages and payment reconciliation.

## New features added

1. UI pages:
   - /admin — send SMS via Africa's Talking, list students
   - /teacher, /parent, /student — placeholder pages to extend
   - /payments — list invoices and simulate an external payment callback for testing

2. Africa's Talking SMS:
   - API route: POST /api/sms
   - Body: { to: string | string[], message: string }
   - Requires env vars: AFRICASTALKING_USERNAME, AFRICASTALKING_API_KEY

3. Payments webhook:
   - API route: POST /api/payments/webhook
   - Body: { provider, providerTx, invoiceId, amount }
   - Idempotent by providerTx — creates Payment record and marks invoice as PAID. Emits a Socket.IO 'invoices:update' event for real-time UI updates.

Set environment variables before running:
- AFRICASTALKING_USERNAME
- AFRICASTALKING_API_KEY
- NEXT_PUBLIC_APP_URL=http://localhost:3000 (or your app origin)

You can simulate an incoming payment from a provider by visiting /payments and clicking "Simulate Pay" on any unpaid invoice.
