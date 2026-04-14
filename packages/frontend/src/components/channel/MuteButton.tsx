'use client';
import { useState, useEffect } from 'react';
import { getSocket } from '@/lib/socket';

interface MuteButtonProps {
  conversationId: string;
}

export function MuteButton({ conversationId }: MuteButtonProps) {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Check localStorage for muted state
    const muted = JSON.parse(localStorage.getItem('mutedConversations') || '[]');
    setIsMuted(muted.includes(conversationId));
  }, [conversationId]);

  function toggleMute() {
    const muted: string[] = JSON.parse(localStorage.getItem('mutedConversations') || '[]');
    let updated: string[];
    if (isMuted) {
      updated = muted.filter((id) => id !== conversationId);
    } else {
      updated = [...muted, conversationId];
    }
    localStorage.setItem('mutedConversations', JSON.stringify(updated));
    setIsMuted(!isMuted);
  }

  return (
    <button onClick={toggleMute}
      title={isMuted ? 'Stummschaltung aufheben' : 'Stummschalten'}
      className={`p-2 rounded hover:bg-slack-msg-hover transition-colors ${isMuted ? 'text-slack-red' : 'text-slack-gray-text'}`}>
      {isMuted ? (
        // Bell with slash (muted)
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      ) : (
        // Bell (unmuted)
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )}
    </button>
  );
}
