'use client';
import { useState, useRef, useEffect } from 'react';

interface DmHeaderMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onShowDetails: () => void;
  onShowProfile: () => void;
  onToggleStar: () => void;
  onSearch: () => void;
  isStarred: boolean;
}

export function DmHeaderMenu({ isOpen, onClose, onShowDetails, onShowProfile, onToggleStar, onSearch, isStarred }: DmHeaderMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={ref} className="absolute right-0 top-full mt-1 w-72 rounded-lg bg-white shadow-2xl border border-gray-200 py-1 z-50">
      <button onClick={() => { onShowDetails(); onClose(); }}
        className="w-full px-4 py-2 text-sm text-left text-gray-900 hover:bg-gray-50">
        Unterhaltungsdetails öffnen
      </button>
      <button onClick={() => { onShowProfile(); onClose(); }}
        className="w-full px-4 py-2 text-sm text-left text-gray-900 hover:bg-gray-50">
        Vollständiges Profil anzeigen
      </button>

      <div className="border-t border-gray-100 my-1" />

      <button onClick={() => { onToggleStar(); onClose(); }}
        className="w-full px-4 py-2 text-sm text-left text-gray-900 hover:bg-gray-50">
        {isStarred ? 'Stern entfernen' : 'Unterhaltung mit einem Stern markieren'}
      </button>

      <div className="border-t border-gray-100 my-1" />

      <button className="w-full px-4 py-2 text-sm text-left text-gray-500 hover:bg-gray-50 flex items-center gap-2">
        Kopieren
        <span className="text-gray-400 ml-auto">›</span>
      </button>
      <button onClick={() => { onSearch(); onClose(); }}
        className="w-full px-4 py-2 text-sm text-left text-gray-900 hover:bg-gray-50">
        In Unterhaltung suchen
      </button>

      <div className="border-t border-gray-100 my-1" />

      <button className="w-full px-4 py-2 text-sm text-left text-gray-900 hover:bg-gray-50 flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        In geteilter Bildschirmansicht öffnen
      </button>
      <button className="w-full px-4 py-2 text-sm text-left text-gray-900 hover:bg-gray-50 flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        In neuem Fenster öffnen
      </button>

      <div className="border-t border-gray-100 my-1" />

      <button className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-50">
        Ausblenden
      </button>
    </div>
  );
}
