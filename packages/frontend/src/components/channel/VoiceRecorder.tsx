'use client';
import { useState, useRef, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface VoiceRecorderProps {
  channelId: string;
  onDone: () => void;
  onCancel: () => void;
}

export function VoiceRecorder({ channelId, onDone, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [sending, setSending] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    startRecording();
    return () => {
      stopRecording();
      clearInterval(timerRef.current);
    };
  }, []);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      onCancel();
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    clearInterval(timerRef.current);
    setIsRecording(false);
  }

  async function handleSend() {
    stopRecording();
    setSending(true);

    // Wait a bit for final chunks
    await new Promise((r) => setTimeout(r, 200));

    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', blob, `sprachnachricht-${Date.now()}.webm`);

    try {
      const token = localStorage.getItem('accessToken');
      const uploadRes = await fetch(`${API_URL}/api/files/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const file = await uploadRes.json();

      // Send message with the voice file
      await apiFetch(`/channels/${channelId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: '🎤 Sprachnachricht' }),
      });

      onDone();
    } catch {
      onCancel();
    }
  }

  function handleCancel() {
    stopRecording();
    onCancel();
  }

  const mins = Math.floor(duration / 60);
  const secs = duration % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-3 w-full">
      {/* Recording indicator */}
      <div className="flex items-center gap-2 flex-1">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </span>
        <span className="text-sm font-medium text-red-600">Aufnahme {timeStr}</span>
        {/* Simple waveform animation */}
        <div className="flex items-center gap-0.5 flex-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="bg-red-400 rounded-full w-1 animate-pulse"
              style={{ height: `${8 + Math.random() * 16}px`, animationDelay: `${i * 50}ms` }} />
          ))}
        </div>
      </div>

      {/* Cancel button */}
      <button onClick={handleCancel} className="p-2 rounded-full hover:bg-gray-100 text-gray-500" title="Abbrechen">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Send button */}
      <button onClick={handleSend} disabled={sending}
        className="p-2 rounded-full bg-slack-green text-white hover:bg-slack-green-hover disabled:opacity-50" title="Senden">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
  );
}
