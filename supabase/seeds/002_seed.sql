-- Seed data for CarryBridge MVP
-- This script adds sample users, trips, and requests for testing

-- NOTE: Auth users must be created via Supabase CLI or Admin API
-- This assumes you've created users and have their IDs

-- Sample EU Trips with Country+City Context
-- Replace these with actual user IDs from your Supabase Auth

INSERT INTO public.trips (
  traveler_id,
  from_city,
  from_country,
  to_city,
  to_country,
  depart_date,
  arrive_date,
  capacity_kg_total,
  capacity_kg_available,
  price_type,
  price_amount,
  rules_text,
  status
) VALUES
-- Trip 1: Berlin (Germany) → Paris (France)
(
  'user-id-1'::uuid,
  'Berlin',
  'Germany',
  'Paris',
  'France',
  CURRENT_DATE + INTERVAL '5 days',
  CURRENT_DATE + INTERVAL '7 days',
  25,
  25,
  'per_kg',
  5.50,
  'Please pack items carefully. Max weight per item: 5kg. No liquids.',
  'published'
),
-- Trip 2: Madrid (Spain) → Lisbon (Portugal)
(
  'user-id-2'::uuid,
  'Madrid',
  'Spain',
  'Lisbon',
  'Portugal',
  CURRENT_DATE + INTERVAL '3 days',
  CURRENT_DATE + INTERVAL '4 days',
  20,
  20,
  'per_kg',
  4.00,
  'Fast trip! Arriving same day. Fragile items welcome.',
  'published'
),
-- Trip 3: Warsaw (Poland) → Prague (Czech Republic)
(
  'user-id-3'::uuid,
  'Warsaw',
  'Poland',
  'Prague',
  'Czech Republic',
  CURRENT_DATE + INTERVAL '8 days',
  CURRENT_DATE + INTERVAL '10 days',
  30,
  30,
  'flat',
  50,
  'Flat €50 for up to 30kg. Reliable truck transport.',
  'published'
),
-- Trip 4: Rome (Italy) → Vienna (Austria)
(
  'user-id-1'::uuid,
  'Rome',
  'Italy',
  'Vienna',
  'Austria',
  CURRENT_DATE + INTERVAL '12 days',
  CURRENT_DATE + INTERVAL '14 days',
  15,
  15,
  'per_kg',
  6.00,
  'Business trip. Can handle urgent deliveries.',
  'published'
),
-- Trip 5: Amsterdam (Netherlands) → Brussels (Belgium)
(
  'user-id-4'::uuid,
  'Amsterdam',
  'Netherlands',
  'Brussels',
  'Belgium',
  CURRENT_DATE + INTERVAL '2 days',
  CURRENT_DATE + INTERVAL '2 days',
  10,
  10,
  'per_kg',
  3.50,
  'Short distance, same day. Perfect for documents.',
  'published'
),
-- Trip 6: Barcelona (Spain) → Milan (Italy)
(
  'user-id-2'::uuid,
  'Barcelona',
  'Spain',
  'Milan',
  'Italy',
  CURRENT_DATE + INTERVAL '6 days',
  CURRENT_DATE + INTERVAL '8 days',
  22,
  22,
  'per_kg',
  5.00,
  'Train journey. Cold storage available.',
  'published'
);

-- Sample Delivery Requests
INSERT INTO public.delivery_requests (
  trip_id,
  sender_id,
  item_title,
  item_category,
  item_description,
  item_weight_kg,
  item_dimensions,
  item_value_eur,
  photos,
  requires_care,
  proposed_price_eur,
  status
) VALUES
-- Request 1: Books for Berlin→Paris trip
(
  (SELECT id FROM public.trips WHERE from_city='Berlin' AND to_city='Paris' LIMIT 1),
  'user-id-5'::uuid,
  'Textbooks (3 copies)',
  'books',
  'University textbooks for German language course',
  8,
  '30x20x15cm',
  120,
  '["https://example.com/book1.jpg"]'::jsonb,
  'none',
  44.00,
  'pending'
),
-- Request 2: Vintage wine for Madrid→Lisbon trip
(
  (SELECT id FROM public.trips WHERE from_city='Madrid' AND to_city='Lisbon' LIMIT 1),
  'user-id-6'::uuid,
  'Spanish Wine (6 bottles)',
  'beverages',
  'Tempranillo wine from La Rioja region',
  3,
  '20x15x20cm',
  150,
  '["https://example.com/wine.jpg"]'::jsonb,
  'fragile',
  12.00,
  'pending'
),
-- Request 3: Computer parts for Warsaw→Prague trip
(
  (SELECT id FROM public.trips WHERE from_city='Warsaw' AND to_city='Prague' LIMIT 1),
  'user-id-7'::uuid,
  'Laptop Components (RAM, SSD)',
  'electronics',
  'Laptop upgrade kit: 16GB RAM + 512GB SSD',
  2,
  '25x10x10cm',
  250,
  '["https://example.com/parts.jpg"]'::jsonb,
  'fragile',
  40.00,
  'pending'
),
-- Request 4: Pastries for Amsterdam→Brussels trip
(
  (SELECT id FROM public.trips WHERE from_city='Amsterdam' AND to_city='Brussels' LIMIT 1),
  'user-id-8'::uuid,
  'Dutch Stroopwafels',
  'food',
  'Fresh stroopwafels from local bakery',
  1.5,
  '15x10x5cm',
  25,
  '["https://example.com/stroopwafels.jpg"]'::jsonb,
  'perishable',
  5.25,
  'pending'
),
-- Request 5: Documents for Rome→Vienna trip
(
  (SELECT id FROM public.trips WHERE from_city='Rome' AND to_city='Vienna' LIMIT 1),
  'user-id-9'::uuid,
  'Important Documents & Certificates',
  'documents',
  'Legal documents and certificates for business registration',
  0.5,
  '30x20x2cm',
  500,
  '["https://example.com/docs.jpg"]'::jsonb,
  'fragile',
  7.50,
  'accepted'
),
-- Request 6: Artwork for Barcelona→Milan trip
(
  (SELECT id FROM public.trips WHERE from_city='Barcelona' AND to_city='Milan' LIMIT 1),
  'user-id-10'::uuid,
  'Small Canvas Painting',
  'art',
  'Original oil painting 40x30cm (unframed)',
  2,
  '45x35x5cm',
  800,
  '["https://example.com/painting.jpg"]'::jsonb,
  'fragile',
  25.00,
  'pending'
);

-- Create sample bookings for accepted requests
-- Get the accepted request ID and create a booking
INSERT INTO public.bookings (
  trip_id,
  delivery_request_id,
  status,
  payment_status,
  pickup_code,
  dropoff_code
) VALUES
(
  (SELECT trip_id FROM public.delivery_requests WHERE item_title='Important Documents & Certificates' LIMIT 1),
  (SELECT id FROM public.delivery_requests WHERE item_title='Important Documents & Certificates' LIMIT 1),
  'awaiting_confirmation',
  'off_platform',
  'ROME-2025-DOC-001',
  'VIENNA-2025-DOC-001'
);

-- Add some sample notifications
INSERT INTO public.notifications (
  user_id,
  type,
  payload
) VALUES
(
  'user-id-1'::uuid,
  'trip_posted',
  '{"trip_id": "uuid", "from": "Berlin, Germany", "to": "Paris, France"}'::jsonb
),
(
  'user-id-5'::uuid,
  'request_submitted',
  '{"request_id": "uuid", "trip": "Berlin, Germany → Paris, France"}'::jsonb
);

-- Optional: Create some sample reviews (after bookings complete)
-- Note: Reviews require both profiles and completed bookings
-- INSERT INTO public.reviews (booking_id, reviewer_id, reviewee_id, rating, text)
-- VALUES (...);

-- End of seed data
-- Note: Adapt user IDs to match your actual Supabase Auth user UUIDs
