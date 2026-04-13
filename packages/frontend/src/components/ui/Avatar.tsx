interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  presence?: 'active' | 'away' | 'dnd' | null;
}

const sizes = { sm: 'h-6 w-6 text-[10px]', md: 'h-9 w-9 text-xs', lg: 'h-12 w-12 text-sm' };
const presenceColors = { active: 'bg-green-500', away: 'bg-gray-400', dnd: 'bg-red-500' };

export function Avatar({ name, avatarUrl, size = 'md', presence }: AvatarProps) {
  const initial = name?.[0]?.toUpperCase() || '?';
  return (
    <div className="relative inline-flex">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className={`${sizes[size]} rounded-full object-cover`} />
      ) : (
        <div className={`${sizes[size]} rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-600`}>{initial}</div>
      )}
      {presence && (
        <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${presenceColors[presence]}`} />
      )}
    </div>
  );
}
