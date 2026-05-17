'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { nanoid } from 'nanoid';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle, List, Clock, CheckCircle, XCircle, LogOut } from 'lucide-react';

export default function AdminPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionName, setSessionName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
    } else {
      setUser(user);
      fetchSessions();
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  async function fetchSessions() {
    setLoading(true);
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
    } else {
      setSessions(data || []);
    }
    setLoading(false);
  }

  async function createSession(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionName) return;

    setCreating(true);
    const code = classCode || nanoid(6).toUpperCase();

    const { data, error } = await supabase
      .from('sessions')
      .insert([
        { 
          name: sessionName, 
          class_code: code,
          is_active: true 
        }
      ])
      .select();

    if (error) {
      alert('Error creating session: ' + error.message);
    } else {
      setSessionName('');
      setClassCode('');
      fetchSessions();
    }
    setCreating(false);
  }

  async function toggleSession(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('sessions')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      alert('Error updating session');
    } else {
      fetchSessions();
    }
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 flex justify-between items-center liquid-glass p-6 rounded-2xl border border-white/10">
          <div>
            <h1 className="text-3xl font-black metallic-text uppercase tracking-tighter">CONTROL CENTER</h1>
            {user && <p className="text-[10px] text-gray-500 font-body uppercase tracking-[0.2em] mt-1">{user.email}</p>}
          </div>
          <div className="flex gap-6 items-center">
            <Link href="/" className="text-gray-500 hover:text-white text-[10px] uppercase tracking-widest transition-colors font-body">Root</Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-950/20 border border-red-900/30 px-4 py-2 rounded-lg text-[10px] font-black text-red-500 hover:bg-red-900/40 transition-all uppercase tracking-widest"
            >
              <LogOut className="w-3 h-3" /> Terminate
            </button>
          </div>
        </header>

        <section className="liquid-glass rounded-2xl border border-white/10 p-8 mb-12 shadow-2xl">
          <h2 className="text-lg font-black mb-6 flex items-center gap-3 uppercase tracking-wider metallic-text">
            <PlusCircle className="w-5 h-5 text-blue-400" />
            Initialize New Session
          </h2>
          <form onSubmit={createSession} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Session ID/Name</label>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="e.g. ALPHA-STRIKE"
                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:bg-white/10 focus:border-white/20 outline-none text-white font-body transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Override Code</label>
              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                placeholder="Auto-Gen"
                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:bg-white/10 focus:border-white/20 outline-none text-white font-body transition-all"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={creating}
                className="w-full btn-metallic text-white p-3 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all"
              >
                {creating ? 'DEPLOYING...' : 'START DEPLOYMENT'}
              </button>
            </div>
          </form>
        </section>

        <section>
          <h2 className="text-lg font-black mb-6 flex items-center gap-3 uppercase tracking-wider metallic-text">
            <List className="w-5 h-5 text-gray-400" />
            Active Deployments
          </h2>
          {loading ? (
            <div className="flex items-center gap-3 text-gray-500 font-body text-sm animate-pulse">
              <Clock className="w-4 h-4 animate-spin" /> SYNCHRONIZING DATA...
            </div>
          ) : sessions.length === 0 ? (
            <div className="liquid-glass rounded-2xl border border-white/5 p-16 text-center text-gray-600 font-body uppercase tracking-[0.2em] text-xs">
              No active deployments found.
            </div>
          ) : (
            <div className="grid gap-6">
              {sessions.map((session) => (
                <div key={session.id} className="liquid-glass rounded-2xl border border-white/10 p-6 flex items-center justify-between hover:border-white/20 transition-all group">
                  <div>
                    <h3 className="text-lg font-black tracking-tight uppercase group-hover:metallic-text transition-all">{session.name}</h3>
                    <div className="flex items-center gap-6 text-[10px] text-gray-500 mt-2 font-body uppercase tracking-widest">
                      <span className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-gray-600" />
                        {new Date(session.created_at).toLocaleDateString()}
                      </span>
                      <span className="bg-white/5 px-2 py-1 rounded-lg border border-white/5 font-mono text-xs text-gray-400">
                        KEY: {session.class_code}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleSession(session.id, session.is_active)}
                      className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${
                        session.is_active 
                          ? 'bg-green-950/20 border-green-900/30 text-green-500 hover:bg-green-900/40' 
                          : 'bg-red-950/20 border-red-900/30 text-red-500 hover:bg-red-900/40'
                      }`}
                    >
                      {session.is_active ? (
                        <><CheckCircle className="w-3 h-3" /> Online</>
                      ) : (
                        <><XCircle className="w-3 h-3" /> Offline</>
                      )}
                    </button>
                    <Link
                      href={`/admin/${session.id}`}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105"
                    >
                      Interface
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
