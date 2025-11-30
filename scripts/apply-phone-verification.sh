#!/bin/bash

# Script to apply phone verification migration to Supabase database
# Usage: ./scripts/apply-phone-verification.sh

echo "🔧 Applying phone verification migration..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your Supabase credentials"
    exit 1
fi

# Source environment variables
source .env.local

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Required environment variables not set!"
    echo "Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are in .env.local"
    exit 1
fi

# Extract project ref from URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's/https:\/\/\(.*\)\.supabase\.co/\1/')

echo "📊 Project: $PROJECT_REF"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. Installing via npm..."
    npm install -g supabase
fi

# Run migration
echo "🚀 Running migration 003_add_phone_verification.sql..."
echo ""

# Read and execute the SQL file
psql "$DATABASE_URL" < supabase/migrations/003_add_phone_verification.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration applied successfully!"
    echo ""
    echo "📋 The following columns were added to profiles table:"
    echo "   - phone (text)"
    echo "   - phone_verified (boolean)"
    echo "   - phone_verification_code (text)"
    echo "   - phone_verification_expires_at (timestamptz)"
    echo ""
else
    echo ""
    echo "❌ Migration failed!"
    echo "Please check the error messages above and try again."
    echo ""
    echo "💡 Alternative: You can also run the SQL directly in Supabase SQL Editor:"
    echo "   1. Go to https://app.supabase.com/project/$PROJECT_REF/sql"
    echo "   2. Copy the contents of supabase/migrations/003_add_phone_verification.sql"
    echo "   3. Paste and run the SQL"
    exit 1
fi

