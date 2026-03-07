# Macrock Limestone - Attendance & Payroll System

A comprehensive attendance tracking and payroll management system built with React, TypeScript, Supabase, and Zustand.

## Features

- **QR Code Attendance**: Workers scan QR codes to clock in/out
- **Manager Interface**: Simple QR scanning for managers to track attendance
- **Admin Dashboard**: Full control over workers, rates, and payroll
- **Payroll Generation**: Automatic payroll calculation based on attendance
- **Quota Completion**: Mark workers as complete when they hit bag quotas (early finish)
- **Editable Rates**: Configurable daily/hourly rates per worker
- **Export Reports**: CSV export for attendance and payroll data

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL + Auth)
- **QR Code**: react-qr-code + @zxing/browser

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the SQL schema from `supabase/schema.sql`

### 3. Create Admin User

In Supabase Dashboard:

1. Go to **Authentication** > **Users**
2. Click **Add User** > **Create New User**
3. Enter email and password
4. After creating, go to **SQL Editor** and run:

```sql
UPDATE public.users 
SET role = 'admin', full_name = 'Admin Name' 
WHERE email = 'your-admin@email.com';
```

### 4. Run Development Server

```bash
npm run dev
```

## Payroll Calculation

Based on the Macrock Limestone commission schedule:

- **Gross Pay** = (Days Worked × Daily Rate) + (OT Hours × Hourly Rate × 1.25)
- **Hourly Rate** = Daily Rate ÷ 8 hours
- **Net Pay** = Gross Pay - SSS - Other Deductions

### Default Rates (Editable in Settings)

| Rate Type | Default Value |
|-----------|---------------|
| Daily Rate | ₱400.00 |
| Hourly Rate | ₱50.00 |
| OT Multiplier | 1.25x |
| Standard Hours | 8 hours |

## User Roles

### Admin
- Manage workers (add, edit, delete)
- Configure rates and settings
- Generate and approve payroll
- View all reports
- Print QR codes

### Manager
- Scan QR codes for clock in/out
- Mark workers as quota complete
- View attendance records

## Project Structure

```
src/
├── components/
│   ├── layout/          # Sidebar, Layout
│   ├── qr/              # QR Scanner, QR Display
│   └── ui/              # Reusable UI components
├── lib/
│   ├── supabase.ts      # Supabase client
│   └── utils.ts         # Utility functions
├── pages/               # Page components
├── stores/              # Zustand stores
└── types/               # TypeScript types
```

## Environment Variables

The Supabase configuration is in `src/lib/supabase.ts`. For production, use environment variables:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## License

Private - Macrock Limestone
