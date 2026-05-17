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
      if (typeof window !== 'undefined') setBaseUrl(window.location.origin);
      fetchSessionDetails();
    };

    initSession();

    const channel = supabase.channel(`session-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance_records', filter: `session_id=eq.${id}` }, 
        (payload) => setRecords((prev) => [payload.new, ...prev]))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, router]);

  async function fetchSessionDetails() {
    setLoading(true);
    const { data: sessionData } = await supabase.from('sessions').select('*').eq('id', id).single();
    if (sessionData) {
      setSession(sessionData);
      const { data: recordsData } = await supabase.from('attendance_records').select('*').eq('session_id', id).order('created_at', { ascending: false });
      setRecords(recordsData || []);
    }
    setLoading(false);
  }

  async function deleteSession() {
    if (!confirm('TERMINATE_PROTOCOL: Are you sure you want to permanently delete this session and all captured signal data?')) return;
    const { error } = await supabase.from('sessions').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else router.push('/admin');
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-gray-500 font-body uppercase text-[9px] tracking-widest">Syncing...</div>;
  if (!session) return <div className="min-h-screen bg-black flex items-center justify-center text-red-900 font-bold uppercase text-[9px]">Offline</div>;

  const checkInUrl = `${baseUrl}/check-in/${id}`;
  const zoomOnlyUrl = `${checkInUrl}?v=zoom`;

  return (
    <div className="min-h-screen bg-black p-6 text-xs font-body">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex gap-6 items-center">
            <Link href="/admin" className="text-[9px] uppercase tracking-widest text-gray-500 hover:text-white font-bold flex items-center gap-1">
              <ChevronLeft className="w-3 h-3" /> Back
            </Link>
            <button 
              onClick={deleteSession}
              className="text-[9px] uppercase tracking-widest text-red-900 hover:text-red-500 font-bold"
            >
              Delete_Session
            </button>
          </div>
          <h1 className="text-lg font-bold uppercase tracking-widest">{session.name}</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-black border border-white/10 p-8 flex flex-col items-center shadow-2xl">
              <div className="bg-white p-4 mb-8 rounded shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <QRCodeSVG value={checkInUrl} size={200} bgColor="transparent" fgColor="#000000" />
              </div>
              <p className="text-4xl font-black tracking-[0.3em] text-white mb-2">{session.class_code}</p>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-10">Access Key</p>
              
              <div className="w-full space-y-4">
                <button 
                  onClick={() => navigator.clipboard.writeText(checkInUrl)}
                  className="w-full btn-metallic p-4 text-[9px] uppercase tracking-widest font-bold"
                >
                  Copy Standard Link
                </button>
                <button 
                  onClick={() => navigator.clipboard.writeText(zoomOnlyUrl)}
                  className="w-full bg-white text-black p-4 text-[9px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                >
                  Copy Zoom-Only Link
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-black border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" /> Signal Logs
                </h2>
                <div className="text-[9px] font-bold text-white uppercase tracking-widest px-3 py-1 bg-white/5 border border-white/10 rounded">
                  {records.length} Verified
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-[8px] uppercase tracking-widest text-gray-500 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-5">Name</th>
                      <th className="px-6 py-5">Origin_IP</th>
                      <th className="px-6 py-5">Hardware_Hash</th>
                      <th className="px-6 py-5">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[10px]">
                    {records.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-20 text-center text-gray-700 uppercase tracking-widest font-bold">Listening for signals...</td></tr>
                    ) : (
                      records.map((record) => (
                        <tr key={record.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-5 font-bold text-gray-200 uppercase tracking-wider">{record.student_name}</td>
                          <td className="px-6 py-5 text-gray-600 font-mono">{record.ip_address}</td>
                          <td className="px-6 py-5">
                            <div className="text-gray-700 font-mono text-[7px] truncate max-w-[120px] uppercase" title={record.device_id}>
                              {record.device_id}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-gray-600">{new Date(record.created_at).toLocaleTimeString()}</td>
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
