# Database Scripts

This folder contains various utility scripts for database management and seeding.

## Seed Trips Script

The `seed-trips.ts` script populates your database with **12 dummy trips** that are always current and future-dated.

### Features:
- ✅ **12 diverse international routes** (India-Germany, UK-France, Japan-Korea, etc.)
- ✅ **Auto-dated** - All trips have departure dates 2-15 days in the future
- ✅ **Auto-cleanup** - Removes trips with past departure dates
- ✅ **Realistic data** - Includes capacity, notes, and travel companion messaging
- ✅ **Multiple carry types** - items, documents, space, weight

### Setup:

1. **Ensure your `.env.local` has the service role key:**
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

2. **Run the seed script:**
   ```bash
   npm run seed-trips
   ```

### What it does:

1. Fetches existing user profiles (or creates a demo user if none exist)
2. Deletes trips with past departure dates
3. Inserts 12 new trips with future dates (2-15 days from now)
4. Assigns trips to random existing users

### Sample Routes:
- 🇮🇳 New Delhi → 🇩🇪 Berlin
- 🇬🇧 London → 🇫🇷 Paris
- 🇩🇪 Munich → 🇮🇹 Rome
- 🇮🇳 Mumbai → 🇬🇧 London
- 🇪🇸 Madrid → 🇵🇹 Lisbon
- 🇳🇱 Amsterdam → 🇩🇪 Berlin
- 🇮🇳 Bengaluru → 🇨🇳 Shanghai
- 🇫🇷 Paris → 🇨🇭 Geneva
- 🇯🇵 Tokyo → 🇰🇷 Seoul
- 🇮🇳 Chennai → 🇳🇵 Kathmandu
- 🇩🇪 Frankfurt → 🇳🇱 Amsterdam
- 🇸🇪 Stockholm → 🇫🇮 Helsinki

### Automated Refresh (Optional):

To keep trips always fresh, you can:

1. **Manual refresh:** Run `npm run seed-trips` whenever you want fresh data
2. **Cron job (Production):** Set up a daily cron job to run the script
3. **Vercel Cron (Recommended):** Use Vercel's cron jobs to trigger an API endpoint daily

Example Vercel cron setup:
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/seed-trips",
    "schedule": "0 0 * * *"
  }]
}
```

### Notes:
- Trips are always 2-15 days in the future
- Past trips are automatically cleaned up
- Each trip is assigned to a random existing user
- All trips include traveler assistance messaging

---

## Phone Verification Migration

The `apply-phone-verification.sh` script applies the phone verification database migration.

### What it adds:
- ✅ **Phone number field** for user profiles
- ✅ **Phone verification system** with 6-digit codes
- ✅ **Verification expiration** (10 minutes)
- ✅ **Database indexes** for efficient lookups

### Setup:

1. **Make sure you have database access:**
   Check your `.env.local` file has valid Supabase credentials

2. **Run the migration script:**
   ```bash
   ./scripts/apply-phone-verification.sh
   ```

   Or manually apply via Supabase SQL Editor:
   1. Go to https://app.supabase.com → Your Project → SQL Editor
   2. Copy contents of `supabase/migrations/003_add_phone_verification.sql`
   3. Run the SQL

### What it does:

1. Adds the following columns to `profiles` table:
   - `phone` (text) - Phone number with country code
   - `phone_verified` (boolean) - Verification status
   - `phone_verification_code` (text) - 6-digit verification code
   - `phone_verification_expires_at` (timestamptz) - Code expiration

2. Creates database indexes for efficient queries
3. Adds documentation comments

### After Migration:

Users can now:
- Add/update phone numbers in their profile
- Verify phone numbers with 6-digit codes
- See verification status badge
- Receive time-limited verification codes (10 min expiry)

See **PROFILE_EDIT_GUIDE.md** in the root directory for full documentation.

---

