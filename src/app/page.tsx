import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-xl">
        <h1 className="text-4xl font-bold mb-2 tracking-tight">
          ATTENDANCE TRACKER
        </h1>
        
        <p className="text-sm text-gray-500 mb-12 uppercase tracking-widest font-body">
          Secure / Real-Time / Minimal
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <Link 
            href="/login" 
            className="p-6 liquid-glass border border-white/10 hover:border-white/30 transition-all group"
          >
            <h2 className="text-lg font-bold mb-1 uppercase text-white">Instructor</h2>
            <p className="text-xs text-gray-500 font-body">Manage sessions and view logs.</p>
          </Link>

          <div className="p-6 liquid-glass border border-white/5 opacity-50">
            <h2 className="text-lg font-bold mb-1 uppercase text-gray-600">Student</h2>
            <p className="text-xs text-gray-600 font-body">Scan QR to check-in.</p>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/5 text-[9px] text-gray-700 uppercase tracking-widest font-body">
          <p>© 2026 TALKWARE</p>
        </div>
      </div>
    </div>
  );
}
