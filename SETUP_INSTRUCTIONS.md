# Supabase Setup Checklist & Instructions

Your new Supabase project ID: **bmetwadxcoehqlfsvpbqr**
Your new Supabase URL: **https://metwadxcoehqlfsvpbqr.supabase.co**

---

## Step 1: Create Storage Bucket for Images

1. Go to **Supabase Dashboard** → Select your project
2. Navigate to **Storage** → Click **"New Bucket"**
3. Name: `generated-images` → Check **"Public bucket"** → Click **Create**

   _If you already created the bucket earlier and skipped policies, make sure to run the SQL snippet below now (see step 1a) – otherwise the front end won't be able to upload or delete images._

4. Go to **Storage** → **Policies** → Select `generated-images` bucket
5. Click **"New Policy"** → **"For full customization"** and paste these 3 policies:

```postgresSQL
-- Auth users can upload images
CREATE POLICY "Auth users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'generated-images' AND auth.uid() IS NOT NULL);

-- Public can view generated images
CREATE POLICY "Public can view generated images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'generated-images');

-- Users can delete their own images
CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'generated-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## Step 2: Create Database Tables, Functions & Triggers

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **"New Query"** → Paste the entire contents of `supabase/schema.sql`
3. Click **"Run"** (wait for completion ~30 seconds)
4. You should see green checkmarks. If any errors, check the error message and fix

**File location:** `remix-of-aibuddy_final2-main/supabase/schema.sql`

---

## Step 3: Configure Edge Functions Secrets

These secrets are required for AI features to work.

### Via Supabase Dashboard (Easiest for Beginners):

1. Go to **Supabase Dashboard** → **Settings** → **Edge Functions** → **Secrets**
2. Click **"New Secret"** and add **one or more** of these:

| Secret Name             | Value        | Where to Get                                    |
| ----------------------- | ------------ | ----------------------------------------------- |
| `GROQ_API_KEY`        | Your API key | Get from https://console.groq.com/keys          |
| `GEMINI_API_KEY`      | Your API key | Get from https://aistudio.google.com/apikey     |
| `RESEND_API_KEY`      | Your API key | If using Resend for email (optional)            |

**Minimum required:**

- At least **one of** `GROQ_API_KEY` **or** `GEMINI_API_KEY` (for chat, docs, finance, health, learning features)

### Via CLI (For Advanced Users):

```bash
cd remix-of-aibuddy_final2-main
supabase secrets set GROQ_API_KEY=your_key_here
supabase secrets set GEMINI_API_KEY=your_key_here
```

---

## Step 4: Deploy Edge Functions

Deploy each function to your Supabase project.

### Option A: Manual commands
```bash
cd remix-of-aibuddy_final2-main

# Deploy all functions
supabase functions deploy chat-ai
supabase functions deploy document-summarize
supabase functions deploy finance-advice
supabase functions deploy health-insights
supabase functions deploy learning-assistant
supabase functions deploy send-report
```

### Option B: Use the helper script (Windows PowerShell)
1. Make sure you have Supabase CLI installed and linked to your project.
2. Run the script:

```powershell
cd remix-of-aibuddy_final2-main\scripts
.\deploy-functions.ps1
```

The script will prompt you for any API keys and deploy all functions automatically.

**Prerequisites:**

- Install Supabase CLI: https://supabase.com/docs/guides/cli/getting-started
- Login: `supabase login`
- Link your project: `supabase link --project-ref bmetwadxcoehqlfsvpbqr`

---

## Step 5: Configure Auth Settings

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Enable **Email** (should be on by default)
3. Enable **Google** (optional for OAuth):

   - Click **Google** → Follow setup instructions
   - Get OAuth credentials from Google Cloud Console
   - Add redirect URI: `https://metwadxcoehqlfsvpbqr.supabase.co/auth/v1/callback`
4. Go to **Authentication** → **Settings**
5. Set:

   - **Site URL**: `http://localhost:8080` (for local testing)
   - **Redirect URLs**: `http://localhost:8080/*`

---

## Step 6: Verify Frontend .env

Check `remix-of-aibuddy_final2-main/.env` has:

```
VITE_SUPABASE_PROJECT_ID=bmetwadxcoehqlfsvpbqr
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_XAobBCkFzo7c7jEy64BnaA_0kT_Ce0N
VITE_SUPABASE_URL=https://metwadxcoehqlfsvpbqr.supabase.co
```

✅ These are already updated

---

## Step 7: Test the Application

1. Restart your dev server:

```bash
cd remix-of-aibuddy_final2-main
npm run dev
```

2. Navigate to `http://localhost:8080/` and test:
   - **Sign up** with email/password
   - **Sign in** with credentials
   - **Google sign-in** (if configured)
   - Try **Chat**, **Generate Image**, **Documents**, etc. features

---

## Troubleshooting

### "Failed to fetch" on sign in/up

- Check browser DevTools → Network tab
- Ensure `.env` Supabase URL is correct
- Check Supabase project status (not paused)

### "AI response failed" / functions not working

- Verify edge functions deployed: `supabase functions list`
- Check secrets are set: **Supabase Dashboard** → **Settings** → **Edge Functions** → **Secrets**
- Check function logs in Supabase dashboard

### Google OAuth not working

- Ensure redirect URI is registered in Google Cloud & Supabase
- Check browser console for error details

### Tables not created

- Open **Supabase Dashboard** → **SQL Editor**
- Paste `supabase/schema.sql` again and click **Run**
- Check for error messages

---

## API Key Links (Quick Reference)

| Service      | API Key Link                           | Free Tier                |
| ------------ | -------------------------------------- | ------------------------ |
| GROQ         | https://console.groq.com/keys          | Yes, with limits         |
| Gemini       | https://aistudio.google.com/apikey     | Yes, free tier available |
| Google OAuth | https://console.cloud.google.com/apis  | Yes                      |
| Resend Email | https://resend.com/api-keys            | Yes, with limits         |

---

## What's Next?

Once setup is complete:

1. Try **Email/Password Auth** on the login page
2. Try **Chat** feature (requires GROQ or GEMINI key)
3. Try **Generate Image** feature
4. Explore other features: Documents, Learning, Finance, health, Productivity

---

## Support

If stuck:

1. Check **Supabase Project Logs** (Dashboard → Logs)
2. Open DevTools **Console** in your browser
3. Check **Edge Functions Logs** (Dashboard → Edge Functions → Each function)
4. Compare your setup against the SUPABASE_SETUP_GUIDE.md
