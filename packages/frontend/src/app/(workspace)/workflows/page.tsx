'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Workflow {
  id: string;
  name: string;
  trigger: string;
  action: string;
  config: Record<string, string>;
  enabled: boolean;
}

const TRIGGERS = [
  { id: 'message_posted', label: 'Wenn eine Nachricht gepostet wird', icon: '💬', description: 'Reagiert auf neue Nachrichten in einem Channel' },
  { id: 'member_joined', label: 'Wenn jemand einem Channel beitritt', icon: '👋', description: 'Reagiert wenn ein neues Mitglied beitritt' },
  { id: 'schedule', label: 'Nach Zeitplan', icon: '🕐', description: 'Laeuft zu festgelegten Zeiten' },
  { id: 'webhook', label: 'Von einem Webhook', icon: '🔗', description: 'Wird von einem externen System ausgeloest' },
  { id: 'emoji_reaction', label: 'Wenn eine Reaktion hinzugefuegt wird', icon: '😀', description: 'Reagiert auf bestimmte Emoji-Reaktionen' },
];

const ACTIONS = [
  { id: 'send_message', label: 'Nachricht senden', icon: '📝', description: 'Sendet eine Nachricht in einen Channel oder als DM' },
  { id: 'create_channel', label: 'Channel erstellen', icon: '#', description: 'Erstellt automatisch einen neuen Channel' },
  { id: 'show_form', label: 'Formular anzeigen', icon: '📋', description: 'Zeigt ein Eingabeformular für den Nutzer' },
  { id: 'send_webhook', label: 'Externen Webhook aufrufen', icon: '🌐', description: 'Sendet einen HTTP-Request an eine URL' },
  { id: 'add_reaction', label: 'Reaktion hinzufügen', icon: '👍', description: 'Fuegt automatisch eine Emoji-Reaktion hinzu' },
];

export default function WorkflowsPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chat-workflows');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState(1);
  const [newWorkflow, setNewWorkflow] = useState({ name: '', trigger: '', action: '', config: {} as Record<string, string> });

  function saveWorkflow() {
    const wf: Workflow = {
      id: Date.now().toString(),
      name: newWorkflow.name || `Workflow ${workflows.length + 1}`,
      trigger: newWorkflow.trigger,
      action: newWorkflow.action,
      config: newWorkflow.config,
      enabled: true,
    };
    const updated = [...workflows, wf];
    setWorkflows(updated);
    localStorage.setItem('chat-workflows', JSON.stringify(updated));
    setIsCreating(false);
    setStep(1);
    setNewWorkflow({ name: '', trigger: '', action: '', config: {} });
  }

  function deleteWorkflow(id: string) {
    const updated = workflows.filter((w) => w.id !== id);
    setWorkflows(updated);
    localStorage.setItem('chat-workflows', JSON.stringify(updated));
  }

  function toggleWorkflow(id: string) {
    const updated = workflows.map((w) => w.id === id ? { ...w, enabled: !w.enabled } : w);
    setWorkflows(updated);
    localStorage.setItem('chat-workflows', JSON.stringify(updated));
  }

  if (isCreating) {
    return (
      <div className="flex-1 bg-white p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Neuen Workflow erstellen</h1>
            <button onClick={() => { setIsCreating(false); setStep(1); }} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === s ? 'bg-slack-green text-white' : step > s ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                }`}>{step > s ? '✓' : s}</div>
                {s < 4 && <div className={`w-12 h-0.5 ${step > s ? 'bg-green-300' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Name */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Wie soll der Workflow heissen?</h2>
              <input value={newWorkflow.name} onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                placeholder="z.B. Willkommensnachricht für neue Mitglieder"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:border-slack-green outline-none" />
              <div className="mt-6 flex justify-end">
                <button onClick={() => setStep(2)} disabled={!newWorkflow.name}
                  className="bg-slack-green text-white px-6 py-2 rounded-lg font-medium hover:bg-slack-green-hover disabled:opacity-50">
                  Weiter
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Trigger */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Wann soll der Workflow starten?</h2>
              <div className="space-y-2">
                {TRIGGERS.map((t) => (
                  <button key={t.id} onClick={() => setNewWorkflow({ ...newWorkflow, trigger: t.id })}
                    className={`flex items-center gap-4 w-full rounded-lg border-2 p-4 text-left transition-colors ${
                      newWorkflow.trigger === t.id ? 'border-slack-green bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{t.label}</p>
                      <p className="text-sm text-gray-500">{t.description}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={() => setStep(1)} className="px-6 py-2 rounded-lg border hover:bg-gray-50">Zurück</button>
                <button onClick={() => setStep(3)} disabled={!newWorkflow.trigger}
                  className="bg-slack-green text-white px-6 py-2 rounded-lg font-medium hover:bg-slack-green-hover disabled:opacity-50">Weiter</button>
              </div>
            </div>
          )}

          {/* Step 3: Action */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Was soll passieren?</h2>
              <div className="space-y-2">
                {ACTIONS.map((a) => (
                  <button key={a.id} onClick={() => setNewWorkflow({ ...newWorkflow, action: a.id })}
                    className={`flex items-center gap-4 w-full rounded-lg border-2 p-4 text-left transition-colors ${
                      newWorkflow.action === a.id ? 'border-slack-green bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <span className="text-2xl">{a.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{a.label}</p>
                      <p className="text-sm text-gray-500">{a.description}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={() => setStep(2)} className="px-6 py-2 rounded-lg border hover:bg-gray-50">Zurück</button>
                <button onClick={() => setStep(4)} disabled={!newWorkflow.action}
                  className="bg-slack-green text-white px-6 py-2 rounded-lg font-medium hover:bg-slack-green-hover disabled:opacity-50">Weiter</button>
              </div>
            </div>
          )}

          {/* Step 4: Config + Save */}
          {step === 4 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Konfiguration</h2>
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded border">
                  <span className="text-xl">{TRIGGERS.find((t) => t.id === newWorkflow.trigger)?.icon}</span>
                  <div>
                    <p className="text-xs text-gray-500">Trigger</p>
                    <p className="text-sm font-medium">{TRIGGERS.find((t) => t.id === newWorkflow.trigger)?.label}</p>
                  </div>
                </div>
                <div className="flex justify-center"><span className="text-gray-300">↓</span></div>
                <div className="flex items-center gap-3 p-3 bg-white rounded border">
                  <span className="text-xl">{ACTIONS.find((a) => a.id === newWorkflow.action)?.icon}</span>
                  <div>
                    <p className="text-xs text-gray-500">Aktion</p>
                    <p className="text-sm font-medium">{ACTIONS.find((a) => a.id === newWorkflow.action)?.label}</p>
                  </div>
                </div>

                {newWorkflow.action === 'send_message' && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-700">Nachrichtentext</label>
                    <textarea value={newWorkflow.config.message || ''}
                      onChange={(e) => setNewWorkflow({ ...newWorkflow, config: { ...newWorkflow.config, message: e.target.value } })}
                      placeholder="Willkommen im Team! 👋" className="w-full rounded border px-3 py-2 text-sm mt-1" rows={3} />
                  </div>
                )}
                {newWorkflow.action === 'send_webhook' && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-700">Webhook URL</label>
                    <input value={newWorkflow.config.url || ''}
                      onChange={(e) => setNewWorkflow({ ...newWorkflow, config: { ...newWorkflow.config, url: e.target.value } })}
                      placeholder="https://example.com/webhook" className="w-full rounded border px-3 py-2 text-sm mt-1" />
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={() => setStep(3)} className="px-6 py-2 rounded-lg border hover:bg-gray-50">Zurück</button>
                <button onClick={saveWorkflow}
                  className="bg-slack-green text-white px-6 py-2 rounded-lg font-medium hover:bg-slack-green-hover">
                  Workflow speichern
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Workflow list view
  return (
    <div className="flex-1 bg-white p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Workflow Builder</h1>
            <p className="text-sm text-gray-500 mt-1">Automatisiere wiederkehrende Aufgaben</p>
          </div>
          <button onClick={() => setIsCreating(true)}
            className="bg-slack-green text-white px-5 py-2.5 rounded-lg font-medium hover:bg-slack-green-hover flex items-center gap-2">
            <span className="text-lg">+</span> Neuen Workflow erstellen
          </button>
        </div>

        {workflows.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <span className="text-5xl mb-4 block">⚡</span>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Noch keine Workflows</h2>
            <p className="text-sm text-gray-500 mb-6">Erstelle deinen ersten Workflow um wiederkehrende Aufgaben zu automatisieren.</p>
            <button onClick={() => setIsCreating(true)}
              className="bg-slack-green text-white px-5 py-2 rounded-lg font-medium hover:bg-slack-green-hover">
              Ersten Workflow erstellen
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {workflows.map((wf) => (
              <div key={wf.id} className="flex items-center gap-4 rounded-xl border p-4 hover:shadow-sm transition-shadow">
                <div className="text-2xl">{TRIGGERS.find((t) => t.id === wf.trigger)?.icon || '⚡'}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{wf.name}</p>
                  <p className="text-xs text-gray-500">
                    {TRIGGERS.find((t) => t.id === wf.trigger)?.label} → {ACTIONS.find((a) => a.id === wf.action)?.label}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleWorkflow(wf.id)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${wf.enabled ? 'bg-slack-green' : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${wf.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                  <button onClick={() => deleteWorkflow(wf.id)} className="text-gray-400 hover:text-red-500 p-1" title="Löschen">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
