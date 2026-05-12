# Committee Management System - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd committee-management-system
npm install
```

### 2. Supabase Setup

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (takes ~2 minutes)

#### Run Database Schema
1. Go to SQL Editor in Supabase Dashboard
2. Copy and paste the entire content of `supabase/schema.sql`
3. Click "Run" to execute the schema

#### Create Storage Buckets
1. Go to Storage in Supabase Dashboard
2. Create two buckets:
   - **profiles** (for user avatars)
   - **payments** (for payment proof screenshots)
3. For each bucket, set the policy to allow public read:
   - Click on the bucket
   - Go to "Policies"
   - Add policy: "Allow public read access"
   - SQL: `(bucket_id = 'profiles')`

#### Get API Credentials
1. Go to Settings > API in Supabase Dashboard
2. Copy:
   - Project URL
   - anon/public key

### 3. Configure Environment

Update both environment files with your Supabase credentials:

**src/environments/environment.ts**
```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'https://your-project.supabase.co',
    anonKey: 'your-anon-key-here'
  }
};
```

**src/environments/environment.prod.ts**
```typescript
export const environment = {
  production: true,
  supabase: {
    url: 'https://your-project.supabase.co',
    anonKey: 'your-anon-key-here'
  }
};
```

### 4. Run Development Server
```bash
npm start
```

Navigate to `http://localhost:4200`

## Testing the Application

### Create Test Users

1. **Sign Up** through the application UI at `/auth/signup`
2. Create at least 3-5 test users with different emails
3. Check your email for verification links (if email is configured)
4. Complete profile for each user with payment details

### Test Committee Flow

1. **Login** as User 1
2. **Create Committee**:
   - Name: "Test Committee"
   - Amount: 50000 PKR
   - Duration: 6 months
   - Members: 6
   - Your turn: Month 1
   - Make it public

3. **Add Members** (as creator):
   - Go to committee details
   - Add other test users
   - Assign slots and turn months

4. **Test Explore** (as User 2):
   - Login as different user
   - Go to Dashboard > Explore tab
   - Find the public committee
   - Request to join

5. **Approve Request** (as User 1):
   - Check notifications
   - Approve join request
   - Assign slot and turn month

### Seed Data (Optional)

If you want pre-populated data:

1. Create 5 users through Supabase Auth Dashboard
2. Note their UUIDs from `auth.users` table
3. Edit `supabase/seed.sql` and replace all `USER_X_UUID` with actual UUIDs
4. Run the seed file in Supabase SQL Editor

## Features to Test

### Authentication
- ✅ Sign up with email/password
- ✅ Login with remember me
- ✅ Password reset
- ✅ Profile picture upload
- ✅ Auth guards on protected routes

### Profile Management
- ✅ Complete profile on first login
- ✅ View profile with reputation badge
- ✅ Edit profile details
- ✅ View public profiles

### Committee Management
- ✅ Create committee with all parameters
- ✅ View my committees
- ✅ Browse public committees
- ✅ Filter committees by amount/duration
- ✅ Request to join
- ✅ Approve/reject join requests

### Payment Tracking
- ✅ View payment grid
- ✅ Mark payments as paid
- ✅ Upload payment proof
- ✅ Payment status indicators

### Notifications
- ✅ Real-time notifications
- ✅ Unread count badge
- ✅ Mark as read
- ✅ Different notification types

## Troubleshooting

### Build Errors

**Error: Cannot find module '@angular/material'**
```bash
npm install @angular/material @angular/cdk
```

**Error: Tailwind classes not working**
```bash
npm install -D tailwindcss postcss autoprefixer
```

### Supabase Errors

**Error: Invalid API key**
- Check that you copied the correct anon key
- Make sure there are no extra spaces
- Verify the URL format: `https://xxx.supabase.co`

**Error: Row Level Security policy violation**
- Make sure you ran the complete schema.sql
- Check that RLS policies were created
- Verify you're logged in when accessing protected data

**Error: Storage bucket not found**
- Create the buckets in Supabase Dashboard
- Make sure bucket names match exactly: `profiles` and `payments`
- Set public read policies on both buckets

### Runtime Errors

**Error: Cannot read property of undefined**
- Check that profile is loaded before accessing
- Use optional chaining: `profile?.name`
- Add loading states

**Error: Supabase client not initialized**
- Verify environment variables are set
- Check that SupabaseService is provided in root
- Restart dev server after changing environment files

## Production Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel/Netlify
1. Connect your Git repository
2. Set build command: `npm run build`
3. Set output directory: `dist/committee-management-system/browser`
4. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## Security Checklist

- ✅ Row Level Security enabled on all tables
- ✅ Auth guards on protected routes
- ✅ Profile completion check
- ✅ Input validation on all forms
- ✅ Secure file uploads
- ✅ API keys in environment files (not committed)

## Performance Optimization

- ✅ Lazy loading for feature modules
- ✅ Standalone components
- ✅ Angular Signals for reactive state
- ✅ Indexed database queries
- ✅ Image optimization
- ✅ Code splitting

## Next Steps

1. **Configure Email Templates** in Supabase for better auth emails
2. **Add SMS Notifications** using Twilio integration
3. **Implement Dark Mode** using Tailwind dark: classes
4. **Add Analytics** with Google Analytics or Mixpanel
5. **Create Mobile App** using Ionic/Capacitor
6. **Add Payment Gateway** for automated payments
7. **Implement Chat** for committee members
8. **Add Reports** with PDF export

## Support

For issues or questions:
- Check the README.md for detailed documentation
- Review Supabase documentation: https://supabase.com/docs
- Check Angular Material docs: https://material.angular.io

## License

MIT License - Free to use for personal or commercial projects
