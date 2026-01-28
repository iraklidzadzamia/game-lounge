-- Reset Simon Chikovani stations to match new configuration
-- First, DELETE bookings associated with these stations to avoid Foreign Key errors
DELETE FROM bookings WHERE station_id IN (SELECT id FROM stations WHERE branch_id = 'chikovani');

-- Then, remove existing Chikovani stations
DELETE FROM stations WHERE branch_id = 'chikovani';

-- 1. PS5 (6 units) - Floor 1 (Lounge/Grid)
INSERT INTO stations (id, name, type, branch_id, floor) VALUES
('chikovani-ps5-1', 'PS5 1', 'PS5', 'chikovani', 1),
('chikovani-ps5-2', 'PS5 2', 'PS5', 'chikovani', 1),
('chikovani-ps5-3', 'PS5 3', 'PS5', 'chikovani', 1),
('chikovani-ps5-4', 'PS5 4', 'PS5', 'chikovani', 1),
('chikovani-ps5-5', 'PS5 5', 'PS5', 'chikovani', 1),
('chikovani-ps5-6', 'PS5 6', 'PS5', 'chikovani', 1);

-- 2. VIP Rooms (2 units) - Floor 1
INSERT INTO stations (id, name, type, branch_id, floor) VALUES
('chikovani-vip-1', 'VIP 1', 'VIP', 'chikovani', 1),
('chikovani-vip-2', 'VIP 2', 'VIP', 'chikovani', 1);

-- 3. Premium PCs (5 units) - Floor 2
INSERT INTO stations (id, name, type, branch_id, floor) VALUES
('chikovani-prem-1', 'Premium 1', 'PREMIUM', 'chikovani', 2),
('chikovani-prem-2', 'Premium 2', 'PREMIUM', 'chikovani', 2),
('chikovani-prem-3', 'Premium 3', 'PREMIUM', 'chikovani', 2),
('chikovani-prem-4', 'Premium 4', 'PREMIUM', 'chikovani', 2),
('chikovani-prem-5', 'Premium 5', 'PREMIUM', 'chikovani', 2);

-- 4. Pro PCs (7 units) - Floor 2
INSERT INTO stations (id, name, type, branch_id, floor) VALUES
('chikovani-pro-1', 'Pro 1', 'PRO', 'chikovani', 2),
('chikovani-pro-2', 'Pro 2', 'PRO', 'chikovani', 2),
('chikovani-pro-3', 'Pro 3', 'PRO', 'chikovani', 2),
('chikovani-pro-4', 'Pro 4', 'PRO', 'chikovani', 2),
('chikovani-pro-5', 'Pro 5', 'PRO', 'chikovani', 2),
('chikovani-pro-6', 'Pro 6', 'PRO', 'chikovani', 2),
('chikovani-pro-7', 'Pro 7', 'PRO', 'chikovani', 2);

-- 5. Standard PCs (10 units) - Floor 2
INSERT INTO stations (id, name, type, branch_id, floor) VALUES
('chikovani-std-1', 'Standard 1', 'STANDARD', 'chikovani', 2),
('chikovani-std-2', 'Standard 2', 'STANDARD', 'chikovani', 2),
('chikovani-std-3', 'Standard 3', 'STANDARD', 'chikovani', 2),
('chikovani-std-4', 'Standard 4', 'STANDARD', 'chikovani', 2),
('chikovani-std-5', 'Standard 5', 'STANDARD', 'chikovani', 2),
('chikovani-std-6', 'Standard 6', 'STANDARD', 'chikovani', 2),
('chikovani-std-7', 'Standard 7', 'STANDARD', 'chikovani', 2),
('chikovani-std-8', 'Standard 8', 'STANDARD', 'chikovani', 2),
('chikovani-std-9', 'Standard 9', 'STANDARD', 'chikovani', 2),
('chikovani-std-10', 'Standard 10', 'STANDARD', 'chikovani', 2);

-- 6. Premium X PCs (4 units) - Floor 2
INSERT INTO stations (id, name, type, branch_id, floor) VALUES
('chikovani-premx-1', 'Premium X 1', 'PREMIUM_X', 'chikovani', 2),
('chikovani-premx-2', 'Premium X 2', 'PREMIUM_X', 'chikovani', 2),
('chikovani-premx-3', 'Premium X 3', 'PREMIUM_X', 'chikovani', 2),
('chikovani-premx-4', 'Premium X 4', 'PREMIUM_X', 'chikovani', 2);
