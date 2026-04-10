-- TerraShield Supabase Schema Migration
-- Replaces SQLite with PostgreSQL + PostGIS for Vercel deployment

-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ════════════════════════════════════════════════════════════════════════════
-- EXIF DATA TABLE
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS exif_data (
    -- Primary key
    id                      BIGSERIAL PRIMARY KEY,

    -- Identity
    user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    filename                TEXT NOT NULL,
    mime_type               TEXT NOT NULL,
    file_size_bytes         BIGINT,

    -- GPS / Location (PostGIS geometry for spatial queries)
    latitude                DOUBLE PRECISION,
    longitude               DOUBLE PRECISION,
    altitude                DOUBLE PRECISION,
    latitude_ref            TEXT,
    longitude_ref           TEXT,
    maps_url                TEXT,
    location                GEOGRAPHY(POINT, 4326), -- PostGIS point for spatial indexing

    -- Camera / Device
    make                    TEXT,
    model                   TEXT,
    software                TEXT,
    date_time               TIMESTAMPTZ,
    exposure_time           TEXT,
    f_number                DOUBLE PRECISION,
    iso                     INTEGER,
    focal_length            DOUBLE PRECISION,
    flash                   TEXT,

    -- Image Properties
    image_width             INTEGER,
    image_height            INTEGER,
    orientation             INTEGER,
    color_space             TEXT,

    -- Image Storage (Supabase Storage path instead of BLOB)
    image_storage_path      TEXT, -- e.g. "reports/user-id/filename.jpg"

    -- AI Analysis Fields
    ai_label                TEXT,
    ai_confidence           DOUBLE PRECISION CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
    ai_tags                 JSONB, -- Native JSON array instead of TEXT
    ai_summary              TEXT,
    ai_risk_score           DOUBLE PRECISION CHECK (ai_risk_score >= 0 AND ai_risk_score <= 10),
    ai_analysed_at          TIMESTAMPTZ,

    -- Raw Payload
    all_tags_json           JSONB NOT NULL DEFAULT '{}'::jsonb,
    satellite_context_json  JSONB,

    -- Reverse Geocoding
    district                TEXT,
    state                   TEXT,
    country                 TEXT,

    -- Audit
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_exif_data_user_id ON exif_data(user_id);
CREATE INDEX IF NOT EXISTS idx_exif_data_ai_label ON exif_data(ai_label);
CREATE INDEX IF NOT EXISTS idx_exif_data_created_at ON exif_data(created_at);
CREATE INDEX IF NOT EXISTS idx_exif_data_ai_analysed_at ON exif_data(ai_analysed_at);
CREATE INDEX IF NOT EXISTS idx_exif_data_district ON exif_data(district);

-- Spatial index for geospatial queries
CREATE INDEX IF NOT EXISTS idx_exif_data_location ON exif_data USING GIST(location);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_exif_data_updated_at
    BEFORE UPDATE ON exif_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-populate PostGIS location from lat/lng
CREATE OR REPLACE FUNCTION update_location_from_coords()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    ELSE
        NEW.location = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_exif_data_location
    BEFORE INSERT OR UPDATE OF latitude, longitude ON exif_data
    FOR EACH ROW
    EXECUTE FUNCTION update_location_from_coords();

-- ════════════════════════════════════════════════════════════════════════════
-- USERS METADATA TABLE
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS users_meta (
    id                      BIGSERIAL PRIMARY KEY,
    user_id                 UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email                   TEXT,
    name                    TEXT,
    gender                  TEXT,
    phone                   TEXT,
    avatar_url              TEXT,
    terra_points            INTEGER NOT NULL DEFAULT 0,
    reports_count           INTEGER NOT NULL DEFAULT 0,
    verified_reports        INTEGER NOT NULL DEFAULT 0,
    role                    TEXT NOT NULL DEFAULT 'user',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_meta_user_id ON users_meta(user_id);

-- ════════════════════════════════════════════════════════════════════════════
-- POINTS HISTORY TABLE
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS points_history (
    id                      BIGSERIAL PRIMARY KEY,
    user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount                  INTEGER NOT NULL,
    reason                  TEXT NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_created_at ON points_history(created_at);

-- ════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ════════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE exif_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;

-- EXIF DATA policies
CREATE POLICY "Users can view their own reports"
    ON exif_data FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports"
    ON exif_data FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
    ON exif_data FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
    ON exif_data FOR DELETE
    USING (auth.uid() = user_id);

-- Public read for analysed reports (for map display)
CREATE POLICY "Public can view analysed reports"
    ON exif_data FOR SELECT
    USING (ai_analysed_at IS NOT NULL);

-- USERS META policies
CREATE POLICY "Users can view their own profile"
    ON users_meta FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON users_meta FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all user profiles"
    ON users_meta FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- POINTS HISTORY policies
CREATE POLICY "Users can view their own points history"
    ON points_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage points"
    ON points_history FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ════════════════════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- ════════════════════════════════════════════════════════════════════════════

-- Create storage bucket for report images
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-images', 'report-images', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for report images
CREATE POLICY "Users can upload their own images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'report-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own images"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'report-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Public can view analysed report images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'report-images');

-- ════════════════════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ════════════════════════════════════════════════════════════════════════════

-- Function to auto-create user_meta on first auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users_meta (user_id, email, terra_points)
    VALUES (NEW.id, NEW.email, 50);
    
    INSERT INTO points_history (user_id, amount, reason)
    VALUES (NEW.id, 50, 'Welcome to TerraShield');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
