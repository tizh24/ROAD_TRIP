-- Trip core table
CREATE TABLE trip_schema.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.user_profiles(id), -- Prevent hard delete of user if they own trips
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'PLANNING', -- PLANNING, ONGOING, COMPLETED, DELETED (Soft delete)
    budget NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip members
CREATE TABLE trip_schema.trip_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trip_schema.trips(id), -- No cascade hard delete
    user_id UUID NOT NULL REFERENCES public.user_profiles(id),
    role TEXT DEFAULT 'MEMBER', -- OWNER, ADMIN, MEMBER
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, LEFT, REMOVED (Soft delete)
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trip_id, user_id)
);

-- Trip days
CREATE TABLE trip_schema.trip_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trip_schema.trips(id) ON DELETE CASCADE, -- Internal to trip, hard delete cascade is okay if DB Admin forces trip delete
    date DATE NOT NULL,
    day_index INT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip stops
CREATE TABLE trip_schema.trip_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trip_schema.trips(id) ON DELETE CASCADE,
    day_id UUID REFERENCES trip_schema.trip_days(id) ON DELETE CASCADE,
    place_id TEXT NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    lat NUMERIC(10, 7) NOT NULL,
    lng NUMERIC(10, 7) NOT NULL,
    stop_index INT NOT NULL,
    arrival_time TIMESTAMPTZ,
    departure_time TIMESTAMPTZ,
    notes TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for trip tables
ALTER TABLE trip_schema.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_schema.trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_schema.trip_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_schema.trip_stops ENABLE ROW LEVEL SECURITY;
