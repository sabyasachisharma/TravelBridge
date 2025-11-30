# TravelBridge

A crowd-shipping platform connecting travelers with senders for affordable package delivery.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org))
- **Supabase account** ([sign up free](https://supabase.com))

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd travelBridge
npm install
```

### 2. Set Up Database

1. Create a project on [Supabase Dashboard](https://supabase.com/dashboard)
2. Copy your keys from **Settings > API**:
   - Project URL
   - Anon Key
   - Service Role Key

3. **Run Database Migration:**
   - Go to **SQL Editor** in Supabase dashboard
   - Click **+ New Query**
   - Copy and paste the contents of all migration files in order:
     - `supabase/migrations/001_init.sql`
     - `supabase/migrations/002_add_email_verification.sql`
     - `supabase/migrations/003_add_phone_verification.sql`
     - `supabase/migrations/004_add_contact_preference.sql`


### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
# Supabase (from Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# SMTP (optional - for email notifications)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-email@example.com
SMTP_PASS=your-brevo-smtp-key-here
SMTP_FROM="TravelBridge <noreply@travelbridge.app>"

# Brevo SMS API (optional - for phone verification)
BREVO_API_KEY=your-brevo-api-key-here
BREVO_SENDER_NAME=TravelBridge

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🚀 Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables from `.env.local`
4. Deploy

---

## 📝 License

Open source. Use freely for your project.
