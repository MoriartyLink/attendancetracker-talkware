'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/admin');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="max-w-md w-full liquid-glass p-10 rounded-2xl border border-white/10 shadow-2xl">
        <div className="text-center mb-10">
          <div className="metallic-header w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black metallic-text tracking-tighter uppercase">ACCESS TERMINAL</h1>
          <p className="text-gray-500 text-[10px] mt-2 font-body tracking-[0.3em] uppercase">Instructor Authentication</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 px-1">
              <Mail className="w-3 h-3" /> Identity (Email)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:bg-white/10 focus:border-white/20 outline-none text-white font-body transition-all"
              placeholder="operator@system.io"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 px-1">
              <Lock className="w-3 h-3" /> Security Key
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:bg-white/10 focus:border-white/20 outline-none text-white font-body transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-950/30 text-red-400 p-4 rounded-xl text-xs border border-red-900/50 font-body">
              [SYSTEM ERROR]: {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-metallic text-white p-4 rounded-xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'INITIALIZE SESSION'}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] text-gray-600 leading-relaxed font-body uppercase tracking-wider">
            Restricted Access. Unauthorized entry attempts <br />
            are logged and reported to system security.
          </p>
        </div>
      </div>
    </div>
  );
}
