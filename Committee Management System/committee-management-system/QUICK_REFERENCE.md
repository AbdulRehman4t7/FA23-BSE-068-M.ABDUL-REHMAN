# Quick Reference Card

## 🚀 Installation (5 minutes)

```bash
npm install
# Update src/environments/environment.ts with Supabase credentials
npm start
```

## 🔑 Supabase Setup (10 minutes)

1. Create project at supabase.com
2. Run `supabase/schema.sql` in SQL Editor
3. Create buckets: `profiles` and `payments`
4. Copy URL and anon key to environment files

## 📁 Project Structure

```
src/app/
├── core/
│   ├── services/     # Business logic (7 services)
│   ├── models/       # TypeScript interfaces (4 models)
│   ├── guards/       # Route protection (2 guards)
│   └── interceptors/ # HTTP interceptors
├── features/
│   ├── auth/         # Login, signup, reset (3 components)
│   ├── profile/      # Profile management (4 components)
│   ├── dashboard/    # Main dashboard (1 component)
│   ├── committee/    # Committee features (4 components)
│   └── notifications/# Notification center (1 component)
└── shared/
    ├── components/   # Reusable UI (7 components)
    └── pipes/        # Formatters (3 pipes)
```

## 🎯 Key Services

| Service | Purpose |
|---------|---------|
| AuthService | Login, signup, session management |
| ProfileService | User profiles, reputation |
| CommitteeService | Committee CRUD, members |
| PaymentService | Payment tracking, marking |
| NotificationService | Real-time notifications |
| SupabaseService | Supabase client wrapper |

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| profiles | User data + reputation |
| committees | Committee details |
| committee_members | Member-committee links |
| payments | Payment records |
| notifications | User notifications |
| join_requests | Join requests |

## 🎨 Color Scheme

```css
Primary (Navy):   #0F172A
Accent (Amber):   #F59E0B
Success (Green):  #059669
Warning (Orange): #D97706
Error (Red):      #DC2626
```

## 📱 Responsive Breakpoints

```css
Mobile:  < 768px  (bottom nav)
Tablet:  768-1024px (collapsible sidebar)
Desktop: > 1024px (full sidebar)
```

## 🔐 Authentication Flow

```
1. Signup → 2. Email Verify → 3. Login → 4. Complete Profile → 5. Dashboard
```

## 💰 Committee Lifecycle

```
Pending → Active → Completed
   ↓
Cancelled
```

## 🎭 User Badge Levels

| Badge | Score | Description |
|-------|-------|-------------|
| New | 0-2.0 | New member |
| Trusted | 2.0-3.5 | Good history |
| Verified | 3.5-4.5 | Excellent record |
| Elite | 4.5-5.0 | Outstanding |

## 📊 Payment Status

| Status | Icon | Color |
|--------|------|-------|
| Paid | ✓ | Green |
| Pending | ○ | Yellow |
| Overdue | ✗ | Red |

## 🔔 Notification Types

1. turn_reminder - Your turn coming
2. payment_due - Payment deadline
3. new_committee - Committee created
4. payment_confirmed - Payment verified
5. member_added - Added to committee
6. join_request - New join request
7. committee_active - Committee started

## 🛠️ Common Commands

```bash
# Development
npm start                 # Start dev server
npm run build            # Production build
npm test                 # Run tests

# Troubleshooting
rm -rf node_modules      # Clear dependencies
npm install              # Reinstall
ng serve --port 4201     # Use different port
```

## 🐛 Quick Fixes

**Build Error**: `npm install`
**Port Busy**: `ng serve --port 4201`
**Supabase Error**: Check URL and key in environment files
**Tailwind Not Working**: `npm install -D tailwindcss`

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| README.md | Overview & features |
| INSTALL.md | Quick installation |
| SETUP_GUIDE.md | Detailed setup |
| PROJECT_SUMMARY.md | Architecture |
| CHECKLIST.md | Completion status |
| This file | Quick reference |

## 🎯 Testing Checklist

- [ ] Sign up new user
- [ ] Complete profile
- [ ] Create committee
- [ ] Add members
- [ ] Request to join
- [ ] Mark payment
- [ ] View notifications

## 🚀 Deployment

### Vercel/Netlify
```bash
npm run build
# Deploy dist/committee-management-system/browser
```

### Environment Variables
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
```

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Angular Docs**: https://angular.io/docs
- **Material UI**: https://material.angular.io
- **Tailwind CSS**: https://tailwindcss.com/docs

## ⚡ Performance Tips

1. Use lazy loading for routes ✅
2. Implement virtual scrolling for long lists
3. Add service worker for PWA
4. Enable compression on server
5. Use CDN for static assets

## 🔒 Security Checklist

- ✅ RLS enabled on all tables
- ✅ Auth guards on routes
- ✅ Input validation
- ✅ Secure file uploads
- ✅ Environment variables for secrets

## 💡 Pro Tips

1. **Test with multiple users** - Create 3-5 test accounts
2. **Use seed data** - Speeds up testing
3. **Check browser console** - For debugging
4. **Enable Supabase logs** - For backend issues
5. **Use Angular DevTools** - For component inspection

## 🎉 Success Indicators

✅ Can sign up and login
✅ Profile completion works
✅ Can create committee
✅ Dashboard shows data
✅ Notifications appear
✅ Payments can be marked
✅ No console errors

## 📈 Next Steps After Setup

1. Customize branding (colors, logo)
2. Configure email templates in Supabase
3. Add more test data
4. Test all user flows
5. Deploy to staging
6. User acceptance testing
7. Deploy to production

---

**Setup Time**: 15-20 minutes
**Skill Level**: Intermediate
**Prerequisites**: Node.js, npm, Supabase account
