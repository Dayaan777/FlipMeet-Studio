-- FlipMeet Studio Database Schema
-- Run this in Supabase SQL Editor to set up tables and RLS policies.

-- 1. Profiles Table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null,
  phone text,
  shipping_address text,
  size_preference text default 'L',
  role text default 'customer' check (role in ('customer', 'admin')),
  notify_drop boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Orders Table
create table if not exists public.orders (
  id text primary key,
  customer_id text not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address text not null,
  drop_id text not null default 'drop-001',
  items jsonb not null default '[]'::jsonb,
  total numeric not null default 0,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled')),
  delivery_window jsonb default '{"start": "2026-10-20", "end": "2026-10-30"}'::jsonb,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.orders enable row level security;

-- Profiles Policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Orders Policies
create policy "Customers can view own orders"
  on public.orders for select
  using (customer_email = auth.jwt()->>'email' or customer_id = auth.uid()::text);

create policy "Admins can view all orders"
  on public.orders for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can update orders"
  on public.orders for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
