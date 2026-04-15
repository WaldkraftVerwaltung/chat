'use client';
import { useAuthStore } from '@/stores/auth.store';
import { useSearchStore } from '@/stores/search.store';
import { useRouter } from 'next/navigation';

export function TopBar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const openSearch = useSearchStore((s) => s.open);

  return (
    <div className="flex items-center h-10 bg-slack-aubergine-dark px-3 gap-2 flex-shrink-0"
      style={{ WebkitAppRegion: 'drag' } as any}>
      {/* Navigation arrows */}
      <div className="flex items-center gap-0.5" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <button onClick={() => router.back()} className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button onClick={() => router.forward()} className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white ml-1" title="Verlauf">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* Search bar — center */}
      <div className="flex-1 flex justify-center" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <button onClick={openSearch}
          className="flex items-center gap-2 w-full max-w-lg bg-white/10 hover:bg-white/15 rounded-md px-3 py-1 text-sm text-white/70 hover:text-white transition-colors">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Softgames Workspace durchsuchen</span>
        </button>
      </div>

    </div>
  );
}
