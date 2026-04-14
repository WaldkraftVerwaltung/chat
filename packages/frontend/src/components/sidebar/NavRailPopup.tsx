'use client';
import { useEffect, useRef, ReactNode } from 'react';

interface NavRailPopupProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  topRight?: ReactNode;
  children: ReactNode;
  anchorTop: number;
}

export function NavRailPopup({ isVisible, onClose, title, topRight, children, anchorTop }: NavRailPopupProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    if (isVisible) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      ref={ref}
      className="fixed z-50 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
      style={{ top: Math.max(anchorTop - 20, 50), left: 72 }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {topRight}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
