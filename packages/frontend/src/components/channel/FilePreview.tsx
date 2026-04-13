interface FilePreviewProps {
  file: { id: string; originalFilename: string; mimeType: string; sizeBytes: number; thumbnailKey: string | null };
}

export function FilePreview({ file }: FilePreviewProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const isImage = file.mimeType.startsWith('image/');
  const sizeLabel = file.sizeBytes < 1024 * 1024
    ? `${Math.round(file.sizeBytes / 1024)} KB`
    : `${(file.sizeBytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="mt-1 inline-flex items-center gap-2 rounded border bg-gray-50 p-2">
      {isImage && file.thumbnailKey ? (
        <img src={`${apiUrl}/api/files/${file.id}/thumbnail`} alt={file.originalFilename}
          className="h-20 w-20 rounded object-cover" />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-200 text-xs font-bold text-gray-500">
          {file.originalFilename.split('.').pop()?.toUpperCase() || 'FILE'}
        </div>
      )}
      <div className="min-w-0">
        <a href={`${apiUrl}/api/files/${file.id}/download`} target="_blank" rel="noopener"
          className="text-sm font-medium text-indigo-600 hover:underline truncate block max-w-[200px]">
          {file.originalFilename}
        </a>
        <span className="text-xs text-gray-500">{sizeLabel}</span>
      </div>
    </div>
  );
}
