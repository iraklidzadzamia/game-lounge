-- 1. Create Tables
create table stations (
  id text primary key,
  name text not null,
  type text not null, -- 'PREMIUM', 'PRO', 'VIP'
  floor integer not null,
  zone text, -- 'A', 'B', 'C'
  status text default 'ACTIVE'
);

create table bookings (
  id uuid default gen_random_uuid() primary key,
  station_id text references stations(id) not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  total_price integer,
  status text default 'CONFIRMED', -- 'CONFIRMED', 'CANCELLED'
  created_at timestamptz default now()
);

-- 2. Enable Security (RLS)
alter table stations enable row level security;
alter table bookings enable row level security;

-- 3. Allow Public Access (Simpler for now)
create policy "Public read stations" on stations for select using (true);
create policy "Public read bookings" on bookings for select using (true);
create policy "Public insert bookings" on bookings for insert with check (true);
create policy "Public update bookings" on bookings for update using (true);

-- 4. Seed Data (Stations)

-- FLOOR 1 (VIP)
insert into stations (id, name, type, floor) values
('vip-1', 'VIP ROOM 1', 'VIP', 1),
('vip-2', 'VIP ROOM 2', 'VIP', 1);

-- FLOOR 2 (PCs)
-- Zone A (Left) - Premium
insert into stations (id, name, type, floor, zone) values
('pc-2-l-1', 'PC 1', 'PREMIUM', 2, 'A'),
('pc-2-l-2', 'PC 2', 'PREMIUM', 2, 'A'),
('pc-2-l-3', 'PC 3', 'PREMIUM', 2, 'A'),
('pc-2-l-4', 'PC 4', 'PREMIUM', 2, 'A'),
('pc-2-l-5', 'PC 5', 'PREMIUM', 2, 'A');

-- Zone B (Center) - Pro
insert into stations (id, name, type, floor, zone) values
('pc-2-c-1', 'PC 6', 'PRO', 2, 'B'),
('pc-2-c-2', 'PC 7', 'PRO', 2, 'B'),
('pc-2-c-3', 'PC 8', 'PRO', 2, 'B'),
('pc-2-c-4', 'PC 9', 'PRO', 2, 'B'),
('pc-2-c-5', 'PC 10', 'PRO', 2, 'B');

-- Zone C (Right) - Pro (6 PCs)
insert into stations (id, name, type, floor, zone) values
('pc-2-r-1', 'PC 11', 'PRO', 2, 'C'),
('pc-2-r-2', 'PC 12', 'PRO', 2, 'C'),
('pc-2-r-3', 'PC 13', 'PRO', 2, 'C'),
('pc-2-r-4', 'PC 14', 'PRO', 2, 'C'),
('pc-2-r-5', 'PC 15', 'PRO', 2, 'C'),
('pc-2-r-6', 'PC 16', 'PRO', 2, 'C');


-- FLOOR 3 (PCs)
-- Zone A (Left) - Premium
insert into stations (id, name, type, floor, zone) values
('pc-3-l-1', 'PC 1', 'PREMIUM', 3, 'A'),
('pc-3-l-2', 'PC 2', 'PREMIUM', 3, 'A'),
('pc-3-l-3', 'PC 3', 'PREMIUM', 3, 'A'),
('pc-3-l-4', 'PC 4', 'PREMIUM', 3, 'A'),
('pc-3-l-5', 'PC 5', 'PREMIUM', 3, 'A');

-- Zone B (Center) - Pro
insert into stations (id, name, type, floor, zone) values
('pc-3-c-1', 'PC 6', 'PRO', 3, 'B'),
('pc-3-c-2', 'PC 7', 'PRO', 3, 'B'),
('pc-3-c-3', 'PC 8', 'PRO', 3, 'B'),
('pc-3-c-4', 'PC 9', 'PRO', 3, 'B'),
('pc-3-c-5', 'PC 10', 'PRO', 3, 'B');

-- Zone C (Right) - Pro (6 PCs)
insert into stations (id, name, type, floor, zone) values
('pc-3-r-1', 'PC 11', 'PRO', 3, 'C'),
('pc-3-r-2', 'PC 12', 'PRO', 3, 'C'),
('pc-3-r-3', 'PC 13', 'PRO', 3, 'C'),
('pc-3-r-4', 'PC 14', 'PRO', 3, 'C'),
('pc-3-r-5', 'PC 15', 'PRO', 3, 'C'),
('pc-3-r-6', 'PC 16', 'PRO', 3, 'C');
