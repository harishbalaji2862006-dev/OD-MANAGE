-- College OD & Attendance Manager Database Schema
-- Run this in your Supabase SQL Editor to setup the tables and RLS policies

-- 1. Create USERS table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    register_number TEXT,
    department TEXT,
    semester INTEGER DEFAULT 1,
    section TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Create ATTENDANCE table
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    attended_classes INTEGER NOT NULL DEFAULT 0,
    total_classes INTEGER NOT NULL DEFAULT 0,
    attendance_percentage NUMERIC NOT NULL DEFAULT 100.0,
    last_updated TIMESTAMPTZ DEFAULT now(),
    -- Prevent duplicate subjects per student
    UNIQUE (user_id, subject)
);

-- Enable RLS for attendance
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- 3. Create OD_RECORDS table
CREATE TABLE IF NOT EXISTS public.od_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    subject TEXT NOT NULL,
    reason TEXT NOT NULL,
    faculty TEXT NOT NULL,
    event TEXT NOT NULL,
    proof_url TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for od_records
ALTER TABLE public.od_records ENABLE ROW LEVEL SECURITY;

-- 4. Create SYNC_LOGS table
CREATE TABLE IF NOT EXISTS public.sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    sync_time TIMESTAMPTZ DEFAULT now(),
    status TEXT NOT NULL CHECK (status IN ('Success', 'Failure')),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for sync_logs
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;


-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

-- Users Policies
CREATE POLICY "Users can view their own profile" 
    ON public.users FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.users FOR UPDATE 
    USING (auth.uid() = id);

-- Attendance Policies
CREATE POLICY "Users can view their own attendance" 
    ON public.attendance FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attendance" 
    ON public.attendance FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attendance" 
    ON public.attendance FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own attendance" 
    ON public.attendance FOR DELETE 
    USING (auth.uid() = user_id);

-- OD Records Policies
CREATE POLICY "Users can view their own OD records" 
    ON public.od_records FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own OD records" 
    ON public.od_records FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own OD records" 
    ON public.od_records FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own OD records" 
    ON public.od_records FOR DELETE 
    USING (auth.uid() = user_id);

-- Sync Logs Policies
CREATE POLICY "Users can view their own sync logs" 
    ON public.sync_logs FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync logs" 
    ON public.sync_logs FOR INSERT 
    WITH CHECK (auth.uid() = user_id);


-- ========================================================
-- AUTOMATIC HANDLERS / TRIGGERS
-- ========================================================

-- Automatically create profile in public.users on user signup in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email, register_number, department, semester, section)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'name', 'Student'),
        new.email,
        new.raw_user_meta_data->>'register_number',
        new.raw_user_meta_data->>'department',
        COALESCE((new.raw_user_meta_data->>'semester')::integer, 1),
        new.raw_user_meta_data->>'section'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to recalculate attendance percentage on insert/update
CREATE OR REPLACE FUNCTION public.recalculate_attendance_percentage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.total_classes = 0 THEN
        NEW.attendance_percentage := 100.0;
    ELSE
        NEW.attendance_percentage := ROUND((NEW.attended_classes::numeric / NEW.total_classes::numeric) * 100, 2);
    END IF;
    NEW.last_updated := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_attendance_change
    BEFORE INSERT OR UPDATE ON public.attendance
    FOR EACH ROW EXECUTE FUNCTION public.recalculate_attendance_percentage();
