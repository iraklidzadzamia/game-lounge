-- 1. Add branch_id column to stations table
ALTER TABLE stations 
ADD COLUMN branch_id TEXT DEFAULT 'chikovani';

-- 2. Update existing stations to belong to 'chikovani' branch (safeguard)
UPDATE stations 
SET branch_id = 'chikovani' 
WHERE branch_id IS NULL;

-- 3. (Optional) Create an index for faster queries
CREATE INDEX idx_stations_branch_id ON stations(branch_id);

-- 4. Add branch_id to bookings table as well (good practice for analytics/integrity)
ALTER TABLE bookings
ADD COLUMN branch_id TEXT;

-- 5. Update past bookings based on station association (assuming stations are static)
-- This might be complex if stations move, but for now we assume stations stay in one branch.
UPDATE bookings
SET branch_id = stations.branch_id
FROM stations
WHERE bookings.station_id = stations.id;
