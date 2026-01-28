-- Migration: Admin Features
-- Description: Adds profiles table and updates bookings with admin fields

-- 1. Create Profiles Table (Links to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('owner', 'admin')),
  branch_access text not null default 'all', -- 'all', 'dinamo', 'chikovani'
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone" 
  on profiles for select 
  using ( true ); -- Or restrict to authenticated users if stricter privacy needed

create policy "Users can insert their own profile" 
  on profiles for insert 
  with check ( auth.uid() = id );

create policy "Users can update own profile" 
  on profiles for update 
  using ( auth.uid() = id );

-- 2. Update Bookings Table
alter table public.bookings 
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists payment_status text check (payment_status in ('paid', 'unpaid')) default 'unpaid',
  add column if not exists payment_method text check (payment_method in ('cash', 'card_bog', 'card_tbc')),
  add column if not exists notes text;

-- 3. Update RLS for Bookings
-- Remove existing policies if they conflict, or add new ones.
-- Existing: "Public read bookings" -> Keep (Everyone needs to see busy slots)
-- Existing: "Public insert bookings" -> Keep (Public booking)

-- New: Admin Policies
create policy "Admins can update any booking"
  on bookings for update
  using ( 
    exists (
      select 1 from profiles 
      where profiles.id = auth.uid() 
      and (profiles.role = 'owner' or profiles.branch_access = 'all' or profiles.branch_access = (select branch_id from stations where stations.id = bookings.station_id))
    )
  );

create policy "Admins can delete any booking"
  on bookings for delete
  using ( 
    exists (
      select 1 from profiles 
      where profiles.id = auth.uid() 
      and (profiles.role = 'owner' or profiles.branch_access = 'all' or profiles.branch_access = (select branch_id from stations where stations.id = bookings.station_id))
    )
  );

create policy "Admins can insert bookings with bypass properties"
  on bookings for insert
  with check (
    -- Allow normal public insert OR admin insert
    true 
  );
