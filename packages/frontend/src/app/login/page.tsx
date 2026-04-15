'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import { apiFetch } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const tokens = await apiFetch<{ accessToken: string; refreshToken: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      login(tokens);
      router.push('/');
    } catch (err: any) { setError(err.message || 'Login fehlgeschlagen'); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#15495d] via-[#15495d] to-[#1890d7]">
      {/* Linke Seite: Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-[#F5842D] blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-[#1890d7] blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-[#F5842D] flex items-center justify-center font-bold text-2xl text-white shadow-lg">
              SG
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-wider">SOFTGAMES</h2>
              <p className="text-sm text-white/70">Workspace</p>
            </div>
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Next Generation<br/>
            <span className="text-[#F5842D]">Team Collaboration</span>
          </h1>
          <p className="text-xl text-white/80 max-w-lg leading-relaxed">
            Channels, Direct Messages, Video Calls und mehr — alles an einem Ort.
            Schneller, einfacher und sicher.
          </p>
        </div>
        <div className="relative z-10 flex gap-8 text-sm text-white/70">
          <div>
            <div className="text-3xl font-bold text-[#F5842D]">HD</div>
            <div>Video Calls</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#F5842D]">∞</div>
            <div>Channels</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#F5842D]">24/7</div>
            <div>Verfügbar</div>
          </div>
        </div>
      </div>

      {/* Rechte Seite: Login-Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Branding */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#F5842D] flex items-center justify-center font-bold text-lg text-white">
              SG
            </div>
            <h2 className="text-xl font-bold tracking-wider text-white">SOFTGAMES</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-10">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#15495d] mb-2">Willkommen zurück</h1>
              <p className="text-gray-500">Melde dich an, um fortzufahren</p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#15495d] mb-1.5">E-Mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F5842D] focus:border-transparent transition-all"
                  placeholder="deine@email.de"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#15495d] mb-1.5">Passwort</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F5842D] focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F5842D] hover:bg-[#e07520] active:bg-[#cc6918] text-white font-semibold py-3.5 rounded-lg transition-all shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Wird angemeldet...
                  </span>
                ) : 'Anmelden'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Noch kein Konto?{' '}
              <Link href="/register" className="text-[#F5842D] font-medium hover:underline">
                Registrieren
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-white/50 mt-6">
            © {new Date().getFullYear()} SOFTGAMES. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </div>
  );
}
