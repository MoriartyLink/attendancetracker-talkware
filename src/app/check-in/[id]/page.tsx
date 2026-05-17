'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { submitAttendanceAction } from '@/app/actions';
import { nanoid } from 'nanoid';
import { Loader2 } from 'lucide-react';

export default function CheckInPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [session, setSession] = useState<any>(null);
  const [studentName, setStudentName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [accessBlocked, setAccessBlocked] = useState(false);

  useEffect(() => {
    const checkSource = () => {
      if (typeof window === 'undefined') return;
      
      const searchParams = new URLSearchParams(window.location.search);
      const isZoomLink = searchParams.get('v') === 'zoom';
      const referrer = document.referrer.toLowerCase();
      
      if (isZoomLink) {
        // If it's a zoom link, we MUST verify it's from zoom
        if (!referrer.includes('zoom.us')) {
          setAccessBlocked(true);
          setLoading(false);
          return false;
        }
      }
      return true;
    };

    if (checkSource()) {
      fetchSession();
    }
    
    if (typeof window !== 'undefined' && !localStorage.getItem('attendance_device_id')) {
      localStorage.setItem('attendance_device_id', nanoid());
    }
  }, [id]);

  async function fetchSession() {
    const { data } = await supabase.from('sessions').select('name, is_active').eq('id', id).single();
    if (data) setSession(data);
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
      setResult({ success: false, message: 'Error' });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-700" /></div>;

  if (accessBlocked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full liquid-glass p-12 border border-red-900/30 text-center">
          <h1 className="text-xl font-bold uppercase tracking-widest text-red-900 mb-6">Access Restricted</h1>
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] leading-loose">
            This secure link can only be accessed <br />
            directly from the Zoom chat message.
          </p>
          <div className="mt-10 pt-8 border-t border-white/5">
            <p className="text-[8px] text-gray-800 uppercase tracking-widest">Platform mismatch detected.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session || !session.is_active) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full liquid-glass p-10 border border-red-900/20 text-center">
          <h1 className="text-xl font-bold uppercase tracking-widest text-red-900 mb-2">Inactive</h1>
          <p className="text-[10px] text-gray-600 uppercase tracking-widest">Portal closed.</p>
        </div>
      </div>
    );
  }

  if (result?.success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full liquid-glass p-10 border border-white/10 text-center">
          <h1 className="text-xl font-bold uppercase tracking-widest mb-4">Logged</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-8">Registered: {studentName}</p>
          <div className="text-[9px] text-gray-700 uppercase tracking-widest">Signal Transmitted</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-body">
      <div className="max-w-md w-full liquid-glass p-8 border border-white/10">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold uppercase tracking-widest">{session.name}</h1>
          <p className="text-gray-500 text-[9px] mt-1 uppercase tracking-widest">Verification</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[9px] text-gray-500 uppercase tracking-widest px-1">Name</label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full p-3 text-xs uppercase"
              placeholder="Full Name"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-gray-500 uppercase tracking-widest px-1">Code</label>
            <input
              type="text"
              required
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              className="w-full p-3 text-xs uppercase text-center font-bold tracking-widest"
              placeholder="6-Digit"
            />
          </div>

          {result && !result.success && (
            <div className="text-red-900 text-[9px] uppercase tracking-widest text-center">{result.message}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-metallic p-3 text-xs uppercase tracking-widest"
          >
            {submitting ? '...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}
