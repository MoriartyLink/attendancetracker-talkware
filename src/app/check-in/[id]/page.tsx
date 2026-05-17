'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { submitAttendanceAction } from '@/app/actions';
import { nanoid } from 'nanoid';
import { User, Key, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function CheckInPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [session, setSession] = useState<any>(null);
  const [studentName, setStudentName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchSession();
    // Ensure device ID exists
    if (typeof window !== 'undefined' && !localStorage.getItem('attendance_device_id')) {
      localStorage.setItem('attendance_device_id', nanoid());
    }
  }, [id]);

  async function fetchSession() {
    const { data, error } = await supabase
      .from('sessions')
      .select('name, is_active')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching session:', error);
    } else {
      setSession(data);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    
    const deviceId = typeof window !== 'undefined' ? localStorage.getItem('attendance_device_id') || '' : '';
    
    try {
      const response = await submitAttendanceAction(id, studentName, classCode, deviceId);
      setResult(response);
    } catch (err) {
      setResult({ success: false, message: 'An unexpected error occurred.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session || !session.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Inactive</h1>
          <p className="text-gray-600">
            This attendance session has ended or does not exist. Please contact your instructor.
          </p>
        </div>
      </div>
    );
  }

  if (result?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border text-center animate-in fade-in zoom-in duration-300">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Attendance Recorded!</h1>
          <p className="text-gray-600 mb-6">
            Thank you, <span className="font-semibold text-gray-900">{studentName}</span>. Your attendance for <span className="font-semibold text-gray-900">{session.name}</span> has been successfully submitted.
          </p>
          <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg">
            You can now close this window.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{session.name}</h1>
          <p className="text-gray-500">Enter your details to check-in</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
              <User className="w-4 h-4" /> Your Full Name
            </label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="John Doe"
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
              <Key className="w-4 h-4" /> Secret Class Code
            </label>
            <input
              type="text"
              required
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              placeholder="Enter the code from class"
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase tracking-widest text-center font-bold"
            />
          </div>

          {result && !result.success && (
            <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl flex items-start gap-2 text-sm animate-pulse">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{result.message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            {submitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Recording...</>
            ) : (
              'Submit Attendance'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-400">
          Anti-cheating measures active. IP and Device ID recorded.
        </p>
      </div>
    </div>
  );
}
