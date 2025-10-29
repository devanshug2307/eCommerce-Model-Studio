## Credits and Dodo Payments Integration

This app now supports a credits system and scaffolding for integrating with Dodo Payments.

### User credits (frontend)
- Stored locally for demo via `localStorage` using `services/creditsService.ts`.
- Default pricing: 10 credits per generated image (batch or variation).
- UI:
  - Header shows current credits and a Buy Credits button.
  - `components/BuyCredits.tsx` renders 100/200/300 credit packs.

### Where credits are enforced
- `App.tsx` checks credits before calling Gemini and consumes credits per action.

### Backend endpoints (scaffold)
- Create Checkout Session: `api/credits/createCheckoutSession.ts`
  - Expects `{ userId, pack }` and calls Dodo Checkout Sessions.
  - Configure env vars: `DODOPAYMENTS_API_KEY`, `APP_BASE_URL`.
- Webhook: `api/webhooks/dodo.ts`
  - Handles payment completion and credits the user identified in `metadata.user_id`.
  - Configure and verify webhook with `DODOPAYMENTS_WEBHOOK_SECRET` (implementation left as TODO).

### Production setup
1. ✅ Products created in Dodo Payments:
   - 100 Credits Pack: `pdt_PoJrpMJOBJnfMjyWESkOv` ($9.99)
   - 200 Credits Pack: `pdt_VXiRA2vtwSPmayEhXgj1h` ($17.99)
   - 300 Credits Pack: `pdt_GWA1vy1w6qNyz7zG5oIjg` ($24.99)
   - Product IDs are already configured in `api/credits/createCheckoutSession.ts`
2. Set env vars:
   - `DODOPAYMENTS_API_KEY` (server only)
   - `APP_BASE_URL` (e.g., https://yourapp.com)
   - `DODOPAYMENTS_WEBHOOK_SECRET` (server only)
3. Implement webhook signature verification in `api/webhooks/dodo.ts`.
4. Replace localStorage credits with your database (user table with `credits_balance`).
5. In `services/creditsService.startCheckout`, call your backend `POST /api/credits/createCheckoutSession` and redirect to returned URL.

### Notes
- The included backend files are serverless-style handlers; adapt to your hosting.
- For local dev without a backend, clicking a pack immediately adds credits locally.

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1SYuM2YHeemB9awIaLnLs70maCQQfxB2b

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the root directory with:
   ```env
   # Gemini API Key (required for image generation)
   GEMINI_API_KEY=your_gemini_api_key_here

   # Dodo Payments Configuration
   DODOPAYMENTS_API_KEY=your_dodo_payments_api_key_here
   APP_BASE_URL=http://localhost:3000

   # Frontend API Endpoint (for checkout)
   # For local development: http://localhost:3000
   # For production: https://yourdomain.com
   VITE_API_BASE_URL=http://localhost:3000

   # Webhook Secret (for verifying webhook signatures)
   DODOPAYMENTS_WEBHOOK_SECRET=your_webhook_secret_here
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

## Next Steps for Dodo Payments Integration

### 1. Set Up Your Backend Server
The checkout session endpoint needs to be deployed as a serverless function or API route:

- **Option A: Vercel Serverless Functions**
  - Create `api/credits/createCheckoutSession.ts` as a Vercel function
  - Deploy to Vercel and update `VITE_API_BASE_URL` to your Vercel URL

- **Option B: Netlify Functions**
  - Create `netlify/functions/createCheckoutSession.ts`
  - Deploy to Netlify and update `VITE_API_BASE_URL`

- **Option C: Express/Node.js Backend**
  - Create a separate Express server
  - Add a POST route at `/api/credits/createCheckoutSession`
  - Update `VITE_API_BASE_URL` to your server URL

### 2. Get Your Dodo Payments API Key
1. Sign up/login at [Dodo Payments Dashboard](https://dashboard.dodopayments.com)
2. Go to Settings → API Keys
3. Copy your API key and add it to `.env.local` as `DODOPAYMENTS_API_KEY`

### 3. Configure Webhook (for payment completion)
1. In Dodo Payments Dashboard, go to Webhooks
2. Create a new webhook pointing to: `https://yourdomain.com/api/webhooks/dodo`
3. Copy the webhook secret and add it to `.env.local` as `DODOPAYMENTS_WEBHOOK_SECRET`
4. Implement webhook signature verification in `api/webhooks/dodo.ts`

### 4. Test the Flow
1. Start your backend server
2. Update `VITE_API_BASE_URL` in `.env.local` to point to your backend
3. Click "Buy Credits" in the app
4. Complete a test payment (use Dodo's test mode)
5. Verify credits are added after payment

### 5. Production Deployment
- Replace `localStorage` with a database-backed user credits system
- Implement proper user authentication
- Set up your production domain and update `APP_BASE_URL`
- Configure production webhook URL in Dodo Payments dashboard
