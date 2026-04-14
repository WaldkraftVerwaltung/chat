'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { renderMrkdwn } from '@/lib/mrkdwn';

export default function ThreadsPage() {
  const router = useRouter();
  // For now, show a nice placeholder since we don't have a dedicated threads API
  return (
    <div className="flex-1 bg-white">
      <div className="border-b px-6 py-4">
        <h1 className="text-lg font-bold">Threads</h1>
        <p className="text-sm text-gray-500 mt-1">Behalte den Ueberblick ueber Unterhaltungen, die dir wichtig sind.</p>
      </div>
      <div className="p-6">
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">🧵</span>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Threads an einem Ort</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Threads werden hier angezeigt, sobald du in einem Thread antwortest oder erwaehnt wirst.
            So verpasst du keine wichtigen Diskussionen.
          </p>
        </div>
      </div>
    </div>
  );
}
