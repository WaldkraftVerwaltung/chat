'use client';
import { useState } from 'react';

interface FilePreviewProps {
  file: { id: string; originalFilename: string; mimeType: string; sizeBytes: number; thumbnailKey: string | null };
}

function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white text-3xl hover:text-gray-300 leading-none"
          title="Schließen"
        >
          &times;
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl object-contain"
        />
        <div className="mt-2 text-center text-sm text-gray-300">{alt}</div>
      </div>
    </div>
  );
}

export function FilePreview({ file }: FilePreviewProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const isImage = file.mimeType.startsWith('image/');
  const sizeLabel = file.sizeBytes < 1024 * 1024
    ? `${Math.round(file.sizeBytes / 1024)} KB`
    : `${(file.sizeBytes / (1024 * 1024)).toFixed(1)} MB`;

  const fullSrc = `${apiUrl}/api/files/${file.id}/download`;
  const thumbSrc = `${apiUrl}/api/files/${file.id}/thumbnail`;

  return (
    <>
      <div className="mt-1 inline-flex items-center gap-2 rounded border bg-gray-50 p-2">
        {isImage && file.thumbnailKey ? (
          <button
            onClick={() => setLightboxOpen(true)}
            className="flex-shrink-0 cursor-zoom-in rounded overflow-hidden group relative"
            title="Bild vergrößern"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbSrc}
              alt={file.originalFilename}
              className="h-20 w-20 rounded object-cover group-hover:opacity-90 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded">
              <svg className="w-6 h-6 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </button>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-200 text-xs font-bold text-gray-500">
            {file.originalFilename.split('.').pop()?.toUpperCase() || 'FILE'}
          </div>
        )}
        <div className="min-w-0">
          <a
            href={fullSrc}
            target="_blank"
            rel="noopener"
            className="text-sm font-medium text-slack-blue hover:underline truncate block max-w-[200px]"
          >
            {file.originalFilename}
          </a>
          <span className="text-xs text-gray-500">{sizeLabel}</span>
        </div>
      </div>

      {lightboxOpen && isImage && (
        <ImageLightbox
          src={fullSrc}
          alt={file.originalFilename}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
