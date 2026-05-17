'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

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
      <div className="max-w-md w-full liquid-glass p-8 border border-white/10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-widest">Login</h1>
          <p className="text-gray-500 text-[9px] mt-1 font-body tracking-[0.2em] uppercase">Instructor Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[9px] text-gray-500 uppercase tracking-widest px-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 font-body text-xs"
              placeholder="operator@system.io"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-gray-500 uppercase tracking-widest px-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 font-body text-xs"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-red-500 text-[10px] uppercase font-body">
              Error: {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-metallic p-3 text-xs uppercase tracking-widest transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}
