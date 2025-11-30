-- ===========================================================
-- CarryBridge MINIMAL schema (users + trips only)
-- - Removes: delivery_requests, bookings, reviews, verifications,
--            notifications, flags and their enums
-- - Keeps: profiles, trips
-- ===========================================================

DO $$
BEGIN
  -- -------- Extensions --------
  CREATE EXTENSION IF NOT EXISTS "postgis"  WITH SCHEMA "public";
  CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "public"; -- for gen_random_uuid()

  -- -------- Drop obsolete objects (if they exist) --------
  -- Tables first (to free enum dependencies)
  DROP TABLE IF EXISTS public.flags CASCADE;
  DROP TABLE IF EXISTS public.notifications CASCADE;
  DROP TABLE IF EXISTS public.verifications CASCADE;
  DROP TABLE IF EXISTS public.reviews CASCADE;
  DROP TABLE IF EXISTS public.bookings CASCADE;
  DROP TABLE IF EXISTS public.delivery_requests CASCADE;

  -- Then types you no longer want
  DROP TYPE IF EXISTS public.kyc_status CASCADE;
  DROP TYPE IF EXISTS public.request_status CASCADE;
  DROP TYPE IF EXISTS public.booking_status CASCADE;
  DROP TYPE IF EXISTS public.payment_status CASCADE;
  DROP TYPE IF EXISTS public.item_care CASCADE;
  DROP TYPE IF EXISTS public.verification_status CASCADE;

  -- We'll also rebuild trips below, so drop it to ensure clean shape
  DROP TABLE IF EXISTS public.trips CASCADE;

  -- -------- Minimal enums --------
  CREATE TYPE IF NOT EXISTS public.trip_status AS ENUM ('draft', 'published', 'closed');
  CREATE TYPE IF NOT EXISTS public.carry_type  AS ENUM ('items', 'documents', 'space', 'weight');

  -- -------- Profiles (keep it lean) --------
  -- If you already have profiles, this will no-op. Otherwise it's created fresh.
  CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    avatar_url text,
    bio text,
    home_city text,
    languages text[],
    user_verified boolean DEFAULT false,
    verification_token text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  -- -------- Trips (minimal fields + carry options) --------
  CREATE TABLE public.trips (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    traveler_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Route
    from_city text NOT NULL,
    from_country text NOT NULL,
    from_coords geography(Point, 4326),
    to_city text NOT NULL,
    to_country text NOT NULL,
    to_coords geography(Point, 4326),

    -- Schedule
    depart_date date NOT NULL,
    arrive_date date NOT NULL,

    -- What they want to carry
    carry_types public.carry_type[] NOT NULL DEFAULT ARRAY['items']::public.carry_type[],
    capacity_weight_kg numeric,   -- e.g. up to N kg
    capacity_volume_l  numeric,   -- optional liters/space
    notes text,                   -- free-form rules

    status public.trip_status DEFAULT 'published',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  -- -------- Indexes --------
  CREATE INDEX IF NOT EXISTS idx_trips_traveler_id ON public.trips(traveler_id);
  CREATE INDEX IF NOT EXISTS idx_trips_from_city   ON public.trips(from_city);
  CREATE INDEX IF NOT EXISTS idx_trips_to_city     ON public.trips(to_city);
  CREATE INDEX IF NOT EXISTS idx_trips_depart_date ON public.trips(depart_date);
  CREATE INDEX IF NOT EXISTS idx_trips_status      ON public.trips(status);
  CREATE INDEX IF NOT EXISTS idx_trips_carry_types ON public.trips USING GIN(carry_types);
  CREATE INDEX IF NOT EXISTS idx_trips_from_coords ON public.trips USING GIST(from_coords);
  CREATE INDEX IF NOT EXISTS idx_trips_to_coords   ON public.trips USING GIST(to_coords);

  -- -------- RLS --------
  -- Profiles: public can read; user can insert/update their own row
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  -- Drop old policies if they exist (avoid duplicates)
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles';
  IF FOUND THEN
    -- Clean slate (optional; safe because we recreate right after)
    -- Note: DROP POLICY IF EXISTS requires explicit names
    DROP POLICY IF EXISTS "Users can read all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
    DROP POLICY IF EXISTS profiles_read_all   ON public.profiles;
    DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
    DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
  END IF;

  CREATE POLICY profiles_read_all   ON public.profiles FOR SELECT USING (true);
  CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (auth.uid() = id);

  -- Trips: public can read published; owners can CRUD
  ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
  CREATE POLICY trips_read_public_or_owner ON public.trips
    FOR SELECT USING (status = 'published' OR auth.uid() = traveler_id);
  CREATE POLICY trips_insert_own ON public.trips
    FOR INSERT WITH CHECK (auth.uid() = traveler_id);
  CREATE POLICY trips_update_own ON public.trips
    FOR UPDATE USING (auth.uid() = traveler_id);
  CREATE POLICY trips_delete_own ON public.trips
    FOR DELETE USING (auth.uid() = traveler_id);

  -- -------- Auto-create profile on auth signup --------
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO public.profiles (id, name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email))
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

END $$;
