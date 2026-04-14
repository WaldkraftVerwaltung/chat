# Lastenheft: QA-Ergebnisse & Fehlende Features

> **Stand:** 14.04.2026
> **Getestet von:** 3 QA-Agents (Jacob/Admin, Lisa/Member, UX-Audit)
> **App-URL:** http://37.27.248.253:4011 (Frontend) / :4010 (Backend API)

---

## 1. Kritische Bugs (SOFORT beheben)

### 1.1 BEHOBEN: passwordHash in API-Responses
- **Problem:** `passwordHash` und `twoFactorSecret` wurden in ALLEN API-Responses zurueckgegeben
- **Fix:** `@Exclude()` Decorator + ClassSerializerInterceptor global
- **Status:** ✅ Gefixt (Commit: fix critical security bugs)

### 1.2 BEHOBEN: GET /channels/{id}/messages → 500
- **Problem:** Nachrichten konnten nicht geladen werden (FileAttachment Entity nicht in MessagesModule registriert)
- **Fix:** FileAttachment zu TypeOrmModule.forFeature hinzugefuegt
- **Status:** ✅ Gefixt

### 1.3 BEHOBEN: Workspace-Settings fuer alle aenderbar
- **Problem:** Jeder Member konnte PATCH /workspace aufrufen und z.B. den Workspace-Namen aendern
- **Fix:** Role-Check (nur PRIMARY_OWNER, OWNER, ADMIN)
- **Status:** ✅ Gefixt

### 1.4 BEHOBEN: Private Channels ohne Einladung beitretbar
- **Problem:** POST /channels/{id}/join funktionierte auch fuer private Channels
- **Fix:** ForbiddenException wenn Channel-Typ = private
- **Status:** ✅ Gefixt

---

## 2. Offene Funktionsfehler

### 2.1 Suche findet nichts (Meilisearch-Index leer)
- **Prioritaet:** HOCH
- **Problem:** GET /search?q=... gibt immer 0 Treffer zurueck
- **Ursache:** Nachrichten werden nicht in Meilisearch indexiert
- **Fix:** SearchService.indexMessage() wird im MessagesService.create() aufgerufen, aber der Meilisearch-Container hat moeglicherweise keinen initialisierten Index

### 2.2 POST /dms → 500 (Neue DMs nicht erstellbar)
- **Prioritaet:** HOCH
- **Problem:** DM-Erstellung schlaegt mit 500 fehl
- **Vermutung:** Fehler im DmService.findOrCreate() oder fehlende Entity-Registration

### 2.3 POST /messages/{id}/reactions → 500
- **Prioritaet:** HOCH (bei Lisa-Test, bei Jacob-Test funktionierte es)
- **Problem:** Reaktionen funktionieren nicht konsistent
- **Vermutung:** Race Condition oder fehlende Relation

### 2.4 DM-Duplikate in der Datenbank
- **Prioritaet:** MITTEL
- **Problem:** Gleiche DM-Konversation existiert mehrfach (Jacob↔Andre 3x)
- **Ursache:** Seed-Script hat Duplikate erstellt, findOrCreate-Logik greift nicht zuverlaessig

### 2.5 Notifications immer leer
- **Prioritaet:** MITTEL
- **Problem:** GET /notifications gibt immer leeres Array zurueck
- **Ursache:** Notification-Trigger im Gateway funktionieren moeglicherweise nur via WebSocket, nicht bei REST-API-Nachrichten

### 2.6 Notification Count Format inkonsistent
- **Prioritaet:** NIEDRIG
- **Problem:** GET /notifications/count gibt plain Integer `0` statt `{"count":0}` zurueck

---

## 3. Fehlende Backend-Features

### 3.1 Thread-Antworten API
- [ ] GET /api/messages/{id}/thread — existiert, muss getestet werden
- [ ] POST /api/channels/{id}/messages mit threadParentId — muss geprüft werden

### 3.2 Gepinnte Nachrichten API
- [ ] GET /api/channels/{id}/pins — fehlt (Endpoint zum Auflisten aller Pins eines Channels)

### 3.3 Saved Items API
- [ ] POST /api/messages/{id}/save — fehlt (Nachricht speichern)
- [ ] GET /api/saved-items — existiert, aber kein Save-Trigger vorhanden

### 3.4 Nachricht weiterleiten
- [ ] POST /api/messages/{id}/forward — fehlt

### 3.5 Custom Emoji Upload
- [ ] POST /api/emoji — existiert, muss getestet werden

### 3.6 User Groups Seed-Daten
- [ ] GET /api/user-groups gibt leeres Array — keine Testdaten angelegt

### 3.7 Archivierte Channels abrufen
- [ ] GET /api/channels?include_archived=true — fehlt als Filter

---

## 4. Fehlende Frontend-Features (UX/UI)

### 4.1 Sidebar Navigation
- [ ] **Navigation Rail** — existiert jetzt (NavRail), aber:
  - Threads-View zeigt nur Platzhalter
  - Saved/Later-View zeigt nur Platzhalter
  - More-View hat keinen Inhalt
  - DMs-View zeigt nur DM-Liste ohne Channels
  - Channels-View braucht "Channel beitreten" Option

### 4.2 Channel-Interaktionen
- [ ] **Channel-Browser** — Alle oeffentlichen Channels durchsuchen und beitreten
- [ ] **Channel-Einstellungen Dialog** — Topic, Beschreibung, Posting-Berechtigungen aendern
- [ ] **Mitglieder einladen** — In-Channel Invite-Dialog
- [ ] **Channel umbenennen**

### 4.3 Nachrichten-Interaktionen
- [ ] **Bild-Lightbox** — Klick auf Bild oeffnet Vollansicht
- [ ] **Drag & Drop Upload** — Visuelle Drop-Zone ueber dem gesamten Chat
- [ ] **Nachricht als Lesezeichen speichern** — Bookmark-Icon in Action-Bar
- [ ] **Als ungelesen markieren** — Funktional im Kontextmenu verbinden
- [ ] **Erinnern** — Funktional im Kontextmenu verbinden (Backend: Reminders fehlen)
- [ ] **Weiterleiten** — Funktional im Kontextmenu verbinden (Backend fehlt)
- [ ] **Nachrichtenbearbeitungs-Historie** — Klick auf "(bearbeitet)" zeigt alte Versionen

### 4.4 Profilansicht
- [ ] **Eigenes Profil bearbeiten** — Vollstaendige Profilseite (Name, Titel, Telefon, Zeitzone, Profilbild-Upload)
- [ ] **Andere Profile ansehen** — Klick auf Avatar oeffnet Profil-Panel (existiert als UserProfileCard, aber unvollstaendig)
- [ ] **Profilbild-Upload** — Fehlt komplett

### 4.5 Persoenliche Einstellungen
- [ ] **Benachrichtigungen** — Desktop-Push Ein/Aus, Sound, DND-Zeitplan
- [ ] **Darstellung** — Hell/Dunkel-Theme Toggle, kompaktes Layout
- [ ] **Sprache** — Deutsch/Englisch Umschaltung
- [ ] **Tastenkuerzel-Uebersicht** — Alle Shortcuts anzeigen (Cmd+/ oder ?)

### 4.6 Message Input Erweiterungen
- [ ] **Sprachnachricht** — Mikrofon-Icon fuer Audio-Recording
- [ ] **Nachricht planen** — Dropdown am Send-Button: "Spaeter senden"
- [ ] **Code-Snippet erstellen** — Groesseres Code-Editor-Modal
- [ ] **Poll/Umfrage erstellen** — Inline-Umfrage

### 4.7 Responsiveness / Mobile
- [ ] **Mobile Layout** — Sidebar als Drawer, kein Fixed-Width
- [ ] **Touch-Gesten** — Swipe fuer Navigation
- [ ] **Mobile Message Actions** — Long-Press statt Hover
- [ ] **PWA-Icons** — Placeholder-Icons durch richtige ersetzen

### 4.8 Performance
- [ ] **Virtualisierte Nachrichtenliste** — Bei 1000+ Nachrichten wird die Liste langsam (react-window/virtuoso)
- [ ] **Lazy Loading** — Channels und DMs erst laden wenn sichtbar
- [ ] **Memoization** — React.memo fuer MessageItem, ChannelListItem

### 4.9 Accessibility
- [ ] **ARIA-Labels** — Fehlend auf den meisten interaktiven Elementen
- [ ] **Focus Management** — Tab-Navigation durch Messages, Channels
- [ ] **Screen Reader** — Announcements bei neuen Nachrichten
- [ ] **Reduced Motion** — Animationen abschaltbar
- [ ] **Kontrast** — Einige Slack-Text-Farben (#CFC3CF auf #3F0E40) muessen WCAG AA geprueft werden

### 4.10 Fehlende Keyboard Shortcuts
- [ ] **Pfeil-hoch** — Letzte eigene Nachricht bearbeiten
- [ ] **Cmd+Shift+K** — DM-Browser oeffnen
- [ ] **Cmd+Shift+L** — Channel-Browser oeffnen
- [ ] **Cmd+Shift+M** — Aktivitaet oeffnen
- [ ] **Cmd+Shift+T** — Threads oeffnen
- [ ] **Cmd+Shift+A** — Alle ungelesenen anzeigen
- [ ] **Cmd+Shift+S** — Saved Items oeffnen
- [ ] **Esc** — Channel als gelesen markieren
- [ ] **Cmd+/** — Tastenkuerzel anzeigen
- [ ] **E** (bei fokussierter Nachricht) — Bearbeiten
- [ ] **R** — Reaktion hinzufuegen
- [ ] **T** — Thread oeffnen

---

## 5. Visuelles / Design

- [ ] **Profilbilder** — Alle User haben nur Initialen, kein Avatar-Upload
- [ ] **PWA-Icons** — /icons/icon-192.png und /icons/icon-512.png fehlen (nur leerer Ordner)
- [ ] **Favicon** — Nur leere Datei, kein echtes Icon
- [ ] **Loading-Spinner** — Globaler Loading-State fehlt (App zeigt weissen Bildschirm beim Laden)
- [ ] **Error-Boundaries** — Keine Error-Boundaries um Komponenten (ein Fehler crashed die ganze App)
- [ ] **Leer-Zustaende** — Nicht alle Views haben schoene Empty States (z.B. DMs, Threads, Activity)
- [ ] **Animationen** — Keine Uebergangsanimationen (Channel-Wechsel, Panel-Oeffnen)

---

## Prioritaeten-Matrix

| Prio | Bereich | Aufwand | Status |
|------|---------|---------|--------|
| 🔴 1 | Security-Fixes (passwordHash etc.) | Klein | ✅ Behoben |
| 🔴 1 | Messages 500 Error | Klein | ✅ Behoben |
| 🔴 1 | Workspace Permissions | Klein | ✅ Behoben |
| 🟡 2 | Suche (Meilisearch) | Mittel | Offen |
| 🟡 2 | DM-Erstellung Fix | Klein | Offen |
| 🟡 2 | Reaktionen Fix | Klein | Offen |
| 🟡 2 | Profil-Bearbeitung | Mittel | Offen |
| 🟡 2 | Channel-Browser | Mittel | Offen |
| 🟡 2 | Nachricht speichern/weiterleiten | Mittel | Offen |
| 🟢 3 | Keyboard Shortcuts | Klein | Offen |
| 🟢 3 | Responsiveness/Mobile | Gross | Offen |
| 🟢 3 | Accessibility | Gross | Offen |
| 🟢 3 | Performance/Virtualisierung | Mittel | Offen |
| ⚪ 4 | Sprachnachrichten | Gross | Offen |
| ⚪ 4 | Polls/Umfragen | Mittel | Offen |
| ⚪ 4 | Code-Snippets | Klein | Offen |
