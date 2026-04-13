'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChannelList } from './ChannelList';
import { DmList } from './DmList';
import { NavRail, NavView } from './NavRail';
import { ActivityView } from './ActivityView';
import { ThreadsView } from './ThreadsView';
import { SavedView } from './SavedView';
import { useAuthStore } from '@/stores/auth.store';
import { useSearchStore } from '@/stores/search.store';
import { ProfileMenu } from './ProfileMenu';
import { CreateChannelDialog } from '@/components/channel/CreateChannelDialog';

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const [activeView, setActiveView] = useState<NavView>('home');
  const [showCreateChannel, setShowCreateChannel] = useState(false);

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
                  href="/admin"
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slack-text hover:bg-slack-aubergine-light hover:text-slack-text-bright transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Personen
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
        // home view
        return (
          <>
            <div className="px-3 py-2 border-b border-slack-aubergine-light">
              <button
                onClick={() => useSearchStore.getState().open()}
                className="flex w-full items-center gap-2 rounded-md bg-slack-aubergine-light border border-slack-hover px-3 py-1.5 text-sm text-slack-text hover:bg-slack-hover hover:text-slack-text-bright transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="flex-1 text-left">Suchen</span>
                <kbd className="rounded border border-slack-hover bg-slack-hover px-1.5 py-0.5 text-xs text-slack-text">⌘K</kbd>
              </button>
            </div>
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
    <aside className="flex h-screen">
      <NavRail
        activeView={activeView}
        onViewChange={setActiveView}
        onCompose={() => setShowCreateChannel(true)}
      />
      <div className="flex h-full w-52 flex-col bg-slack-aubergine">
        {/* Header — always visible */}
        <div className="flex items-center gap-2 border-b border-slack-aubergine-light px-3 py-3">
          <span className="font-semibold text-slack-text-bright flex-1 truncate">
            {activeView === 'home' && 'Chat'}
            {activeView === 'dms' && 'Direktnachrichten'}
            {activeView === 'channels' && 'Kanäle'}
            {activeView === 'activity' && 'Aktivität'}
            {activeView === 'threads' && 'Threads'}
            {activeView === 'later' && 'Später'}
            {activeView === 'more' && 'Mehr'}
          </span>
        </div>

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
