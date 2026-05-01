-- LostLink Database Schema
-- Applied to Supabase project: biljsanhifmkrmskobxr (ap-south-1)
-- Run this in Supabase SQL editor if needed to reset

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (mirrors Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items table
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
  location TEXT NOT NULL,
  date DATE NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'claimed', 'resolved')),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Claims table
CREATE TABLE public.claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  claimant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR Codes table
CREATE TABLE public.qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL UNIQUE REFERENCES public.items(id) ON DELETE CASCADE,
  qr_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('match_found', 'claim_request', 'claim_accepted', 'claim_rejected', 'general')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches table
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lost_item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  found_item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  score FLOAT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
