# Quick Installation Guide

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Angular 17+ framework
- Angular Material UI components
- Supabase client
- Tailwind CSS
- ngx-toastr for notifications

## Step 2: Supabase Setup

### 2.1 Create Project
1. Go to https://supabase.com
2. Click "New Project"
3. Fill in:
   - Name: committee-system
   - Database Password: (save this!)
   - Region: (choose closest to you)
4. Wait 2-3 minutes for setup

### 2.2 Run Database Schema
1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy entire content from `supabase/schema.sql`
4. Paste and click **Run**
5. You should see "Success. No rows returned"

### 2.3 Create Storage Buckets
1. Go to **Storage** in sidebar
2. Click "Create bucket"
3. Create bucket named: `profiles`
   - Make it public
4. Create bucket named: `payments`
   - Make it public

### 2.4 Get API Credentials
1. Go to **Settings** > **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)

## Step 3: Configure Environment

### 3.1 Update Development Environment
Open `src/environments/environment.ts` and replace:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'PASTE_YOUR_PROJECT_URL_HERE',
    anonKey: 'PASTE_YOUR_ANON_KEY_HERE'
  }
};
```

### 3.2 Update Production Environment
Open `src/environments/environment.prod.ts` and replace:

```typescript
export const environment = {
  production: true,
  supabase: {
    url: 'PASTE_YOUR_PROJECT_URL_HERE',
    anonKey: 'PASTE_YOUR_ANON_KEY_HERE'
  }
};
```

## Step 4: Run the Application

```bash
npm start
```

Wait for compilation, then open: **http://localhost:4200**

## Step 5: Create Your First User

1. Click **Sign Up**
2. Fill in:
   - Full Name: Your Name
   - Phone: +92-300-1234567
   - Email: your@email.com
   - Password: (min 6 characters)
3. Click **Create Account**
4. Login with your credentials

## Step 6: Complete Your Profile

1. After login, you'll be redirected to **Complete Profile**
2. Fill in payment details:
   - Bank Name: Habib Bank Limited
   - IBAN: PK36HABB0000123456789012
   - OR JazzCash: 03001234567
3. Click **Complete Profile**

## Step 7: Create Your First Committee

1. Click **Create Committee** button
2. Fill in:
   - Name: My First Committee
   - Description: Test committee
   - Monthly Amount: 50000
   - Duration: 6 months
   - Max Members: 6
   - Your Turn Month: 1
   - Start Date: (pick a future date)
3. Check payment methods
4. Make it public
5. Click **Create Committee**

## ✅ You're Done!

Your committee system is now running. You can:
- Create more users (use different emails)
- Add members to committees
- Browse public committees
- Test payment tracking
- View notifications

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
npm install
```

### Tailwind not working
```bash
npm install -D tailwindcss postcss autoprefixer
```

### Supabase connection error
- Check your URL and anon key
- Make sure there are no extra spaces
- Verify format: `https://xxx.supabase.co`

### Build errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port already in use
```bash
# Use different port
ng serve --port 4201
```

## 📚 Next Steps

- Read **README.md** for full feature list
- Check **SETUP_GUIDE.md** for detailed setup
- See **PROJECT_SUMMARY.md** for architecture overview

## 🎉 Success Indicators

You'll know everything is working when you can:
- ✅ Sign up and login
- ✅ Complete your profile
- ✅ Create a committee
- ✅ See it in dashboard
- ✅ View notifications

## 💬 Need Help?

1. Check the error message carefully
2. Review the SETUP_GUIDE.md
3. Verify Supabase configuration
4. Check browser console for errors
5. Ensure all dependencies are installed

---

**Estimated Setup Time: 15-20 minutes**
