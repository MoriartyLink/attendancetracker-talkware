'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { nanoid } from 'nanoid';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle, List, Clock, CheckCircle, XCircle, LogOut, Trash2 } from 'lucide-react';

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

    const { error } = await supabase
      .from('sessions')
      .insert([{ name: sessionName, class_code: code, is_active: true }])
      .select();

    if (error) {
      alert('Error: ' + error.message);
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

  async function deleteSession(id: string) {
    if (!confirm('TERMINATE_PROTOCOL: Are you sure you want to permanently delete this session and all associated signals?')) return;
    
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Deletion_Error: ' + error.message);
    } else {
      fetchSessions();
    }
  }

  return (
    <div className="min-h-screen bg-black p-8 text-xs font-body">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex justify-between items-center border-b border-white/10 pb-6">
          <h1 className="text-xl font-bold tracking-widest uppercase">Dashboard</h1>
          <div className="flex gap-4 items-center">
            {user && <span className="text-gray-600 hidden md:inline">{user.email}</span>}
            <button 
              onClick={handleLogout}
              className="text-gray-500 hover:text-white uppercase tracking-widest transition-colors font-bold"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="liquid-glass p-6 mb-10 border border-white/10">
          <h2 className="text-[10px] font-bold mb-6 uppercase tracking-widest text-white flex items-center gap-2">
            <PlusCircle className="w-3 h-3" /> New Session
          </h2>
          <form onSubmit={createSession} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Session Name"
              className="p-3 bg-black border border-white/10 text-white focus:border-white/30 outline-none"
              required
            />
            <input
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              placeholder="Class Code (Optional)"
              className="p-3 bg-black border border-white/10 text-white focus:border-white/30 outline-none"
            />
            <button
              type="submit"
              disabled={creating}
              className="btn-metallic p-3 uppercase tracking-widest font-bold"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </form>
        </section>

        <section>
          <h2 className="text-[10px] font-bold mb-6 uppercase tracking-widest text-gray-500 flex items-center gap-2">
            <List className="w-3 h-3" /> Sessions
          </h2>
          {loading ? (
            <div className="text-gray-700 animate-pulse font-bold">Syncing...</div>
          ) : sessions.length === 0 ? (
            <div className="p-12 text-center text-gray-600 border border-white/5 uppercase tracking-widest">No sessions found.</div>
          ) : (
            <div className="grid gap-3">
              {sessions.map((session) => (
                <div key={session.id} className="liquid-glass p-5 flex items-center justify-between border border-white/10 hover:border-white/20 transition-all">
                  <div>
                    <h3 className="font-bold uppercase tracking-tight text-white">{session.name}</h3>
                    <p className="text-[9px] text-gray-600 mt-1 uppercase tracking-widest font-bold">
                      Code: <span className="text-gray-400">{session.class_code}</span> | 
                      Created: {new Date(session.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => toggleSession(session.id, session.is_active)}
                      className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${
                        session.is_active ? 'text-green-900 hover:text-green-500' : 'text-red-900 hover:text-red-500'
                      }`}
                    >
                      {session.is_active ? 'Active' : 'Closed'}
                    </button>
                    <Link
                      href={`/admin/${session.id}`}
                      className="text-white hover:text-gray-400 uppercase tracking-widest font-bold"
                    >
                      View
                    </Link>
                    <button 
                      onClick={() => deleteSession(session.id)}
                      className="text-red-900 hover:text-red-600 transition-colors p-1"
                      title="Delete Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
