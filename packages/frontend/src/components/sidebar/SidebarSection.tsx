'use client';
import { useState, ReactNode } from 'react';

interface SidebarSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: number;
}

export function SidebarSection({ title, children, defaultOpen = true, badge }: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-1">
      <button onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-1 px-3 py-1 text-xs font-semibold uppercase text-slack-text hover:text-slack-text-bright transition-colors">
        <span className={`text-[10px] transition-transform ${isOpen ? 'rotate-90' : ''}`}>&#9654;</span>
        <span className="flex-1 text-left">{title}</span>
        {badge !== undefined && badge > 0 && (
          <span className="rounded-full bg-slack-red px-1.5 py-0.5 text-[10px] text-white font-bold">{badge}</span>
        )}
      </button>
      {isOpen && <div className="mt-0.5">{children}</div>}
    </div>
  );
}
