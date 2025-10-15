# FunnelGram — Telegram Mini App Funnel Builder

This repository contains FunnelGram, a Telegram WebApp-native funnel builder. The app is built with React + Vite for the frontend and serverless API routes for Supabase-backed storage.

Goals:
- Fast, Telegram-native UI following Telegram WebApp best practices
- Secure server-side verification of Telegram WebApp `initData`
- Supabase for persistence (server-side service key used in API routes)

Quick start
1. Copy environment variables (Server-only):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`)
   - `TELEGRAM_BOT_TOKEN`
   - `NODE_ENV=production` in production

2. Install and run locally:
```powershell
npm install
npm run dev
```

3. Build for production:
```powershell
npm run build
```

Notes
- Keep `SUPABASE_SERVICE_KEY` and `TELEGRAM_BOT_TOKEN` secret. Do not expose to the browser.
- The server API expects the Telegram WebApp `initData` (signed) to be passed in the header `x-tg-initdata` for verification. The app's `TelegramContext` exposes `initData` so the frontend can send it.

Deployment
- Deploy to Vercel and set the environment variables there.

Payments (stub)
- This repository includes a payments stub (`/api/payments/create`) that returns a mock session. Replace this with a real provider (Stripe or Telegram Payments) in production.

Stripe integration (recommended)
1. Install server and client packages:

```powershell
npm install stripe
npm install @stripe/stripe-js
```

2. Set these environment variables on your server (Vercel):
   - `STRIPE_SECRET_KEY` - your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET` - your Stripe webhook signing secret
   - `STRIPE_PUBLISHABLE_KEY` - your Stripe publishable key (for frontend)

3. Database migration (Supabase): run the SQL in `migrations/001_add_payments_and_user_subscription.sql` to add a `payments` table and `subscription_tier` on `users`.

4. Frontend: you can use `src/components/StripePaymentProcessor.jsx` as an example. Wire it to collect card info via Stripe Elements and confirm the PaymentIntent using the returned clientSecret.

5. Webhooks: set up your webhook endpoint (`/api/payments/webhook`) in the Stripe dashboard to receive events; ensure `STRIPE_WEBHOOK_SECRET` is set.

Notes
- The repo already includes a mock fallback so you can test payment UI without Stripe configured.

Privacy & Data
- FunnelGram stores minimal user data from Telegram (telegram_id, username, first/last name) to associate funnels. If you collect emails or payment data, ensure you comply with GDPR/CCPA and store sensitive payment data only through PCI-compliant providers (Stripe).

Vercel notes
- `vercel.json` is configured for Vite. On Vercel, set the environment variables listed above. Make sure `SUPABASE_SERVICE_KEY` and `TELEGRAM_BOT_TOKEN` are set as secret environment variables (server-only).

Deploying to Vercel (CI)
1. Connect this GitHub repository to Vercel (Import Project).
2. In your Vercel project settings, set the following Environment Variables (all required for full functionality):
   - SUPABASE_URL
   - SUPABASE_SERVICE_KEY
   - TELEGRAM_BOT_TOKEN
   - STRIPE_SECRET_KEY (optional, for real payments)
   - STRIPE_WEBHOOK_SECRET (optional)
   - STRIPE_PUBLISHABLE_KEY (optional)
   - STRIPE_SUCCESS_URL (optional)
   - STRIPE_CANCEL_URL (optional)

3. For automated deployments via GitHub Actions, add these secrets to your GitHub repository (Settings → Secrets):
   - VERCEL_TOKEN (personal token from Vercel)
   - VERCEL_ORG_ID
   - VERCEL_PROJECT_ID

4. Push to `main` to trigger the `deploy-vercel.yml` workflow. The action uses the Vercel GitHub Action to deploy to your project.

Manual deploy (optional):
```powershell
npm i -g vercel
vercel login
vercel --prod
```

After deploy
- Visit the URL provided by Vercel to open the app. Test Telegram WebApp integration by opening your WebApp via a Telegram bot and checking that `tg.initData` is passed correctly.

Security checklist before public launch
- Use server-side Supabase service role key only (never expose to client).
- Set `NODE_ENV=production` on production deployments.
- Replace payments stub with actual payment provider and verify webhooks with provider signature.
- Implement rate limiting, input validation, and ownership checks (PATCH endpoint includes ownership check based on Telegram ID).

Security
- Verification of `initData` is implemented in `api/auth/verify.js`.

Next steps
- Add ownership checks, payment integration and CI tests (already partially added).
