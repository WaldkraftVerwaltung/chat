'use client';

export function ThreadsView() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-3 py-2">
        <h2 className="text-sm font-semibold text-slack-text-bright">Threads</h2>
      </div>
      <p className="px-3 py-4 text-sm text-slack-text">
        Threads an denen du beteiligt bist erscheinen hier.
      </p>
    </div>
  );
}
