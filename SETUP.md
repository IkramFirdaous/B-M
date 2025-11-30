# Biff&Moi Setup Guide

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > API to get your credentials:
   - Project URL
   - Anon/public key
   - Service role key (keep this secret!)

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Database Migration

1. In Supabase, go to SQL Editor
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run it in the SQL Editor
4. This will create all necessary tables, indexes, and security policies

### 5. Configure Google OAuth (Optional)

1. In Supabase, go to Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
4. Add authorized redirect URL: `http://localhost:3000/auth/callback` (for development)

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## First Time User Flow

1. Sign up with email/password or Google OAuth
2. You'll be redirected to the setup page
3. Create your first account (e.g., "Checking Account")
4. Select default categories for tracking
5. Start adding transactions!

## Deployment to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Update Supabase Redirect URLs

After deploying, update your Supabase redirect URLs:
- Go to Authentication > URL Configuration
- Add your production URL: `https://your-app.vercel.app/auth/callback`

## Features Overview

- **Dashboard**: View your Performance Score, income, expenses, and quick stats
- **Transactions**: Add and manage income/expense transactions
- **Budgets**: Set monthly budgets per category with visual progress
- **Subscriptions**: Track all your recurring subscriptions with monthly/annual costs
- **Monthly Wrap**: Get a comprehensive summary of your month
- **Performance Score**: See how well you're managing your finances (0-100)

## Troubleshooting

### Database Connection Issues
- Verify your Supabase credentials in `.env.local`
- Check that the migration was run successfully
- Ensure Row Level Security (RLS) policies are enabled

### Authentication Issues
- Check that email confirmation is configured correctly in Supabase
- Verify redirect URLs match your app URL
- For Google OAuth, ensure credentials are correct

### Performance Score Not Showing
- Make sure you have transactions and budgets set up
- Check that transactions have valid categories
- Verify dates are within the current month

## Next Steps

- Set up email notifications (integrate with Resend, SendGrid, etc.)
- Add receipt upload functionality (Supabase Storage)
- Implement annual wrap reports
- Add more analytics and visualizations

