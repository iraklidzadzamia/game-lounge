-- Seed stations for Dinamo branch
-- IDs are prefixed with 'dinamo-'

-- First, clean up any partial or existing Dinamo data
DELETE FROM bookings WHERE station_id IN (SELECT id FROM stations WHERE branch_id = 'dinamo');
DELETE FROM stations WHERE branch_id = 'dinamo';

INSERT INTO stations (id, name, type, branch_id, floor) VALUES
('dinamo-vip-1', 'VIP 1', 'VIP', 'dinamo', 1),
('dinamo-vip-2', 'VIP 2', 'VIP', 'dinamo', 1);

-- Floor 2
INSERT INTO stations (id, name, type, branch_id, floor) VALUES
('dinamo-pc-2-l-1', 'PC 1', 'PREMIUM', 'dinamo', 2),
('dinamo-pc-2-l-2', 'PC 2', 'PREMIUM', 'dinamo', 2),
('dinamo-pc-2-l-3', 'PC 3', 'PREMIUM', 'dinamo', 2),
('dinamo-pc-2-l-4', 'PC 4', 'PREMIUM', 'dinamo', 2),
('dinamo-pc-2-l-5', 'PC 5', 'PREMIUM', 'dinamo', 2),

('dinamo-pc-2-c-1', 'PC 6', 'PRO', 'dinamo', 2),
('dinamo-pc-2-c-2', 'PC 7', 'PRO', 'dinamo', 2),
('dinamo-pc-2-c-3', 'PC 8', 'PRO', 'dinamo', 2),
('dinamo-pc-2-c-4', 'PC 9', 'PRO', 'dinamo', 2),
('dinamo-pc-2-c-5', 'PC 10', 'PRO', 'dinamo', 2),

('dinamo-pc-2-r-1', 'PC 11', 'PRO', 'dinamo', 2),
('dinamo-pc-2-r-2', 'PC 12', 'PRO', 'dinamo', 2),
('dinamo-pc-2-r-3', 'PC 13', 'PRO', 'dinamo', 2),
('dinamo-pc-2-r-4', 'PC 14', 'PRO', 'dinamo', 2),
('dinamo-pc-2-r-5', 'PC 15', 'PRO', 'dinamo', 2),
('dinamo-pc-2-r-6', 'PC 16', 'PRO', 'dinamo', 2);

-- Floor 3
INSERT INTO stations (id, name, type, branch_id, floor) VALUES
('dinamo-pc-3-l-1', 'PC 1', 'PREMIUM', 'dinamo', 3),
('dinamo-pc-3-l-2', 'PC 2', 'PREMIUM', 'dinamo', 3),
('dinamo-pc-3-l-3', 'PC 3', 'PREMIUM', 'dinamo', 3),
('dinamo-pc-3-l-4', 'PC 4', 'PREMIUM', 'dinamo', 3),
('dinamo-pc-3-l-5', 'PC 5', 'PREMIUM', 'dinamo', 3),

('dinamo-pc-3-c-1', 'PC 6', 'PRO', 'dinamo', 3),
('dinamo-pc-3-c-2', 'PC 7', 'PRO', 'dinamo', 3),
('dinamo-pc-3-c-3', 'PC 8', 'PRO', 'dinamo', 3),
('dinamo-pc-3-c-4', 'PC 9', 'PRO', 'dinamo', 3),
('dinamo-pc-3-c-5', 'PC 10', 'PRO', 'dinamo', 3),

('dinamo-pc-3-r-1', 'PC 11', 'PRO', 'dinamo', 3),
('dinamo-pc-3-r-2', 'PC 12', 'PRO', 'dinamo', 3),
('dinamo-pc-3-r-3', 'PC 13', 'PRO', 'dinamo', 3),
('dinamo-pc-3-r-4', 'PC 14', 'PRO', 'dinamo', 3),
('dinamo-pc-3-r-5', 'PC 15', 'PRO', 'dinamo', 3),
('dinamo-pc-3-r-6', 'PC 16', 'PRO', 'dinamo', 3);
