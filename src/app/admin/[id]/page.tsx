'use client';
import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Users, QrCode, ClipboardList, ShieldAlert, Fingerprint, Globe } from 'lucide-react';

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [session, setSession] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [baseUrl, setBaseUrl] = useState('');
  const router = useRouter();

  useEffect(() => {
    const initSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      if (typeof window !== 'undefined') {
        setBaseUrl(window.location.origin);
      }
      fetchSessionDetails();
    };

    initSession();

    const channel = supabase
      .channel(`session-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance_records',
          filter: `session_id=eq.${id}`,
        },
        (payload) => {
          setRecords((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, router]);

  async function fetchSessionDetails() {
    setLoading(true);
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (sessionError) {
      console.error('Error fetching session:', sessionError);
    } else {
      setSession(sessionData);
      
      const { data: recordsData, error: recordsError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('session_id', id)
        .order('created_at', { ascending: false });

      if (recordsError) {
        console.error('Error fetching records:', recordsError);
      } else {
        setRecords(recordsData || []);
      }
    }
    setLoading(false);
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!session) return <div className="p-8 text-center text-red-600 font-bold">Session not found</div>;

  const checkInUrl = `${baseUrl}/check-in/${id}`;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-1 text-blue-600 hover:underline">
            <ChevronLeft className="w-4 h-4" /> Back to Sessions
          </Link>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900">{session.name}</h1>
            <p className="text-gray-500 font-mono text-sm">Session ID: {id}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col items-center">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-500" />
                QR Code for Attendance
              </h2>
              <div className="bg-white p-4 border rounded-lg shadow-inner">
                <QRCodeSVG value={checkInUrl} size={256} />
              </div>
              <div className="mt-6 w-full space-y-4">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-center">
                  <p className="text-sm text-blue-800 font-medium mb-1">SECRET CLASS CODE</p>
                  <p className="text-3xl font-bold tracking-widest text-blue-900">{session.class_code}</p>
                  <p className="text-xs text-blue-600 mt-2 italic">Share this code in class message</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Check-in URL</label>
                  <div className="flex gap-2">
                    <input 
                      readOnly 
                      value={checkInUrl} 
                      className="bg-gray-50 border p-2 rounded text-xs flex-1 truncate font-mono"
                    />
                    <button 
                      onClick={() => navigator.clipboard.writeText(checkInUrl)}
                      className="bg-gray-100 px-3 py-1 rounded text-xs hover:bg-gray-200"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center bg-white">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-green-500" />
                  Attendance Records
                </h2>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <Users className="w-4 h-4" /> {records.length} Present
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Student Name</th>
                      <th className="px-6 py-3 font-semibold flex items-center gap-1">
                        <Globe className="w-3 h-3" /> IP Address
                      </th>
                      <th className="px-6 py-3 font-semibold">
                        <div className="flex items-center gap-1">
                          <Fingerprint className="w-3 h-3" /> Device ID (MAC Proxy)
                        </div>
                      </th>
                      <th className="px-6 py-3 font-semibold">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {records.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                          No check-ins yet. Waiting for students...
                        </td>
                      </tr>
                    ) : (
                      records.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50 transition-colors text-sm">
                          <td className="px-6 py-4 font-medium text-gray-900">{record.student_name}</td>
                          <td className="px-6 py-4 text-gray-500 font-mono text-xs">{record.ip_address}</td>
                          <td className="px-6 py-4 text-gray-500 font-mono text-[10px] truncate max-w-[100px]">
                            {record.device_id}
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {new Date(record.created_at).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
