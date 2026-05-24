
# Committee Management System

A full-stack rotating savings/BC (Committee) management system built with Angular 17+ and Supabase.

## Outputs

<div align="center">

<table>
  <tr>
    <td align="center">
      <img src="screenshots/signup.png" width="450" alt="Sign Up Page"/>
      <br/>
      <b>Sign Up / Login</b>
    </td>
    <td align="center">
      <img src="screenshots/dashboard.png" width="450" alt="Dashboard"/>
      <br/>
      <b>Dashboard</b>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="screenshots/explore.png" width="450" alt="Explore Committees"/>
      <br/>
      <b>Explore Committees</b>
    </td>
    <td align="center">
      <img src="screenshots/committee-detail.png" width="450" alt="Committee Detail"/>
      <br/>
      <b>Committee Detail & Payment Matrix</b>
    </td>
  </tr>
</table>

</div>

## Features

### 🔐 Authentication
- Sign up with email, password, full name, and phone
- Login with "Remember Me" option
- Password reset via email
- Profile picture upload to Supabase Storage
- Protected routes with auth guards

### 👤 User Profile & Reputation
- Complete profile with bank details (IBAN, JazzCash, Easypaisa)
- Reputation scoring system (0-5 stars)
- Badge system: New, Trusted, Verified, Elite
- Committee history tracking
- Public profile viewing

### 🏛️ Committee Management
- Create committees with customizable parameters
- Set monthly contribution amount and duration
- Choose payment methods (Bank, JazzCash, Easypaisa)
- Public or private committees
- Automatic activation when all slots filled
- Member management and slot assignment

### 💰 Payment Tracking
- Visual payment grid showing all members and months
- Mark payments as paid with proof upload
- Payment status: Paid ✅ / Pending ⏳ / Overdue ❌
- Transaction reference tracking
- Payment history log

### 📊 Dashboard
- My Committees tab: View all joined/created committees
- Explore tab: Browse and join public committees
- Filter by amount, duration, and reputation
- Quick actions for payments and reminders

### 🔔 Real-time Notifications
- Turn reminders (3 days before)
- Payment due notifications
- Committee status updates
- Real-time updates using Supabase Realtime
- Unread count badge

## Tech Stack

- **Frontend**: Angular 17+ (Standalone Components, Signals)
- **Backend**: Supabase (Auth, Database, Realtime, Storage)
- **UI**: Angular Material + Tailwind CSS
- **State Management**: Angular Signals
- **Notifications**: ngx-toastr
- **Charts**: Chart.js + ng2-charts

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account

### 1. Clone and Install

```bash
cd committee-management-system
npm install

## Outputs

<div align="center">

<table>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/7d3347fa-c8fb-4698-be51-280b0bfb9cf9" width="450" alt="Output 1"/>
      <br/>
      <b>Output 1</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/fde0c68a-001e-43e4-9e1a-10de65c74bc5" width="450" alt="Output 2"/>
      <br/>
      <b>Output 2</b>
    </td>
  </tr>
</table>

<br/>

<img src="https://github.com/user-attachments/assets/84bdc5e6-ae01-4ab2-a645-22b85b36f2d5" width="400" alt="Output 3"/>
<br/>
<b>Output 3</b>

</div>




## Features

### 🔐 Authentication
- Sign up with email, password, full name, and phone
- Login with "Remember Me" option
- Password reset via email
- Profile picture upload to Supabase Storage
- Protected routes with auth guards

### 👤 User Profile & Reputation
- Complete profile with bank details (IBAN, JazzCash, Easypaisa)
- Reputation scoring system (0-5 stars)
- Badge system: New, Trusted, Verified, Elite
- Committee history tracking
- Public profile viewing

### 🏛️ Committee Management
- Create committees with customizable parameters
- Set monthly contribution amount and duration
- Choose payment methods (Bank, JazzCash, Easypaisa)
- Public or private committees
- Automatic activation when all slots filled
- Member management and slot assignment

### 💰 Payment Tracking
- Visual payment grid showing all members and months
- Mark payments as paid with proof upload
- Payment status: Paid ✅ / Pending ⏳ / Overdue ❌
- Transaction reference tracking
- Payment history log

### 📊 Dashboard
- My Committees tab: View all joined/created committees
- Explore tab: Browse and join public committees
- Filter by amount, duration, and reputation
- Quick actions for payments and reminders

### 🔔 Real-time Notifications
- Turn reminders (3 days before)
- Payment due notifications
- Committee status updates
- Real-time updates using Supabase Realtime
- Unread count badge

## Tech Stack

- **Frontend**: Angular 17+ (Standalone Components, Signals)
- **Backend**: Supabase (Auth, Database, Realtime, Storage)
- **UI**: Angular Material + Tailwind CSS
- **State Management**: Angular Signals
- **Notifications**: ngx-toastr
- **Charts**: Chart.js + ng2-charts

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account

### 1. Clone and Install

```bash
cd committee-management-system
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase/schema.sql`
3. Create storage buckets:
   - `profiles` (for avatars)
   - `payments` (for payment proofs)
4. Set bucket policies to public read
5. Get your project URL and anon key from Settings > API

### 3. Environment Configuration

Update `src/environments/environment.ts` and `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: false, // true for prod
  supabase: {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
  }
};
```

### 4. Run Development Server

```bash
npm start
```

Navigate to `http://localhost:4200`

### 5. Seed Test Data (Optional)

1. Create 5 test users through Supabase Auth Dashboard
2. Note their UUIDs from `auth.users` table
3. Update `supabase/seed.sql` with actual UUIDs
4. Run the seed file in Supabase SQL Editor

## Project Structure

```
src/app/
├── core/
│   ├── guards/          # Auth and profile guards
│   ├── interceptors/    # HTTP interceptors
│   ├── models/          # TypeScript interfaces
│   └── services/        # Business logic services
├── features/
│   ├── auth/            # Login, signup, reset password
│   ├── committee/       # Committee CRUD and management
│   ├── dashboard/       # Main dashboard
│   ├── notifications/   # Notification center
│   └── profile/         # User profile management
├── shared/
│   ├── components/      # Reusable UI components
│   └── pipes/           # Custom pipes
└── environments/        # Environment configs
```

## Key Services

- **AuthService**: Authentication and user management
- **ProfileService**: User profile operations
- **CommitteeService**: Committee CRUD and member management
- **PaymentService**: Payment tracking and marking
- **NotificationService**: Real-time notifications

## Database Schema

### Tables
- `profiles` - User profiles with reputation
- `committees` - Committee details
- `committee_members` - Member-committee relationships
- `payments` - Payment records
- `notifications` - User notifications
- `join_requests` - Committee join requests

### Row Level Security (RLS)
All tables have RLS enabled with policies for:
- Users can read/write their own data
- Committee creators have full access to their committees
- Members can view their committee data

## Features in Detail

### Reputation System
- Based on completed committees, on-time payments, and created committees
- Automatically calculated and updated
- Influences badge level (New → Trusted → Verified → Elite)

### Payment Grid
- Visual matrix showing all members and months
- Color-coded status indicators
- Click to mark payments or view details
- Upload payment proof screenshots

### Committee Lifecycle
1. **Pending**: Creator adds members, assigns turns
2. **Active**: All slots filled, payments begin
3. **Completed**: All months finished
4. **Cancelled**: Creator cancels before activation

### Notification Types
- `turn_reminder` - Your turn is coming
- `payment_due` - Payment deadline approaching
- `new_committee` - Committee created
- `payment_confirmed` - Payment verified
- `member_added` - Added to committee
- `committee_active` - Committee started

## Build for Production

```bash
npm run build
```

Build artifacts will be in `dist/` directory.

## Color Scheme

- **Primary**: Deep Navy (#0F172A)
- **Accent**: Gold/Amber (#F59E0B)
- **Background**: White/Gray
- **Success**: Green
- **Warning**: Yellow/Orange
- **Error**: Red

## Responsive Design

- **Desktop**: Full sidebar navigation
- **Tablet**: Collapsible sidebar
- **Mobile**: Bottom navigation bar

## Security Features

- Row Level Security (RLS) on all tables
- Auth guards on protected routes
- Profile completion check
- Secure file uploads to Supabase Storage
- Input validation on all forms

## Future Enhancements

- [ ] SMS notifications via Twilio
- [ ] Automated payment reminders
- [ ] Committee analytics dashboard
- [ ] Export committee reports (PDF)
- [ ] Multi-language support (Urdu)
- [ ] Dark mode
- [ ] Mobile app (Ionic/Capacitor)

## Support

For issues or questions, please create an issue in the repository.

## License

MIT License - feel free to use for personal or commercial projects.
