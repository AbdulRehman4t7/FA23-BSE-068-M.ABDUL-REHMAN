# 🚀 Supabase Setup - Final Steps

Your Supabase project is created! Now complete these steps:

## ✅ Step 1: Get Your Anon Key

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **committee-management-system**
3. Click **Settings** (gear icon in sidebar) → **API**
4. In the **Project API keys** section, find the **`anon` `public`** key
5. Copy the entire key (it's very long, starts with `eyJhbGc...`)

## ✅ Step 2: Update Environment Files

Open these two files and replace `REPLACE_WITH_YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD`:

### File 1: `src/environments/environment.ts`
```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'https://wipikbaqavaozstjxxzl.supabase.co',
    anonKey: 'PASTE_YOUR_ANON_KEY_HERE'  // Replace this line
  }
};
```

### File 2: `src/environments/environment.prod.ts`
```typescript
export const environment = {
  production: true,
  supabase: {
    url: 'https://wipikbaqavaozstjxxzl.supabase.co',
    anonKey: 'PASTE_YOUR_ANON_KEY_HERE'  // Replace this line
  }
};
```

## ✅ Step 3: Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor** (in sidebar)
2. Click **"New Query"**
3. Open the file: `supabase/schema.sql` from this project
4. Copy **ALL** the content (it's about 300+ lines)
5. Paste into the SQL Editor
6. Click **"Run"** button (or press Ctrl+Enter)
7. Wait for it to complete (should take 2-3 seconds)
8. You should see: ✅ **"Success. No rows returned"**

## ✅ Step 4: Create Storage Buckets

### Bucket 1: profiles (for user avatars)
1. Go to **Storage** in sidebar
2. Click **"Create a new bucket"**
3. Settings:
   - Name: `profiles`
   - Public bucket: ✅ **Check this box**
   - File size limit: 5 MB (default is fine)
4. Click **"Create bucket"**

### Bucket 2: payments (for payment proofs)
1. Click **"Create a new bucket"** again
2. Settings:
   - Name: `payments`
   - Public bucket: ✅ **Check this box**
   - File size limit: 10 MB
3. Click **"Create bucket"**

## ✅ Step 5: Configure Authentication (Optional but Recommended)

For easier testing, disable email confirmation:

1. Go to **Authentication** → **Providers** → **Email**
2. Scroll down to **Email Settings**
3. **Uncheck** "Confirm email"
4. Click **Save**

This allows you to sign up and login immediately without email verification.

## ✅ Step 6: Verify Setup

After completing all steps above, check:

1. **SQL Editor** → **Tables** - You should see 6 tables:
   - profiles
   - committees
   - committee_members
   - payments
   - notifications
   - join_requests

2. **Storage** - You should see 2 buckets:
   - profiles (public)
   - payments (public)

3. **Authentication** → **Policies** - Should show RLS policies enabled

## ✅ Step 7: Test the Application

1. Make sure the dev server is running (it should be at http://localhost:4200)
2. If you updated the environment files, the page should auto-reload
3. If not, press **Ctrl+F5** to hard refresh
4. You should now see the login page without errors!

## 🎉 Ready to Test!

Now you can:

1. **Sign Up**: Click "Sign up" and create your first account
   - Full Name: Your Name
   - Phone: +92-300-1234567
   - Email: your@email.com
   - Password: (at least 6 characters)

2. **Complete Profile**: After signup, you'll be asked to complete your profile
   - Add bank details (IBAN) OR mobile wallet (JazzCash/Easypaisa)

3. **Create Committee**: 
   - Click "Create Committee"
   - Fill in the details
   - Set monthly amount, duration, members
   - Choose your turn month

4. **Explore Features**:
   - Dashboard with My Committees and Explore tabs
   - View notifications
   - Edit your profile
   - Browse public committees

## 🐛 Troubleshooting

### If you see "Invalid API key" error:
- Make sure you copied the **anon** key, not the publishable key
- Check there are no extra spaces in the environment files
- Restart the dev server (Ctrl+C, then `npm start`)

### If you see "relation does not exist" error:
- The schema wasn't run properly
- Go back to SQL Editor and run the schema.sql again

### If file uploads don't work:
- Make sure both storage buckets are created
- Verify they are set to **public**
- Check bucket names are exactly: `profiles` and `payments`

## 📞 Need Help?

Check the browser console (F12) for detailed error messages. Most issues are:
1. Wrong API key
2. Schema not run
3. Storage buckets not created
4. Typos in bucket names

---

**Your Project URL**: https://wipikbaqavaozstjxxzl.supabase.co
**Status**: ⏳ Waiting for anon key to be added to environment files
