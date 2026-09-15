# Pocketwise

Pocketwise is a clean personal finance and robo-advisory dashboard built with Next.js App Router, Auth.js, Prisma, PostgreSQL, Tailwind CSS, and server-side AI orchestration.

The app separates daily cash flow from long-term wealth state:

- Daily income and expenses are tracked through the dashboard quick-add flow.
- Assets, liabilities, risk comfort, and baseline budgets are managed from the financial profile.
- The investment wizard builds a diversified mutual fund SIP recommendation from a curated fund universe, live MFapi NAV data, and Gemini.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- Auth.js / NextAuth v5
- Prisma ORM
- PostgreSQL
- Recharts
- Zod
- Decimal.js
- Gemini for portfolio recommendations and dashboard insight text
- MFapi.in for Indian mutual fund NAV data

## Core Features

- Email/password authentication with bcrypt
- Optional Google OAuth provider
- Onboarding gate for baseline setup
- Dashboard with:
  - Left to Spend budget card
  - Net worth summary
  - AI insight card
  - Weekly spending chart
  - Latest transaction list with delete support
- Cash-flow-only quick add modal
- Financial profile page for:
  - Age
  - Risk comfort
  - Investment horizon
  - Fixed monthly income and expenses
  - Assets and liabilities
- Robo-advisory wizard with:
  - Risk and horizon selection
  - Curated fund basket
  - Live NAV hydration from MFapi
  - Gemini Core & Satellite SIP allocation
  - Deterministic fallback recommendations

## Project Structure

```text
src/
  actions/                  Server actions and server-side mutations
  app/                      Next.js App Router routes
  components/
    advisory/               Investment wizard components
    auth/                   Auth UI helpers
    dashboard/              Dashboard UI components
    profile/                Financial profile components
    ui/                     Shared UI primitives
  lib/                      Utilities, validations, AI clients, math helpers

prisma/
  schema.prisma             Database schema
  seed.ts                   Demo user, transactions, balance sheet, fund universe

lib/
  prisma.ts                 Prisma singleton
  session.ts                Current-user helper
  utils.ts                  Tailwind class merge helper
```

## Prerequisites

- Node.js 22 or newer
- PostgreSQL running locally or remotely
- npm

## Environment Variables

Create `.env` from `.env.example`:

```bash
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

Required:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pocketwise?schema=public"
AUTH_SECRET="replace-with-a-strong-random-secret"
```

Optional:

```env
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GEMINI_API_KEY=""
GEMINI_RECOMMENDATION_TIMEOUT_MS="15000"
```

Notes:

- `GEMINI_API_KEY` powers the investment recommendation engine and dashboard Insight Owl. If it is missing, the app uses safe fallbacks.
- Do not expose secrets with `NEXT_PUBLIC_`.
- If secrets were ever committed or shared, rotate them before deployment.

Generate an Auth.js secret with:

```bash
npx auth secret
```

## Installation

```bash
npm install
```

Generate Prisma Client:

```bash
npm run prisma:generate
```

Sync the database schema:

```bash
npx prisma db push
```

Seed demo data:

```bash
npm run prisma:seed
```

## Running Locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Demo credentials after seeding:

```text
Email: demo@pocketwise.local
Password: pocketwise-demo-2026
```

## Useful Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npx tsc --noEmit
npm run prisma:generate
npx prisma db push
npm run prisma:seed
```

## Main Routes

```text
/                    Redirects to login or dashboard
/login               Sign in
/register            Create account
/onboarding          Baseline setup gate
/dashboard           Main money overview
/dashboard/profile   Financial profile and balance sheet
/dashboard/invest    Robo-advisory wizard
```

## Financial Model

Pocketwise keeps cash flow and wealth state separate.

Daily cash flow:

- Stored in `Transaction`
- Quick Add supports only `INCOME` and `EXPENSE`
- Feeds weekly spending, latest entries, and left-to-spend calculations

Wealth state:

- Stored in `BalanceItem`, `UserProfile`, and `UserPortfolio`
- Managed from `/dashboard/profile`
- Feeds net worth, baseline budget, and advisory context

Left to Spend:

```text
leftToSpend = (baselineMonthlyIncome - baselineMonthlyExpenses) - currentMonthExpenseTransactions
```

Net Worth:

```text
netWorth = sum(assets) - sum(liabilities)
```

## Investment Recommendation Flow

The advisory wizard uses a multi-level RAG pipeline:

1. Read the authenticated user profile and balance sheet.
2. Build a category-aware mutual fund basket:
   - High risk: Small Cap, Mid Cap, Flexi Cap, Liquid
   - Medium risk: Mid Cap, Flexi Cap, Large Cap / Index, Liquid
   - Low risk: Large Cap / Index and Liquid
3. Hydrate live NAVs through MFapi.
4. Ask Gemini to select exactly 3 funds using Core / Satellite / Buffer guardrails.
5. Fall back to a deterministic diversified allocation if Gemini or MFapi fails.

## Database Models

Key Prisma models:

- `User`
- `UserProfile`
- `Transaction`
- `BalanceItem`
- `UserPortfolio`
- `MutualFund`
- Auth.js adapter models: `Account`, `Session`, `VerificationToken`

## Troubleshooting

### Gemini recommendations fall back

Check the terminal for:

```text
[Gemini Portfolio Error]:
[Gemini JSON Parse Error]:
```

Common causes:

- Missing `GEMINI_API_KEY`
- Network timeout
- Invalid JSON response

Increase the timeout if needed:

```env
GEMINI_RECOMMENDATION_TIMEOUT_MS="20000"
```

Restart the dev server after changing `.env`.

### Google sign-in unavailable

Google sign-in is only enabled when both are set:

```env
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

The app still works with email/password auth if Google is not configured.

### Prisma schema changes are not reflected

Run:

```bash
npx prisma db push
npm run prisma:generate
```

### Seeded funds are missing or stale

Run:

```bash
npm run prisma:seed
```

The seed resets the curated mutual fund universe.

## Production Checklist

- Use a production PostgreSQL instance.
- Set a strong `AUTH_SECRET`.
- Rotate any secrets that were shared locally.
- Configure OAuth redirect URLs for the production domain.
- Set `GEMINI_API_KEY` only on the server environment.
- Run:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## License

This project is private and currently has no open-source license.
# PocketWise
