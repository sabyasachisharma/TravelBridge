-- Add contact preference fields to trips table
-- Allows travelers to choose whether to show email, phone, or both

ALTER TABLE public.trips 
ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT false;

-- Update existing trips to show email by default
UPDATE public.trips 
SET show_email = true, show_phone = false 
WHERE show_email IS NULL OR show_phone IS NULL;

