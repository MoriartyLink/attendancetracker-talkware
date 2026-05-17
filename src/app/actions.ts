'use server';

import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase';

export async function submitAttendanceAction(
  sessionId: string,
  studentName: string,
  classCode: string,
  deviceId: string
) {
  const headerList = await headers();
  // Get IP from common proxy headers
  const forwardedFor = headerList.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';

  const { data, error } = await supabase.rpc('submit_attendance', {
    p_session_id: sessionId,
    p_student_name: studentName,
    p_class_code: classCode,
    p_ip_address: ip,
    p_device_id: deviceId,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return data;
}
