# Supabase OAuth Setup Guide

## Enable LinkedIn OAuth Provider

To enable LinkedIn login, you need to configure it in your Supabase dashboard:

### Step 1: Get LinkedIn OAuth Credentials

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Sign in with your LinkedIn account
3. Click **Create app**
4. Fill in the app details:
   - **App name**: Your app name (e.g., "Resumify AI")
   - **LinkedIn Page**: Select or create a LinkedIn page
   - **Privacy Policy URL**: Your privacy policy URL (can be a placeholder for now)
   - **App logo**: Upload a logo (optional)
5. Click **Create app**
6. Once created, go to the **Auth** tab
7. Under **Redirect URLs**, click **Add redirect URL**
8. Add this exact URL (replace YOUR_PROJECT_REF with your Supabase project reference):
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
   To find your project reference:
   - Go to Supabase Dashboard → Settings → API
   - Your project URL will be like: `https://abcdefghijklmnop.supabase.co`
   - The reference is the part before `.supabase.co` (e.g., `abcdefghijklmnop`)
9. Click **Update**
10. Go to the **Products** tab and request access to **Sign In with LinkedIn using OpenID Connect** (if not already enabled)
11. Go back to the **Auth** tab and copy:
    - **Client ID**
    - **Client Secret**

### Step 2: Configure in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** > **Providers**
4. Find **LinkedIn** in the list
5. Toggle it **ON**
6. Enter your LinkedIn **Client ID** and **Client Secret**
7. Click **Save**

### Step 3: Configure Redirect URLs in Supabase

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. Add redirect URL: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
4. Copy **Client ID** and **Client Secret**
5. In Supabase Dashboard, go to **Authentication** > **Providers**
6. Find **LinkedIn** and toggle it **ON**
7. Enter your LinkedIn credentials
8. Click **Save**

1. Go to **Authentication** > **URL Configuration** in Supabase Dashboard
2. Set **Site URL** to: `http://localhost:3000` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:3000/**`
   - `http://localhost:3000/builder`
   - `http://localhost:3000/auth/callback`
4. Click **Save**

**Important:** The redirect URL in LinkedIn must match exactly:
- Format: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- No trailing slashes
- Must use `https://` (not `http://`)

## Troubleshooting

### Error: "Unsupported provider: provider is not enabled"

**Even if you've enabled it, try these steps:**

1. **Double-check in Supabase Dashboard:**
   - Go to **Authentication** > **Providers**
   - Make sure LinkedIn toggle is **ON** (green/enabled)
   - Verify Client ID and Client Secret are saved (not empty)
   - Click **Save** again even if already saved

2. **Clear browser cache and restart:**
   - Hard refresh your browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
   - Restart your Next.js dev server: `npm run dev`

3. **Verify your Supabase project:**
   - Make sure you're using the correct project
   - Check that `NEXT_PUBLIC_SUPABASE_URL` in `.env.local` matches your project URL

4. **Check LinkedIn App Status:**
   - Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
   - Make sure your app is **Approved** (not in development mode restrictions)
   - Verify the redirect URL is exactly: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

5. **Wait a few minutes:**
   - Sometimes Supabase needs a moment to sync provider settings
   - Try again after 2-3 minutes

### Error: "redirect_uri_mismatch"

Make sure the redirect URI in LinkedIn matches exactly:
- `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- No trailing slashes
- Must be `https://` (not `http://`)
- Check in LinkedIn Developers → Your App → Auth tab → Redirect URLs

### Error: "invalid_client"

- Check that your Client ID and Client Secret are correct in Supabase dashboard
- Make sure there are no extra spaces when copying/pasting
- Verify the credentials in LinkedIn Developers dashboard match what's in Supabase

### Still Not Working?

1. **Test with a simple redirect:**
   - Try changing `redirectTo` in the code to just `/` instead of `/builder`
   - This helps isolate if it's a redirect URL issue

2. **Check Supabase logs:**
   - Go to Supabase Dashboard → Logs → Auth Logs
   - Look for any error messages related to LinkedIn

3. **Verify environment variables:**
   - Make sure `.env.local` has correct values
   - Restart dev server after changing `.env.local`

## Quick Test

After enabling LinkedIn OAuth:
1. **Restart your frontend dev server** (important!)
2. Hard refresh your browser
3. Try logging in with LinkedIn
4. You should be redirected to LinkedIn's consent screen
5. After approval, you'll be redirected back to your app

## Alternative: Email/Password Authentication

If LinkedIn OAuth continues to have issues, you can use email/password authentication which is enabled by default in Supabase. The login page already supports this option and works immediately without any OAuth setup.

