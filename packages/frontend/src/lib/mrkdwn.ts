function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderMrkdwn(text: string): string {
  let html = escapeHtml(text);
  // Code block: ```code```
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 rounded p-2 text-sm font-mono my-1 overflow-x-auto">$1</pre>');
  // Inline code: `code`
  html = html.replace(/`(.*?)`/g, '<code class="bg-gray-100 rounded px-1 py-0.5 text-sm font-mono text-red-600">$1</code>');
  // Bold: *text*
  html = html.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
  // Italic: _text_
  html = html.replace(/\b_(.*?)_\b/g, '<em>$1</em>');
  // Strikethrough: ~text~
  html = html.replace(/~(.*?)~/g, '<del>$1</del>');
  // Blockquote: > text
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-3 text-gray-600 my-1">$1</blockquote>');
  // Links: http(s)://...
  html = html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener" class="text-indigo-600 hover:underline">$1</a>');
  // @mentions
  html = html.replace(/@(\w+)/g, '<span class="bg-indigo-100 text-indigo-700 rounded px-1 font-medium">@$1</span>');
  // #channels
  html = html.replace(/#(\w[\w-]*)/g, '<span class="bg-indigo-100 text-indigo-700 rounded px-1 font-medium">#$1</span>');
  // Newlines
  html = html.replace(/\n/g, '<br>');
  return html;
}
