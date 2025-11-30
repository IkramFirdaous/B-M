# Biff&Moi - Personal Finance App

A personal finance app that enables users to track spending, income, budgets, subscriptions, savings goals, and overall financial performance. Built with Next.js, TypeScript, and Supabase.

If you wanna try it, here you go: https://biffetmoi.vercel.app/

## Features

- **User Authentication**: Email/password and Google OAuth
- **Transaction Tracking**: Manual and recurring transactions with categorization
- **Budgeting**: Monthly budgets per category with visual warnings
- **Performance Score**: 0-100 score inspired by Apple's Sleep Score
- **Subscriptions**: Track and visualize all subscriptions with monthly/annual costs
- **Savings Goals**: Set and track custom savings goals
- **Analytics & Reporting**: Trend reports, category comparisons, and insights
- **Monthly & Annual Wraps**: Comprehensive financial summaries
- **Humorous Notifications**: Edgy, Duolingo-inspired copywriting

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Hosting**: Vercel (free tier)
- **Monitoring**: Sentry (free tier)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd B-M
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Set up Supabase:
   - Create a new Supabase project
   - Run the migration file `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor
   - Enable Google OAuth in Supabase Authentication settings (optional)

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The app uses the following main tables:
- `users` - User profiles
- `accounts` - Financial accounts
- `transactions` - Income, expenses, and transfers
- `categories` - Transaction categories
- `budgets` - Monthly budgets per category
- `savings_goals` - Savings targets
- `recurring_transactions` - Recurring transactions and subscriptions

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   └── subscriptions/     # Subscriptions page
├── components/            # React components
├── lib/                   # Utilities and helpers
│   ├── supabase/         # Supabase client setup
│   ├── types/            # TypeScript types
│   └── utils/             # Utility functions
└── supabase/             # Database migrations
```

## Performance Score

The Performance Score (0-100) is calculated based on:
- Budget adherence (40%)
- Savings progress (30%)
- Spending trend vs previous months (10%)
- Recurring expense coverage (10%)
- Emergency savings progress (optional, 10%)

Tiers:
- 80-100: Excellent
- 60-79: Stable
- 40-59: Risk Zone
- 0-39: Critical

## License

MIT
