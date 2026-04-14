# Lastenheft: Vollstaendige QA-Ergebnisse & Fehlende Features

> **Stand:** 14.04.2026
> **Getestet von:** 3 QA-Agents (Jacob/Admin-API, Lisa/Member-API, UX/UI-Code-Audit)
> **App-URL:** http://37.27.248.253:4011 (Frontend) / :4010 (Backend API)

---

## Teil 1: Behobene kritische Bugs

| # | Bug | Status |
|---|-----|--------|
| S1 | passwordHash + twoFactorSecret in allen API-Responses | ✅ Behoben |
| S2 | GET /channels/{id}/messages → 500 (FileAttachment fehlte) | ✅ Behoben |
| S3 | PATCH /workspace fuer alle Member moeglich | ✅ Behoben |
| S4 | Private Channels ohne Einladung beitretbar | ✅ Behoben |
| S5 | Workspace-Name "Hacked Workspace" | ✅ Behoben |

---

## Teil 2: Offene Backend-Bugs

### Prio 1 — Kritisch

| # | Bug | Beschreibung |
|---|-----|-------------|
| B1 | Suche leer | Meilisearch-Index wird nicht befuellt. GET /search gibt immer 0 Treffer |
| B2 | DM-Erstellung 500 | POST /dms schlaegt fehl bei neuen Konversationen |
| B3 | Reaktionen 500 | POST /messages/{id}/reactions schlaegt bei manchen Nachrichten fehl |
| B4 | DM-Duplikate | Gleiche DM-Konversation existiert mehrfach in der DB |

### Prio 2 — Wichtig

| # | Bug | Beschreibung |
|---|-----|-------------|
| B5 | Notifications leer | Notification-System erzeugt keine Eintraege (nur via WebSocket, nicht REST) |
| B6 | Notification Count Format | Gibt plain Integer statt JSON-Objekt zurueck |
| B7 | Kein GET /channels/{id}/pins | Endpoint zum Auflisten gepinnter Nachrichten fehlt |
| B8 | Kein POST /messages/{id}/save | Endpoint zum Speichern von Nachrichten fehlt |
| B9 | Kein POST /messages/{id}/forward | Nachricht weiterleiten fehlt |
| B10 | Archivierte Channels nicht filterbar | Kein ?include_archived=true Parameter |

---

## Teil 3: Frontend UX/UI — Fehlende Funktionalitaet

### Prio 1 — Kritisch (App ist ohne diese kaum nutzbar)

| # | Was fehlt | Wo | Slack-Vergleich |
|---|-----------|-----|----------------|
| F1 | **Emoji-Suche filtert nicht** — zeigt immer alle Emojis | EmojiPicker.tsx | Slack filtert Emojis nach Suchbegriff |
| F2 | **Reaktions-Tooltip zeigt UUIDs statt Namen** | ReactionBar.tsx | Slack zeigt "Max, Lisa und 3 weitere" |
| F3 | **DM-Unread-Zaehler fehlen** — immer gruener Punkt | DmList.tsx | Slack zeigt fett + Badge fuer ungelesene DMs |
| F4 | **Keine Fehler-States bei Netzwerkproblemen** | Alle Stores | Slack zeigt Inline-Error mit "Erneut versuchen" |
| F5 | **Keine Nachrichten-Pagination** — nur ein Batch wird geladen | MessageList.tsx | Slack laedt aeltere Nachrichten beim Hochscrollen |
| F6 | **Nachricht weiterleiten** tut nur Clipboard-Copy | MessageItem.tsx | Slack hat Forward-Dialog mit Channel-Auswahl |
| F7 | **Pfeil-hoch** bearbeitet nicht letzte eigene Nachricht | MessageInput.tsx | Standard-Slack-Verhalten |
| F8 | **Nachrichten als Lesezeichen speichern** fehlt komplett | MessageItem.tsx | Slack: Bookmark-Icon in Action-Bar |

### Prio 2 — Wichtig (erwartet man als User)

| # | Was fehlt | Wo |
|---|-----------|-----|
| F9 | Profil-Bearbeitungs-Dialog (Name, Bild, Telefon) | ProfileMenu.tsx ("Profil" → TODO) |
| F10 | Channel-Browser (alle Channels durchsuchen + beitreten) | Kein Komponent vorhanden |
| F11 | Angepinnte Nachrichten Panel (Pin-Tab ist Platzhalter) | ChannelDetailsPanel.tsx |
| F12 | Threads-View in Sidebar ist leerer Stub | ThreadsView.tsx |
| F13 | Saved/Later-View zeigt keinen Nachrichteninhalt | SavedView.tsx |
| F14 | Mitglieder-Management (Einladen, Entfernen, Rollen) | ChannelDetailsPanel.tsx |
| F15 | Group-DM erstellen (Multi-User-Picker) | DmList.tsx (nur 1:1 moeglich) |
| F16 | Channel-Topic inline bearbeiten | ChannelHeader.tsx (read-only) |
| F17 | Pin-Button im Header hat keinen onClick-Handler | ChannelHeader.tsx |
| F18 | Suche-Button im Header oeffnet nichts | ChannelHeader.tsx |
| F19 | Bild-Lightbox (Klick auf Bild oeffnet Vollansicht) | Fehlt komplett |
| F20 | Textarea auto-grow (waechst mit Inhalt) | MessageInput.tsx (rows=1 fix) |
| F21 | Thread-Reply nutzt vereinfachte Textarea ohne Features | ThreadPanel.tsx |
| F22 | Loeschen ohne Bestaetigungsdialog | MessageItem.tsx |
| F23 | Keine "Neue Nachrichten"-Trennlinie | MessageList.tsx |
| F24 | Kein optimistisches Update beim Senden | MessageInput.tsx |
| F25 | DM-Presence statisch hardcoded gruen | DmList.tsx |
| F26 | Klick auf Avatar/Name oeffnet kein Profil | MessageItem.tsx |
| F27 | Kontextmenue-Position prueft nicht Viewport-Grenzen | MessageContextMenu.tsx |
| F28 | Compose-Button erstellt Channel statt neue Nachricht | NavRail.tsx |
| F29 | Multi-File-Upload fehlt (nur 1 Datei moeglich) | MessageInput.tsx |
| F30 | Suche navigiert nur zum Channel, nicht zur Nachricht | SearchModal.tsx |

### Prio 3 — Nice-to-have

| # | Was fehlt | Wo |
|---|-----------|-----|
| F31 | Emoji-Skin-Tone-Auswahl | EmojiPicker.tsx |
| F32 | Erweiterter Emoji-Katalog (~1800 statt ~200) | EmojiPicker.tsx |
| F33 | Bearbeitungs-Modus ohne visuellen Hintergrund | MessageItem.tsx |
| F34 | Toast ohne Ausblend-Animation | Toast.tsx |
| F35 | Empty States ohne Illustrationen | Alle Views |
| F36 | Workspace-Logo konfigurierbar | NavRail.tsx |
| F37 | Loading-Skeletons statt "Laden..." Text | MessageList.tsx |
| F38 | Read-Receipts in DMs | Fehlt |
| F39 | Action-Buttons Unicode statt SVG-Icons | MessageItem.tsx |
| F40 | Mention-Autocomplete ohne Avatar/Presence | MessageInput.tsx |

---

## Teil 4: Accessibility (WCAG 2.1 AA)

| # | Problem | WCAG | Prio |
|---|---------|------|------|
| A1 | Keine aria-label auf Icon-Buttons | 1.1.1 (A) | 1 |
| A2 | Kein sichtbarer Focus-Ring auf Buttons | 2.4.7 (AA) | 1 |
| A3 | Keine ARIA-Rollen auf Sidebar-Navigation | 4.1.2 (A) | 1 |
| A4 | Modal-Dialoge ohne Fokus-Trap | 2.1.2 (A) | 1 |
| A5 | Keine aria-live Region fuer neue Nachrichten | 4.1.3 (AA) | 2 |
| A6 | Fehlender Alt-Text auf Avatar-Divs | 1.1.1 (A) | 2 |
| A7 | Sidebar-Farbkontrast pruefbeduertig | 1.4.3 (AA) | 2 |
| A8 | Emoji-Picker nicht per Tastatur bedienbar | 2.1.1 (A) | 2 |
| A9 | Keine Skip-Navigation | 2.4.1 (A) | 2 |

---

## Teil 5: Keyboard-Shortcuts

| Shortcut | Funktion | Status |
|----------|----------|--------|
| Cmd+K | Suche oeffnen | ✅ Implementiert |
| Cmd+, | Einstellungen | ❌ Fehlt |
| Cmd+Shift+M | Aktivitaet | ❌ Fehlt |
| Cmd+Shift+T | Threads | ❌ Fehlt |
| Cmd+Shift+S | Gespeicherte | ❌ Fehlt |
| Alt+↑/↓ | Vorheriger/naechster Channel | ❌ Fehlt |
| Alt+Shift+↑/↓ | Naechster ungelesener | ❌ Fehlt |
| Cmd+F | In Channel suchen | ❌ Fehlt |
| Cmd+/ | Shortcut-Hilfe | ❌ Fehlt |
| ↑ (leere Textarea) | Letzte Nachricht bearbeiten | ❌ Fehlt |
| Escape | Channel als gelesen / Panel schliessen | ❌ Fehlt |

---

## Teil 6: Mobile / Responsive

| # | Problem | Prio |
|---|---------|------|
| M1 | Kein responsive Layout — Sidebar fix, kein Drawer | 2 |
| M2 | Thread-Panel ueberlagert Chat auf kleinen Viewports | 2 |
| M3 | Hover-basierte Actions nicht auf Touch-Geraeten nutzbar | 2 |
| M4 | Emoji-Picker zu breit fuer Mobile (<360px) | 3 |

---

## Teil 7: Performance

| # | Problem | Prio |
|---|---------|------|
| P1 | messagesByChannel waechst unbegrenzt (kein LRU-Cache) | 2 |
| P2 | updateMessage iteriert ueber alle Channel-Maps: O(n*m) | 2 |
| P3 | MessageItem nicht mit React.memo | 2 |
| P4 | Kein virtualisiertes Scrolling bei langen Nachrichtenlisten | 2 |
| P5 | Typing-Indicator hat Timeout-Leaks bei vielen Events | 3 |
| P6 | fetchConversations wird doppelt aufgerufen | 3 |

---

## Zusammenfassung

| Kategorie | Prio 1 | Prio 2 | Prio 3 | Total |
|-----------|--------|--------|--------|-------|
| Backend-Bugs | 4 | 6 | — | 10 |
| Frontend-Features | 8 | 22 | 10 | 40 |
| Accessibility | 4 | 5 | — | 9 |
| Keyboard-Shortcuts | 2 | 5 | 3 | 10 |
| Mobile/Responsive | — | 3 | 1 | 4 |
| Performance | — | 4 | 2 | 6 |
| **Total** | **18** | **45** | **16** | **79** |
