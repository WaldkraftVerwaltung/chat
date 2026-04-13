interface ChannelHeaderProps { name: string; topic: string | null; type: 'public' | 'private'; }

export function ChannelHeader({ name, topic, type }: ChannelHeaderProps) {
  return (
    <header className="flex items-center gap-3 border-b bg-white px-5 py-3">
      <span className="text-gray-400 text-lg">{type === 'public' ? '#' : '\uD83D\uDD12'}</span>
      <div className="min-w-0">
        <h1 className="text-base font-semibold text-gray-900">{name}</h1>
        {topic && <p className="text-xs text-gray-500 truncate">{topic}</p>}
      </div>
    </header>
  );
}
