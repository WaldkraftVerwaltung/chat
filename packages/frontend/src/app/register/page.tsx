'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/auth.store';
import { apiFetch } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const tokens = await apiFetch<{ accessToken: string; refreshToken: string }>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, displayName }) });
      login(tokens);
      router.push('/');
    } catch (err: any) { setError(err.message || 'Registrierung fehlgeschlagen'); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-center">Registrieren</h1>
        {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Anzeigename" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          <Input label="E-Mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Passwort" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Wird registriert...' : 'Registrieren'}</Button>
        </form>
        <p className="text-center text-sm text-gray-600">Bereits ein Konto?{' '}<Link href="/login" className="text-slack-blue hover:underline">Anmelden</Link></p>
      </div>
    </div>
  );
}
