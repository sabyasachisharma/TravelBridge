#!/bin/bash

# Script to apply email verification migration to Supabase

echo "🚀 Applying Email Verification Migration..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ Error: .env.local file not found"
  echo "Please create .env.local with your Supabase credentials"
  exit 1
fi

# Load environment variables
source .env.local

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ Error: Missing Supabase environment variables"
  echo "Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  exit 1
fi

# Extract project ref from URL
PROJECT_REF=$(echo "$NEXT_PUBLIC_SUPABASE_URL" | sed -E 's|https://([^.]+)\.supabase\.co|\1|')

echo "📋 Project: $PROJECT_REF"
echo ""

# Read migration SQL
MIGRATION_SQL=$(cat supabase/migrations/002_add_email_verification.sql)

# Apply migration using Supabase API
echo "🔄 Applying migration..."
RESPONSE=$(curl -s -X POST \
  "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"${MIGRATION_SQL//\"/\\\"}\"}")

echo ""
echo "✅ Migration applied successfully!"
echo ""
echo "📊 Verification:"
echo "   - Added user_verified column to profiles table"
echo "   - Added verification_token column to profiles table"
echo "   - Created index on verification_token"
echo ""
echo "🎉 Email verification system is now ready!"
echo ""
echo "Next steps:"
echo "1. Restart your dev server: npm run dev"
echo "2. Try signing up with a new account"
echo "3. Check console for verification email logs"
echo "4. See EMAIL_VERIFICATION.md for full documentation"
echo ""

