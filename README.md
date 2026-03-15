# Coinnect

**Live demo:** [https://coinnect-chi.vercel.app/](https://coinnect-chi.vercel.app/)

## Demo Credentials

```
Email:    demo@coinnect.app
Password: demo1234
```

A personal finance management app that lets you track accounts, budgets, cards, payments, and reusable payment templates — all in one place. Built as a full-stack Next.js app with a GraphQL API and MongoDB backend.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **API:** GraphQL via Apollo Server + Apollo Client
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt
- **State:** Redux Toolkit
- **UI:** Tailwind CSS v4, Radix UI, Recharts, GSAP
- **Testing:** Jest, Cypress

## Features

- **Accounts** — manage multiple bank/financial accounts
- **Budgets** — create and track spending budgets
- **Cards** — manage debit/credit cards linked to accounts
- **Payments** — log and view payment history
- **Templates** — save reusable payment templates for recurring transfers

## Running Locally

1. **Install dependencies**

```bash
npm install
```

2. **Set up environment variables**

```bash
cp .env.example .env
```

Fill in the values (see `.env.example` for descriptions).

3. **Run the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `CONNECTION_URL` | MongoDB connection string |
| `JWT_SECRET` | Secret key used to sign JWTs |
| `EMAIL_USER` | Email address used to send transactional emails |
| `EMAIL_PASS` | Password/app password for the email account |
