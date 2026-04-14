'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type SettingsSection = 'navigation' | 'home' | 'appearance' | 'notifications' | 'language' | 'accessibility' | 'read-status' | 'audio-video' | 'privacy' | 'advanced' | 'shortcuts';

const SECTIONS: { id: SettingsSection; label: string; icon: string }[] = [
  { id: 'notifications', label: 'Benachrichtigungen', icon: '🔔' },
  { id: 'navigation', label: 'Navigation', icon: '📱' },
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'appearance', label: 'Erscheinungsbild', icon: '🎨' },
  { id: 'notifications', label: 'Nachrichten und Medien', icon: '💬' },
  { id: 'language', label: 'Sprache & Region', icon: '🌍' },
  { id: 'accessibility', label: 'Barrierefreiheit', icon: '♿' },
  { id: 'read-status', label: 'Als gelesen markieren', icon: '✓' },
  { id: 'audio-video', label: 'Audio und Video', icon: '🎥' },
  { id: 'privacy', label: 'Datenschutz und Transparenz', icon: '🔒' },
  { id: 'advanced', label: 'Erweitert', icon: '⚙️' },
  { id: 'shortcuts', label: 'Tastenkuerzel', icon: '⌨️' },
];

export default function SettingsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SettingsSection>('navigation');

  return (
    <div className="flex flex-1 bg-white">
      {/* Close button */}
      <button onClick={() => router.back()}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl z-10">&times;</button>

      {/* Left navigation */}
      <div className="w-64 border-r p-6 overflow-y-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Persoenliche Einstellungen</h1>
        <nav className="space-y-0.5">
          {SECTIONS.map((section) => (
            <button key={section.id + section.label} onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-700 -ml-1 pl-4'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}>
              <span>{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Right content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeSection === 'navigation' && <NavigationSettings />}
        {activeSection === 'appearance' && <AppearanceSettings />}
        {activeSection === 'language' && <LanguageSettings />}
        {activeSection === 'notifications' && <NotificationSettings />}
        {activeSection === 'accessibility' && <AccessibilitySettings />}
        {activeSection === 'advanced' && <AdvancedSettings />}
        {activeSection === 'shortcuts' && <KeyboardShortcuts />}
      </div>
    </div>
  );
}

function NavigationSettings() {
  const [navItems, setNavItems] = useState({
    home: true, dms: true, activity: true, files: true, later: true, tools: false,
  });
  const [navStyle, setNavStyle] = useState<'icons-text' | 'icons-only'>('icons-text');

  return (
    <div className="max-w-xl">
      <h2 className="text-base font-bold text-gray-900 mb-1">Diese Tabs in der Navigationsleiste anzeigen:</h2>
      <p className="text-sm text-gray-500 mb-4">Bei geringeren Fenstergroessen werden moeglicherweise nicht alle ausgewaehlten Tabs angezeigt.</p>

      <div className="space-y-3 mb-8">
        {[
          { key: 'home', label: 'Home', icon: '🏠' },
          { key: 'dms', label: 'DMs', icon: '💬' },
          { key: 'activity', label: 'Aktivitaet', icon: '🔔' },
          { key: 'files', label: 'Dateien', icon: '📁' },
          { key: 'later', label: 'Spaeter', icon: '🔖' },
          { key: 'tools', label: 'Tools', icon: '🔧' },
        ].map((item) => (
          <label key={item.key} className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={(navItems as any)[item.key]}
              onChange={(e) => setNavItems({ ...navItems, [item.key]: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm text-gray-900">{item.label}</span>
          </label>
        ))}
      </div>

      <h2 className="text-base font-bold text-gray-900 mb-3">Erscheinungsbild des Navigations-Tabs</h2>
      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="radio" name="navStyle" checked={navStyle === 'icons-text'}
            onChange={() => setNavStyle('icons-text')} className="mt-0.5 w-4 h-4 text-blue-600" />
          <span className="text-sm text-gray-900">Symbole und Text</span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="radio" name="navStyle" checked={navStyle === 'icons-only'}
            onChange={() => setNavStyle('icons-only')} className="mt-0.5 w-4 h-4 text-blue-600" />
          <div>
            <span className="text-sm text-gray-900">Nur Symbole</span>
            <p className="text-xs text-gray-500 mt-0.5">Verkleinert die Navigations-Tabs und schaltet numerische Badges automatisch aus.</p>
          </div>
        </label>
      </div>
    </div>
  );
}

function AppearanceSettings() {
  const [theme, setTheme] = useState('system');
  return (
    <div className="max-w-xl">
      <h2 className="text-base font-bold text-gray-900 mb-4">Erscheinungsbild</h2>
      <div className="space-y-3">
        {[
          { value: 'light', label: 'Hell' },
          { value: 'dark', label: 'Dunkel' },
          { value: 'system', label: 'Systemeinstellung' },
        ].map((t) => (
          <label key={t.value} className="flex items-center gap-3 cursor-pointer">
            <input type="radio" name="theme" checked={theme === t.value}
              onChange={() => setTheme(t.value)} className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-900">{t.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function LanguageSettings() {
  return (
    <div className="max-w-xl">
      <h2 className="text-base font-bold text-gray-900 mb-4">Sprache & Region</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sprache</label>
          <select className="rounded-md border px-3 py-2 text-sm w-full max-w-xs">
            <option value="de">Deutsch</option>
            <option value="en">English</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zeitzone</label>
          <select className="rounded-md border px-3 py-2 text-sm w-full max-w-xs">
            <option value="Europe/Berlin">(UTC+1) Berlin</option>
            <option value="Europe/London">(UTC+0) London</option>
            <option value="America/New_York">(UTC-5) New York</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zeitformat</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="timeFormat" defaultChecked className="w-4 h-4" />
              <span className="text-sm">24-Stunden (14:30)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="timeFormat" className="w-4 h-4" />
              <span className="text-sm">12-Stunden (2:30 PM)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="max-w-xl">
      <h2 className="text-base font-bold text-gray-900 mb-4">Benachrichtigungen</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Desktop-Benachrichtigungen</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="desktopNotif" defaultChecked className="w-4 h-4" />
              <span className="text-sm">Alle neuen Nachrichten</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="desktopNotif" className="w-4 h-4" />
              <span className="text-sm">Nur Erwaehnungen und DMs</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="desktopNotif" className="w-4 h-4" />
              <span className="text-sm">Keine</span>
            </label>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Benachrichtigungston</h3>
          <select className="rounded-md border px-3 py-2 text-sm">
            <option>Standard</option>
            <option>Leise</option>
            <option>Aus</option>
          </select>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Keyword-Benachrichtigungen</h3>
          <p className="text-xs text-gray-500 mb-2">Benachrichtige mich bei diesen Woertern (kommagetrennt):</p>
          <input type="text" placeholder="z.B. deploy, bug, dringend" className="rounded-md border px-3 py-2 text-sm w-full" />
        </div>
      </div>
    </div>
  );
}

function AccessibilitySettings() {
  return (
    <div className="max-w-xl">
      <h2 className="text-base font-bold text-gray-900 mb-4">Barrierefreiheit</h2>
      <div className="space-y-4">
        <label className="flex items-center justify-between">
          <span className="text-sm text-gray-900">Animationen reduzieren</span>
          <input type="checkbox" className="w-5 h-5 rounded" />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-sm text-gray-900">Links unterstreichen</span>
          <input type="checkbox" className="w-5 h-5 rounded" />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-sm text-gray-900">Tastenkuerzel anzeigen</span>
          <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
        </label>
      </div>
    </div>
  );
}

function AdvancedSettings() {
  return (
    <div className="max-w-xl">
      <h2 className="text-base font-bold text-gray-900 mb-4">Erweiterte Einstellungen</h2>
      <div className="space-y-4">
        <label className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-900 block">Link-Vorschauen anzeigen</span>
            <span className="text-xs text-gray-500">Zeigt Vorschauen fuer geteilte Links</span>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
        </label>
        <label className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-900 block">Typing-Indikator senden</span>
            <span className="text-xs text-gray-500">Andere sehen wenn du tippst</span>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
        </label>
      </div>
    </div>
  );
}

function KeyboardShortcuts() {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');
  const mod = isMac ? '⌘' : 'Strg';

  const groups = [
    {
      title: 'Navigation',
      shortcuts: [
        { keys: [`${mod}K`], description: 'Schnellwechsler / Suche oeffnen' },
        { keys: [`${mod},`], description: 'Persoenliche Einstellungen' },
        { keys: [`${mod}Shift+J`], description: 'Downloads anzeigen' },
        { keys: ['Esc'], description: 'Aktiven Kanal als gelesen markieren' },
      ],
    },
    {
      title: 'Nachrichten',
      shortcuts: [
        { keys: ['Enter'], description: 'Nachricht senden' },
        { keys: ['Shift+Enter'], description: 'Neue Zeile' },
        { keys: ['↑'], description: 'Letzte eigene Nachricht bearbeiten' },
        { keys: ['Esc'], description: 'Bearbeitung abbrechen' },
        { keys: [`${mod}Z`], description: 'Letzte Nachricht rueckgaengig machen (15s)' },
      ],
    },
    {
      title: 'Formatierung',
      shortcuts: [
        { keys: [`${mod}B`], description: 'Fett' },
        { keys: [`${mod}I`], description: 'Kursiv' },
        { keys: [`${mod}Shift+X`], description: 'Durchgestrichen' },
        { keys: [`${mod}Shift+C`], description: 'Code' },
      ],
    },
    {
      title: 'In Channels',
      shortcuts: [
        { keys: [`${mod}Shift+M`], description: 'Kanal stummschalten / Stummschaltung aufheben' },
        { keys: [`${mod}Shift+S`], description: 'Stern zum Kanal hinzufuegen' },
      ],
    },
  ];

  return (
    <div className="max-w-xl">
      <h2 className="text-base font-bold text-gray-900 mb-1">Tastenkuerzel</h2>
      <p className="text-sm text-gray-500 mb-6">Alle verfuegbaren Tastenkombinationen auf einen Blick.</p>

      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.title}>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{group.title}</h3>
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              {group.shortcuts.map((shortcut, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  <span className="text-sm text-gray-700">{shortcut.description}</span>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                    {shortcut.keys.map((key) => (
                      <kbd key={key} className="px-2 py-0.5 text-xs font-mono bg-gray-100 border border-gray-300 rounded text-gray-600 whitespace-nowrap">
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
