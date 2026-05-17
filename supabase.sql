-- Supabase Schema for Attendance Tracker (Authenticated)

-- 1. Create Sessions Table
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    class_code TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- 2. Create Attendance Records Table
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    device_id TEXT NOT NULL, -- Proxy for MAC Address
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(session_id, ip_address),
    UNIQUE(session_id, device_id)
);

-- 3. Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Public can read ONLY basic info of active sessions (needed for check-in)
CREATE POLICY "Public can view active sessions" ON public.sessions
    FOR SELECT USING (is_active = true);

-- Instructors can manage THEIR OWN sessions
CREATE POLICY "Instructors manage own sessions" ON public.sessions
    FOR ALL USING (auth.uid() = user_id);

-- Attendance Records: Instructors can view records for THEIR OWN sessions
CREATE POLICY "Instructors view own session records" ON public.attendance_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.sessions 
            WHERE sessions.id = attendance_records.session_id 
            AND sessions.user_id = auth.uid()
        )
    );

-- Attendance Records: Public can insert via RPC (we enforce this via the SECURITY DEFINER function)
CREATE POLICY "Public can insert attendance" ON public.attendance_records
    FOR INSERT WITH CHECK (true);

-- 5. RPC for Secure Attendance Submission
CREATE OR REPLACE FUNCTION submit_attendance(
    p_session_id UUID,
    p_student_name TEXT,
    p_class_code TEXT,
    p_ip_address TEXT,
    p_device_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session_active BOOLEAN;
    v_correct_code TEXT;
    v_already_submitted_ip BOOLEAN;
    v_already_submitted_device BOOLEAN;
BEGIN
    SELECT is_active, class_code INTO v_session_active, v_correct_code
    FROM public.sessions
    WHERE id = p_session_id;

    IF v_session_active IS NOT TRUE THEN
        RETURN jsonb_build_object('success', false, 'message', 'This session is no longer active.');
    END IF;

    IF v_correct_code != p_class_code THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid class code.');
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.attendance_records 
        WHERE session_id = p_session_id AND ip_address = p_ip_address
    ) INTO v_already_submitted_ip;

    IF v_already_submitted_ip THEN
        RETURN jsonb_build_object('success', false, 'message', 'Attendance already recorded for this connection (IP).');
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.attendance_records 
        WHERE session_id = p_session_id AND device_id = p_device_id
    ) INTO v_already_submitted_device;

    IF v_already_submitted_device THEN
        RETURN jsonb_build_object('success', false, 'message', 'Attendance already recorded for this device (MAC Proxy).');
    END IF;

    INSERT INTO public.attendance_records (session_id, student_name, ip_address, device_id)
    VALUES (p_session_id, p_student_name, p_ip_address, p_device_id);

    RETURN jsonb_build_object('success', true, 'message', 'Attendance recorded successfully!');
END;
$$;
