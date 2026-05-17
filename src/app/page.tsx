import Link from 'next/link';
import { ShieldCheck, QrCode, ClipboardCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl">
        <div className="flex justify-center mb-6">
          <div className="metallic-header p-5 rounded-2xl shadow-2xl">
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <h1 className="text-5xl font-black mb-4 tracking-tighter metallic-text">
          ATTENDANCE TRACKER <span className="text-gray-400">PRO</span>
        </h1>
        
        <p className="text-xl text-gray-400 mb-12 leading-relaxed font-body uppercase tracking-widest">
          Secure, Anti-Cheat, Real-Time Management.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <Link 
            href="/login" 
            className="group p-8 liquid-glass rounded-2xl hover:bg-white/10 transition-all border border-white/10"
          >
            <div className="bg-white/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2 tracking-wide uppercase">For Instructors</h2>
            <p className="text-sm text-gray-400 font-body">Create sessions, share QR codes, and view real-time attendance analytics.</p>
          </Link>

          <div className="p-8 liquid-glass rounded-2xl border border-white/5 opacity-80">
            <div className="bg-white/5 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <ClipboardCheck className="w-8 h-8 text-gray-500" />
            </div>
            <h2 className="text-xl font-bold mb-2 tracking-wide uppercase text-gray-500">For Students</h2>
            <p className="text-sm text-gray-600 font-body">Scan the secure QR code shared by your instructor to authenticate and check-in.</p>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-gray-600 uppercase tracking-widest font-body">
          <p>© 2026 Attendance Tracker / TALKWARE SYSTEMS</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </div>
  );
}
