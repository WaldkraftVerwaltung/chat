'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChannelList } from './ChannelList';
import { DmList } from './DmList';
import { NavRail, NavView } from './NavRail';
import { ActivityView } from './ActivityView';
import { ThreadsView } from './ThreadsView';
import { SavedView } from './SavedView';
import { useAuthStore } from '@/stores/auth.store';
import { apiFetch } from '@/lib/api';
import { useSearchStore } from '@/stores/search.store';
import { ProfileMenu } from './ProfileMenu';
import { CreateChannelDialog } from '@/components/channel/CreateChannelDialog';

type FilterMode = 'all' | 'active' | 'az';

function WorkspaceMenu({ onClose }: { onClose: () => void }) {
  const [filterMode, setFilterMode] = useState<FilterMode>('active');
  const [showFilterSub, setShowFilterSub] = useState(false);

  const filterLabels: Record<FilterMode, string> = {
    all: 'Alle',
    active: 'Nur aktiv',
    az: 'A–Z',
  };

  return (
    <div
      className="absolute left-2 top-full mt-1 z-50 w-56 rounded-md shadow-lg bg-white border border-gray-200 py-1 text-sm text-gray-800"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Filtern und sortieren */}
      <div
        className="relative"
        onMouseEnter={() => setShowFilterSub(true)}
        onMouseLeave={() => setShowFilterSub(false)}
      >
        <button className="flex items-center justify-between w-full px-3 py-2 hover:bg-gray-100 text-left">
          <span>Filtern und sortieren</span>
          <span className="text-gray-400 ml-2">›</span>
        </button>
        {showFilterSub && (
          <div className="absolute left-full top-0 w-44 rounded-md shadow-lg bg-white border border-gray-200 py-1">
            {(['active', 'az', 'all'] as FilterMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => { setFilterMode(mode); onClose(); }}
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-left"
              >
                {filterMode === mode && <span className="text-slack-active">✓</span>}
                {filterMode !== mode && <span className="w-4" />}
                {filterLabels[mode]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ordner erstellen */}
      <button
        onClick={onClose}
        className="flex items-center w-full px-3 py-2 hover:bg-gray-100 text-left"
      >
        Ordner erstellen
      </button>

      <div className="border-t border-gray-100 my-1" />

      {/* Kurze Tipps */}
      <div className="px-3 py-1 text-xs text-gray-400 font-semibold uppercase tracking-wide">Kurze Tipps</div>
      <div className="px-3 py-1.5 text-xs text-gray-500">
        Halte Kanäle uebersichtlich mit Abschnitten und Filtern.
      </div>

      <div className="border-t border-gray-100 my-1" />

      {/* Standardauswahl bearbeiten */}
      <button
        onClick={onClose}
        className="flex items-center w-full px-3 py-2 hover:bg-gray-100 text-left"
      >
        Standardauswahl bearbeiten
      </button>
    </div>
  );
}

interface SidebarProps {
  sidebarWidth?: number;
}

export function Sidebar({ sidebarWidth = 208 }: SidebarProps) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [activeView, setActiveView] = useState<NavView>('home');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showCreateDm, setShowCreateDm] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('Waldkraft');

  useEffect(() => {
    apiFetch<{ name: string }>('/workspace')
      .then((ws) => { if (ws?.name) setWorkspaceName(ws.name); })
      .catch(() => {});
  }, []);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!showWorkspaceMenu) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowWorkspaceMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showWorkspaceMenu]);

  function renderContent() {
    switch (activeView) {
      case 'activity':
        return <ActivityView />;
      case 'threads':
        return <ThreadsView />;
      case 'later':
        return <SavedView />;
      case 'dms':
        return (
          <nav className="flex-1 overflow-y-auto py-2">
            <DmList />
          </nav>
        );
      case 'channels':
        return (
          <nav className="flex-1 overflow-y-auto py-2">
            <ChannelList showSortToggle />
          </nav>
        );
      case 'more':
        return (
          <nav className="flex-1 overflow-y-auto py-2">
            <div className="px-3 py-2">
              <h2 className="text-sm font-semibold text-slack-text-bright mb-2">Mehr</h2>
              <div className="space-y-1">
                <Link
                  href="/directory"
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slack-text hover:bg-slack-aubergine-light hover:text-slack-text-bright transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Personen
                </Link>
                <Link
                  href="/files"
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slack-text hover:bg-slack-aubergine-light hover:text-slack-text-bright transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  Dateien
                </Link>
                {user?.role && ['primary_owner', 'owner', 'admin'].includes(user.role) && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slack-text hover:bg-slack-aubergine-light hover:text-slack-text-bright transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Administration
                  </Link>
                )}
              </div>
            </div>
          </nav>
        );
      default:
        // home view — Slack-style layout
        return (
          <>
            {/* Workspace header with menu */}
            <div className="relative px-3 py-2" ref={menuRef}>
              <div className="flex items-center justify-between">
                <button
                  className="flex items-center gap-1 text-slack-text-bright font-bold text-base truncate max-w-[120px] hover:text-white"
                  onClick={() => setShowWorkspaceMenu((v) => !v)}
                >
                  {workspaceName}
                  <span className="text-xs text-slack-text">▾</span>
                </button>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Three-dot menu */}
                  <button
                    title="Workspace-Optionen"
                    onClick={() => setShowWorkspaceMenu((v) => !v)}
                    className="p-1 rounded hover:bg-white/10 text-slack-text"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="5" cy="12" r="1.5" />
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="19" cy="12" r="1.5" />
                    </svg>
                  </button>
                  {/* Compose */}
                  <button
                    title="Neue Nachricht"
                    onClick={() => setShowCreateChannel(true)}
                    className="p-1 rounded hover:bg-white/10 text-slack-text"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
              {showWorkspaceMenu && (
                <WorkspaceMenu onClose={() => setShowWorkspaceMenu(false)} />
              )}
            </div>

            {/* Quick nav sections */}
            <div className="px-1 py-1 space-y-0.5">
              <button onClick={() => router.push('/unread')} className="flex items-center gap-2 w-full rounded px-3 py-1.5 text-sm text-slack-text hover:bg-slack-aubergine-light hover:text-white transition-colors">
                <span>🔵</span> Ungelesen
              </button>
              <button onClick={() => router.push('/threads')} className="flex items-center gap-2 w-full rounded px-3 py-1.5 text-sm text-slack-text hover:bg-slack-aubergine-light hover:text-white transition-colors">
                <span>🧵</span> Threads
              </button>
              <button onClick={() => router.push('/huddles')} className="flex items-center gap-2 w-full rounded px-3 py-1.5 text-sm text-slack-text hover:bg-slack-aubergine-light hover:text-white transition-colors">
                <span>🎧</span> Huddles
              </button>
              <button onClick={() => router.push('/drafts')} className="flex items-center gap-2 w-full rounded px-3 py-1.5 text-sm text-slack-text hover:bg-slack-aubergine-light hover:text-white transition-colors">
                <span>▷</span> Entwuerfe &amp; Gesendet
              </button>
              <button onClick={() => router.push('/directory')} className="flex items-center gap-2 w-full rounded px-3 py-1.5 text-sm text-slack-text hover:bg-slack-aubergine-light hover:text-white transition-colors">
                <span>📖</span> Verzeichnisse
              </button>
              <button onClick={() => router.push('/files')} className="flex items-center gap-2 w-full rounded px-3 py-1.5 text-sm text-slack-text hover:bg-slack-aubergine-light hover:text-white transition-colors">
                <span>📁</span> Dateien
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 my-1" />

            {/* Channels + DMs */}
            <nav className="flex-1 overflow-y-auto py-2">
              <ChannelList />
              <DmList />
              {user?.role && ['primary_owner', 'owner', 'admin'].includes(user.role) && (
                <div className="px-3 pt-2 pb-1">
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slack-text hover:bg-slack-aubergine-light hover:text-slack-text-bright transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Administration
                  </Link>
                </div>
              )}
            </nav>
          </>
        );
    }
  }

  return (
    <aside className="flex h-full">
      <NavRail
        activeView={activeView}
        onViewChange={setActiveView}
        onCompose={() => setShowCreateChannel(true)}
        onCreateChannel={() => setShowCreateChannel(true)}
        onCreateDm={() => { setActiveView('dms'); setShowCreateDm(true); }}
        sidebarCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />
      <div className="flex h-full flex-col bg-slack-aubergine overflow-hidden transition-all duration-200" style={{ width: sidebarCollapsed ? 0 : sidebarWidth }}>
        {/* Header — shown for all views except home (home renders its own workspace header) */}
        {activeView !== 'home' && (
          <div className="flex items-center gap-2 border-b border-slack-aubergine-light px-3 py-3">
            <span className="font-semibold text-slack-text-bright flex-1 truncate">
              {activeView === 'dms' && 'Direktnachrichten'}
              {activeView === 'channels' && 'Kanäle'}
              {activeView === 'activity' && 'Aktivität'}
              {activeView === 'threads' && 'Threads'}
              {activeView === 'later' && 'Später'}
              {activeView === 'more' && 'Mehr'}
            </span>
          </div>
        )}

        {/* Dynamic content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {renderContent()}
        </div>

        {/* Profile always at bottom */}
        <div className="border-t border-slack-aubergine-light">
          <ProfileMenu />
        </div>
      </div>
      <CreateChannelDialog isOpen={showCreateChannel} onClose={() => setShowCreateChannel(false)} />
    </aside>
  );
}
