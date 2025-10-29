# Vercel Deployment Guide for Dodo Payments Integration

## ✅ What's Already Done

1. ✅ Products created in Dodo Payments
2. ✅ API route created at `api/credits/createCheckoutSession.ts`
3. ✅ Frontend code updated to call the API
4. ✅ Environment variables configured in `.env.local`
5. ✅ **Supabase database table created** (`user_credits`)
6. ✅ **Webhook updated to store credits in Supabase**
7. ✅ **Frontend syncs credits from database**

## 📋 Next Steps for Vercel Deployment

### Step 1: Update Your `.env.local` File

Your `.env.local` needs these updates:

```env
# Gemini API Configuration
VITE_API_KEY=AIzaSyBOM7IBgYTIYm8Fx5lkVYzzHseLqSg4n50

# Dodo Payments Configuration
DODO_PAYMENTS_API_KEY=an444KtQj64AoeZy.jubPV98KbACILVmQjp0hwyZqvAWH7dZ15yEl_WRR0ee2-wAk
DODO_PAYMENTS_ENV=test

# App Base URL (remove the space before =)
APP_BASE_URL=https://e-commerce-model-studio.vercel.app

# Webhook Secret
DODOPAYMENTS_WEBHOOK_SECRET=ep_34k0A4CzhoRG5TdXsseKX3OsgAi

# Frontend API Endpoint - Points to your Vercel deployment
VITE_API_BASE_URL=https://e-commerce-model-studio.vercel.app
```

**Important:** Remove the space before `=` in `APP_BASE_URL`.

### Step 2: Configure Environment Variables in Vercel Dashboard

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project: `e-commerce-model-studio`
3. Go to **Settings** → **Environment Variables**
4. Add these variables (use the same values from `.env.local`):

   - `VITE_API_KEY` = Your Gemini API key
   - `DODO_PAYMENTS_API_KEY` = Your Dodo Payments API key
   - `APP_BASE_URL` = `https://e-commerce-model-studio.vercel.app`
   - `DODOPAYMENTS_WEBHOOK_SECRET` = Your webhook secret
   - **`SUPABASE_URL`** = `https://lkfdimrlbctlughzocis.supabase.co`
   - **`SUPABASE_ANON_KEY`** = Your Supabase anon key (from `.env.local`)

   **Note:** `VITE_API_BASE_URL` is for frontend only - it will be automatically set based on your deployment URL.
   
   **Important:** Set these for **Production**, **Preview**, and **Development** environments.

### Step 3: Deploy to Vercel

**Option A: Via GitHub (Recommended)**
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Vercel will automatically deploy

**Option B: Via Vercel CLI**
```bash
npm i -g vercel
vercel
```

### Step 4: Verify API Route Works

After deployment, test your API endpoint:

```bash
curl -X POST https://e-commerce-model-studio.vercel.app/api/credits/createCheckoutSession \
  -H "Content-Type: application/json" \
  -d '{"userId":"test_user","pack":100}'
```

You should get a response with a `checkout_url`.

### Step 5: Configure Webhook in Dodo Payments

1. Go to [Dodo Payments Dashboard](https://dashboard.dodopayments.com)
2. Navigate to **Webhooks**
3. Create a new webhook:
   - **URL:** `https://e-commerce-model-studio.vercel.app/api/webhooks/dodo`
   - **Events:** Select `payment.succeeded` or `checkout.completed`
4. Copy the webhook secret (should match your `DODOPAYMENTS_WEBHOOK_SECRET`)

### Step 6: Test the Complete Flow

1. Visit your deployed app: `https://e-commerce-model-studio.vercel.app`
2. Click "Buy Credits"
3. Select a credit pack (100, 200, or 300)
4. Complete the payment in Dodo Payments checkout
5. Verify you're redirected back to your app
6. Check if credits are added (currently using localStorage)

## 🔧 Troubleshooting

### API Route Not Found (404)
- Make sure the file is at `api/credits/createCheckoutSession.ts`
- Vercel automatically creates routes from files in the `api/` folder
- The route will be: `/api/credits/createCheckoutSession`

### Environment Variables Not Working
- Check Vercel dashboard → Settings → Environment Variables
- Make sure variables are added for **Production**, **Preview**, and **Development**
- Redeploy after adding environment variables

### CORS Issues
- Vercel handles CORS automatically for serverless functions
- If you see CORS errors, check that `VITE_API_BASE_URL` matches your deployment URL

## 📝 Current Status

- ✅ Frontend: Ready to call API
- ✅ Backend API Route: Created and configured
- ✅ Products: Created in Dodo Payments
- ✅ **Database: Supabase table created and integrated**
- ✅ **Webhook: Stores credits in Supabase database**
- ✅ **Frontend: Syncs credits from database automatically**
- ⏳ Deployment: Needs to be deployed to Vercel
- ⏳ Webhook: Needs to be configured in Dodo Payments dashboard

## 🚀 After Deployment

Once deployed, your checkout flow will work like this:

1. User clicks "Buy Credits" → Frontend calls `/api/credits/createCheckoutSession`
2. Your serverless function creates a Dodo Payments checkout session
3. User is redirected to Dodo Payments checkout page
4. After payment, Dodo Payments sends webhook to `/api/webhooks/dodo`
5. **Webhook stores credits in Supabase database** ✅
6. User returns to app → Credits sync from database automatically ✅
7. Credits persist across devices and sessions ✅

---

**Need Help?** Check Vercel logs: Dashboard → Your Project → Deployments → Click on latest deployment → View Function Logs


