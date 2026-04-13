# Pflichtenheft: Chat — Eigenstaendige Messaging- & Kollaborationsplattform

> **Projekt:** `chat`
> **Auftraggeber:** Jacob Dill, Waldkraft GmbH
> **Erstellt:** 13.04.2026
> **Basisdokument:** [Slack-Funktionsdokumentation](../Slack-Funktionsdokumentation.md)
> **Status:** Entwurf

---

## 1. Zielsetzung

Entwicklung einer eigenstaendigen, selbst gehosteten Messaging- und Kollaborationsplattform als Alternative zu Slack. Die Plattform wird als separates Open-Source-Projekt aufgebaut (GitHub-Repo: `WaldkraftVerwaltung/chat`) und ist unabhaengig vom bestehenden Waldkraft Hub.

### 1.1 Projektziele

- Volle Kontrolle ueber Daten und Infrastruktur (Self-Hosted)
- Keine laufenden Lizenzkosten pro Nutzer
- Echtzeit-Messaging mit Feature-Paritaet zu Slack (phasenweise)
- Erweiterbar durch eigene Apps/Bots/Integrationen
- Moderne, responsive Web-Oberflaeche

### 1.2 Nicht-Ziele (explizit ausgeschlossen)

- Mobile Native Apps (iOS/Android) — Web-App ist responsive und PWA-faehig
- Slack Connect (Cross-Organisation-Channels) — nicht in Phase 1-3
- Enterprise Grid (Multi-Workspace) — nicht geplant
- Billing/Subscription-System — keine Monetarisierung
- E-Mail-Integration (E-Mail-zu-Channel) — nicht in Phase 1

---

## 2. Phasenplanung

### Phase 1 — MVP (Core Messaging)

Ziel: Funktionsfaehige Chat-Plattform mit allen Grundfunktionen fuer den taeglichen Einsatz.

### Phase 2 — Kollaboration

Ziel: Erweiterte Kommunikationsformen (Audio/Video, Dokumente, Tasks).

### Phase 3 — Automation & Enterprise

Ziel: Automatisierung, API-Oekosystem, Compliance-Funktionen.

---

## 3. Tech-Stack

| Komponente | Technologie | Begruendung |
|-----------|-------------|-------------|
| Backend | NestJS (TypeScript) | Erfahrung vorhanden, modulare Architektur, WebSocket-Support |
| Frontend | Next.js 14+ (React, TypeScript) | SSR/CSR flexibel, App Router, Server Components |
| Datenbank | PostgreSQL 16+ | Zuverlaessig, JSON-Support, Volltextsuche |
| Cache / Pub-Sub | Redis 7+ | Session-Cache, Praesenz-Tracking, Pub/Sub fuer Echtzeit |
| Echtzeit | WebSocket Gateway (NestJS + Socket.IO) | Nachrichten, Typing, Praesenz |
| Volltextsuche | Meilisearch | Schnell, typo-tolerant, einfache Integration |
| Dateispeicher | S3-kompatibel (MinIO lokal, AWS S3 Produktion) | Skalierbar, standardisiert |
| Auth | JWT (Access + Refresh Token) | Stateless, skalierbar |
| Containerisierung | Docker Compose | Einheitliches Deployment |
| Reverse Proxy | Caddy | Automatisches HTTPS, einfache Konfiguration |

### 3.1 Monorepo-Struktur

```
chat/
├── packages/
│   ├── backend/          # NestJS API + WebSocket Gateway
│   ├── frontend/         # Next.js Web-App
│   └── shared/           # Geteilte Types, Enums, Validierung
├── docker-compose.yml
├── docker-compose.dev.yml
├── Caddyfile
├── .github/
│   └── workflows/
├── docs/
│   └── Pflichtenheft.md
├── package.json          # Turborepo / npm workspaces
└── turbo.json
```

---

## 4. Phase 1 — MVP: Funktionale Anforderungen

### 4.1 Workspace-Verwaltung

#### F-WS-01: Workspace erstellen
- Ein Workspace wird bei der Erstinstallation angelegt
- Felder: Name, Icon (Bild-Upload), URL-Slug
- Ein Primary Owner wird als erster Nutzer erstellt

#### F-WS-02: Workspace-Einstellungen
- Name, Icon und URL aenderbar (nur durch Owner/Admin)
- Standard-Sprache (Deutsch/Englisch)
- Standard-Channels fuer neue Mitglieder konfigurierbar
- Workspace-weite Benachrichtigungs-Defaults

#### F-WS-03: Einladungssystem
- E-Mail-Einladung mit konfigurierbarer Rolle (Member/Guest)
- Einladungslink mit Ablaufdatum (7/14/30 Tage)
- Domain-basierter Auto-Join (z.B. alle @waldkraft.bio)
- Genehmigungsworkflow optional aktivierbar

---

### 4.2 Benutzerverwaltung & Rollen

#### F-USR-01: Benutzerregistrierung
- Registrierung per Einladungslink oder E-Mail-Einladung
- Pflichtfelder: E-Mail, Passwort, Anzeigename
- Optionale Felder: Vollstaendiger Name, Titel/Position, Telefon, Zeitzone, Profilbild

#### F-USR-02: Rollen
| Rolle | Beschreibung |
|-------|-------------|
| Primary Owner | Volle Kontrolle, kann Workspace nicht verlieren, Billing |
| Owner | Fast alle Rechte, kann vom Primary Owner ernannt werden |
| Admin | Mitglieder- und Channel-Verwaltung, App-Verwaltung |
| Member | Standardrolle — Nachrichten, Channels erstellen (konfigurierbar) |
| Single-Channel Guest | Zugriff auf genau einen Channel |
| Multi-Channel Guest | Zugriff auf ausgewaehlte Channels |

#### F-USR-03: Benutzerprofil
- Anzeigename (frei waehlbar)
- Vollstaendiger Name
- Titel / Position
- E-Mail (verifiziert)
- Telefonnummer
- Zeitzone (automatisch erkannt oder manuell)
- Profilbild (Upload, wird in mehreren Groessen gespeichert: 24, 48, 72, 192, 512px)
- Benutzerdefinierte Profilfelder (durch Admin definierbar, max. 50)

#### F-USR-04: Status & Praesenz
- **Praesenz-Zustaende:** Aktiv (gruener Punkt), Abwesend (leerer Kreis), DND (Z-Icon)
- **Automatische Erkennung:** Aktiv wenn App geoeffnet, Abwesend nach 10 Min Inaktivitaet
- **Manueller Override:** Nutzer kann Status auf Aktiv/Abwesend setzen
- **Custom Status:** Emoji + Freitext + Ablaufdatum
  - Ablaufoptionen: 30 Min, 1 Std, 4 Std, Heute, Diese Woche, Benutzerdefiniert
- **Status-Vorlagen:** Durch Admin konfigurierbare Presets (z.B. "Im Meeting", "Urlaub")

#### F-USR-05: Benutzer-Lebenszyklus
- Einladen → Registrieren → Aktiv → Deaktivieren → Optional Reaktivieren
- Deaktivierte Nutzer: kein Login, Nachrichten bleiben erhalten
- Nutzer koennen Workspace selbst verlassen

#### F-USR-06: People Directory
- Durchsuchbares Mitgliederverzeichnis
- Filter nach Name, Abteilung, Titel, Benutzergruppe
- Profilansicht zeigt: Kontaktdaten, gemeinsame Channels, lokale Uhrzeit

---

### 4.3 Channels

#### F-CH-01: Channel-Typen
- **Oeffentlich (Public):** Sichtbar im Channel-Browser, frei beitretbar, Icon: #
- **Privat (Private):** Nur fuer eingeladene Mitglieder, Icon: Schloss
- **Ankuendigungs-Channel:** Posting auf bestimmte Nutzer/Gruppen beschraenkt

#### F-CH-02: Channel erstellen
- Name: max. 80 Zeichen, Kleinbuchstaben, Zahlen, Bindestriche
- Beschreibung (Purpose): max. 250 Zeichen
- Topic: max. 250 Zeichen (wird im Channel-Header angezeigt)
- Sichtbarkeit: oeffentlich oder privat
- Optional: Sofort Mitglieder einladen
- Konfigurierbar: Wer darf Channels erstellen (Alle / Admins / Owners)

#### F-CH-03: Channel-Einstellungen
- Topic aendern (im Header sichtbar, Emoji erlaubt)
- Beschreibung aendern
- Benachrichtigungspraeferenzen pro Channel pro Nutzer:
  - Alle Nachrichten
  - Nur @-Erwaehnungen
  - Stummgeschaltet (Mute)
- Channel stummschalten: Erscheint abgeblendet, keine Benachrichtigungen
- Bookmarks-Leiste: Links und Dateien oben im Channel anpinnen (max. 100)

#### F-CH-04: Channel-Mitgliedschaft
- Beitreten: Oeffentliche frei, Private nur per Einladung
- Einladen: Jedes Mitglied (konfigurierbar)
- Entfernen: Channel-Ersteller, Admins, Owners
- Verlassen: Jederzeit moeglich (ausser #general)
- Default-Channel: #general ist Pflicht, weitere konfigurierbar
- Mitgliederliste mit Anzahl einsehbar

#### F-CH-05: Channel-Verwaltung
- **Archivieren:** Channel wird readonly, Nachrichten bleiben durchsuchbar, wiederherstellbar
- **Loeschen:** Dauerhaft, nur Owners (Nachrichten werden geloescht)
- **Konvertieren:** Oeffentlich ↔ Privat (nur Admins/Owners)
- **Umbenennen:** Moeglich, alte URL leitet um
- #general kann nicht archiviert, geloescht oder privatisiert werden

#### F-CH-06: Channel-Browser & Discovery
- Alle oeffentlichen Channels durchsuchbar
- Sortierung: Alphabetisch, Mitgliederzahl, Erstellungsdatum, Aktivitaet
- Vorschau vor dem Beitreten
- Tastenkuerzel: Cmd+Shift+L / Ctrl+Shift+L

---

### 4.4 Direktnachrichten (DMs)

#### F-DM-01: 1:1 Direktnachrichten
- Private Konversation zwischen zwei Personen
- Nicht durchsuchbar fuer Dritte
- Alle Nachrichtenfunktionen verfuegbar (Threads, Reaktionen, Dateien)

#### F-DM-02: Gruppen-DMs
- 3 bis maximal 9 Teilnehmer
- Automatisch nach Teilnehmern benannt (nicht umbenennbar)
- Teilnehmer nachtraeglich hinzufuegbar (bis Limit 9)
- Konvertierbar in privaten Channel
- Neue Teilnehmer sehen bisherige Historie

---

### 4.5 Nachrichten (Messaging)

#### F-MSG-01: Nachrichtenkomposition
- Rich-Text-Editor (WYSIWYG) umschaltbar ueber Aa-Button
- Maximale Nachrichtenlaenge: 40.000 Zeichen
- Compose-Button fuer laengere Nachrichten im separaten Editor

#### F-MSG-02: Textformatierung (mrkdwn)
| Syntax | Ergebnis |
|--------|----------|
| `*text*` | **Fett** |
| `_text_` | *Kursiv* |
| `~text~` | ~~Durchgestrichen~~ |
| `` `code` `` | `Inline-Code` |
| ```` ```code``` ```` | Code-Block (mehrzeilig) |
| `> text` | Blockquote |
| `1. text` | Geordnete Liste |
| `* text` | Ungeordnete Liste |

- Formatierungssymbolleiste: Bold, Italic, Strike, Code, Link, Listen, Blockquote
- Emoji-Picker: Smiley-Icon oder `:emoji-name:`
- @-Autocomplete bei `@`-Eingabe
- #-Channel-Referenz bei `#`-Eingabe

#### F-MSG-03: Nachrichtenbearbeitung
- Eigene Nachrichten nachtraeglich bearbeitbar
- "(bearbeitet)" Marker mit Zeitstempel sichtbar
- Bearbeitungshistorie nicht fuer andere sichtbar
- Admins koennen Zeitlimit setzen (unbegrenzt / 1 Min / 5 Min / 1 Std / 24 Std)
- Pfeil-nach-oben bearbeitet letzte eigene Nachricht

#### F-MSG-04: Nachrichtenloeschung
- Eigene Nachrichten loeschbar (konfigurierbar)
- Admins koennen alle Nachrichten loeschen
- Platzhalter: "Diese Nachricht wurde geloescht"
- Unsend: Innerhalb von 15 Sekunden rueckgaengig machbar (Cmd+Z)

#### F-MSG-05: Nachrichten-Pinning
- Nachrichten an Channel anpinnen
- Max. 100 Pins pro Channel
- Angepinnte Nachrichten im Channel-Details-Panel einsehbar
- System-Nachricht: "[User] hat eine Nachricht angepinnt"
- Alle Mitglieder koennen pinnen/entpinnen (konfigurierbar)

#### F-MSG-06: Nachrichten speichern (Saved Items / Later)
- Nachrichten fuer sich selbst bookmarken (privat)
- Drei Kategorien: In Progress, Completed, Archived
- Erinnerung auf gespeicherte Nachrichten setzen
- Zugriff ueber "Later"-Tab in der Sidebar

#### F-MSG-07: Nachrichten teilen / weiterleiten
- In andere Channels/DMs teilen als eingebettete Referenz
- Deep-Link zur Originalnachricht kopierbar
- Weiterleitung mit optionaler Notiz

#### F-MSG-08: Geplante Nachrichten
- Nachrichten fuer bestimmten Zeitpunkt planen
- Vordefinierte Zeiten (morgen 9 Uhr, Montag 9 Uhr) oder benutzerdefiniert
- Verwaltbar unter "Drafts & Sent" → "Scheduled"
- Vor dem Senden bearbeitbar/loeschbar

#### F-MSG-09: Entwuerfe (Drafts)
- Ungesendete Nachrichten automatisch als Draft gespeichert
- Geraeteuebergreifend synchronisiert
- Zugriff ueber "Drafts & Sent" → "Drafts"

#### F-MSG-10: System-Nachrichten
- Join/Leave: "[User] ist beigetreten/hat verlassen"
- Topic-Aenderungen
- Pin-Benachrichtigungen
- Ephemeral Messages: Nur fuer bestimmten Nutzer sichtbar

---

### 4.6 Threads

#### F-THR-01: Thread-Funktionalitaet
- Jede Nachricht kann einen Thread starten
- Thread-Antworten erscheinen nicht im Hauptkanal (Standard)
- Thread-Zaehler und Vorschau der letzten Antwort unter der Originalnachricht
- Threads im rechten Seitenpanel oeffenbar

#### F-THR-02: Thread-Benachrichtigungen
- Automatisch abonniert wenn: Thread gestartet, geantwortet, erwaehnt
- "Auch an Channel senden": Checkbox — postet Thread-Antwort zusaetzlich im Hauptkanal
- Pro Channel konfigurierbar: Alle Antworten / Nur Erwaehnungen / Keine
- Einzelne Threads stummschaltbar (Unfollow)

#### F-THR-03: Threads-Panel
- Zentraler Ueberblick ueber alle abonnierten Threads
- Sortierung: Neueste Antwort zuerst
- Ungelesene Thread-Antworten hervorgehoben
- Filterbar nach Channel

---

### 4.7 Reaktionen & Emoji

#### F-EMO-01: Emoji-Reaktionen
- Jede Nachricht kann mit Emoji-Reaktionen versehen werden
- Mehrere verschiedene Emoji pro Nachricht
- Zaehler bei gleichem Emoji durch mehrere Nutzer
- Hover zeigt: Wer reagiert hat (namentlich)
- Eigene Reaktionen farblich hervorgehoben
- Erneuter Klick entfernt eigene Reaktion

#### F-EMO-02: Schnellreaktionen
- Konfigurierbare Schnellreaktions-Emoji (Standard: 3 Emoji)
- Workspace-Admins koennen Standard-Schnellreaktionen festlegen
- Nutzer koennen eigene Schnellreaktionen definieren

#### F-EMO-03: Custom Emoji
- Workspace-Mitglieder koennen eigene Emoji hochladen
- Formate: PNG, JPG, GIF (animiert moeglich)
- Empfohlene Groesse: 128x128px, max. 256 KB
- Emoji-Name: Buchstaben, Zahlen, Bindestriche, Unterstriche
- Emoji-Aliase (mehrere Namen fuer ein Emoji)
- Emoji-Verwaltungsseite fuer Admins
- Konfigurierbar: Wer darf Custom Emoji hochladen

---

### 4.8 Erwaehnungen (@-Mentions)

#### F-MEN-01: Erwaehungstypen
- **@benutzername:** Desktop- und Mobile-Benachrichtigung
- **@here:** Nur aktive (online) Mitglieder des Channels
- **@channel:** Alle Mitglieder, unabhaengig vom Online-Status
- **@everyone:** Nur im #general-Channel, alle Workspace-Mitglieder
- **@gruppenname:** Alle Mitglieder der Benutzergruppe im Channel

#### F-MEN-02: Erwaehnungs-Berechtigungen
- Konfigurierbar: Wer darf @channel/@here/@everyone verwenden
- Warnhinweis bei grossen Channels (>23 Mitglieder)
- Bei >10.000 Mitgliedern: Nur Owners/Admins

---

### 4.9 Dateifreigabe

#### F-FILE-01: Datei-Upload
- Max. Dateigroesse: 1 GB
- Upload-Methoden: Drag & Drop (bis 10 Dateien), Plus-Icon, Clipboard Paste
- Alle Dateitypen unterstuetzt
- Optionaler Beschreibungstext pro Datei

#### F-FILE-02: Datei-Vorschau
- Bilder: Inline-Vorschau (max. 25.000px laengste Seite, max. 45 Mio. Pixel)
- PDFs: Inline-Vorschau
- MS Office: Vorschau bis 50 MB
- Audio/Video: Eingebetteter Player
- Code-Dateien: Syntax-Highlighting

#### F-FILE-03: Dateiverwaltung
- Zentrale Datei-Ansicht (Files-Tab)
- Filter nach Typ, Channel, Zeitraum
- Dateien loeschbar (vom Uploader oder Admins)
- Dateien koennen in mehreren Channels geteilt werden

#### F-FILE-04: Speicherplatz
- Konfigurierbar pro Installation (Standard: 10 GB pro Nutzer)
- Speicherverbrauch im Admin-Dashboard einsehbar

---

### 4.10 Suche

#### F-SEARCH-01: Globale Suche
- Durchsucht: Nachrichten, Dateien, Channels, Personen
- Ergebnis-Tabs: Nachrichten, Dateien, Channels, Personen
- Relevanz-basierte Sortierung (Standard) oder chronologisch
- Nur Inhalte aus zugaenglichen Channels/DMs

#### F-SEARCH-02: Such-Modifikatoren
| Modifikator | Funktion |
|-------------|----------|
| `from:@user` | Nachrichten von Nutzer |
| `in:#channel` | Nachrichten in Channel |
| `has:link` | Nachrichten mit Links |
| `has:file` | Nachrichten mit Dateien |
| `has:pin` | Angepinnte Nachrichten |
| `has:reaction` | Nachrichten mit Reaktionen |
| `has::emoji:` | Nachrichten mit bestimmter Reaktion |
| `is:saved` | Gespeicherte Nachrichten |
| `before:YYYY-MM-DD` | Vor Datum |
| `after:YYYY-MM-DD` | Nach Datum |
| `on:YYYY-MM-DD` | An Datum |
| `"exakte phrase"` | Exakte Phrasensuche |
| `wort*` | Wildcard |
| `-wort` | Ausschluss |

#### F-SEARCH-03: Meilisearch-Integration
- Nachrichten und Dateien werden in Meilisearch indexiert
- Typo-tolerante Suche
- Faceted Search fuer Filter (Channel, Person, Datum, Typ)
- Echtzeit-Indexierung bei neuen Nachrichten

---

### 4.11 Benachrichtigungen

#### F-NOT-01: Desktop-Benachrichtigungen
- Browser Notifications API (Web Push)
- Konfigurierbar: Alle Nachrichten / Nur Erwaehnungen / Aus
- Benachrichtigungston waehlbar (mehrere Optionen)
- Vorschau in der Benachrichtigung an/aus

#### F-NOT-02: Pro-Channel-Einstellungen
- Alle neuen Nachrichten / Nur Erwaehnungen / Stummgeschaltet
- Stummgeschaltete Channels: Nur direkte @-Erwaehnungen erzeugen Badge
- Konfigurierbar im Channel-Header

#### F-NOT-03: Keyword-Benachrichtigungen
- Benutzerdefinierte Keywords (z.B. "deploy", "bug", "review")
- Case-insensitive Matching
- Benachrichtigung bei jedem Treffer in beigetretenen Channels

#### F-NOT-04: Do Not Disturb (DND)
- DND-Zeitplan: Wochentage + Uhrzeiten (z.B. Mo-Fr 22:00-08:00)
- Manuelles Pausieren: 30 Min / 1 Std / 2 Std / Bis morgen / Benutzerdefiniert
- DND-Icon neben dem Namen sichtbar fuer andere
- "Trotzdem senden" fuer dringende Nachrichten (durchbricht DND einmal)

#### F-NOT-05: Badge-Zaehler
- Ungelesene Erwaehnungen als Zahl im Browser-Tab und Favicon
- Unterscheidung: Nur Erwaehnungen vs. alle ungelesenen
- Thread-Antworten optional vom Badge ausschliessen

---

### 4.12 Sidebar & Navigation

#### F-NAV-01: Sidebar-Struktur
- Workspace-Kopfzeile mit Name und Icon
- Suchleiste / Quick Switcher
- Navigations-Tabs: Home, DMs, Activity, Later
- Channel-Liste mit Ungelesen-Indikatoren
- DM-Liste

#### F-NAV-02: Sidebar-Sektionen
- Benutzerdefinierte Sektionen erstellbar
- Channels per Drag & Drop verschieben
- Sektionen kollabierbar
- Standard-Sektionen: Channels, Direktnachrichten
- Pro Sektion konfigurierbar: Sortierung (alphabetisch, Aktivitaet, Prioritaet)

#### F-NAV-03: Quick Switcher (Cmd+K)
- Schnellnavigation zu Channels, DMs, Personen
- Fuzzy-Suche
- Zuletzt verwendete Konversationen als Vorschlaege

#### F-NAV-04: Ungelesen-Anzeige
- Channels mit ungelesenen Nachrichten werden fett dargestellt
- Badge-Zaehler fuer @-Erwaehnungen
- "Alle gelesen markieren" fuer einzelne Channels oder alle
- Esc-Taste markiert aktuellen Channel als gelesen

---

### 4.13 Authentifizierung & Sicherheit

#### F-AUTH-01: E-Mail/Passwort-Login
- Registrierung mit E-Mail-Verifizierung
- Passwort-Anforderungen konfigurierbar (Mindestlaenge, Komplexitaet)
- Passwort-Zuruecksetzung per E-Mail

#### F-AUTH-02: Zwei-Faktor-Authentifizierung (2FA)
- TOTP (Authenticator-App)
- Backup-Codes bei Setup generiert
- Erzwingbar fuer alle Workspace-Mitglieder (durch Admin)

#### F-AUTH-03: Session-Management
- JWT Access Token (kurzlebig, 15 Min) + Refresh Token (langlebig, 30 Tage)
- Uebersicht aktiver Sessions (Geraet, IP, Zeitpunkt)
- Remote-Abmeldung einzelner Sessions
- Erzwungene Abmeldung aller Geraete

#### F-AUTH-04: Berechtigungssystem
- Konfigurierbare Berechtigungen (siehe Tabelle):

| Berechtigung | Standard | Einstellbar auf |
|-------------|----------|----------------|
| Channels erstellen | Alle | Alle / Admins / Owners |
| Channels archivieren | Admins | Alle / Admins / Owners |
| Mitglieder einladen | Admins | Alle / Admins |
| Gaeste einladen | Admins | Alle / Admins |
| Custom Emoji hochladen | Alle | Alle / Admins |
| @channel/@here verwenden | Alle | Alle / Admins |
| Nachrichten bearbeiten (Zeitlimit) | Unbegrenzt | Unbegrenzt / 1-5-30 Min / 1-24 Std |
| Nachrichten loeschen | Absender | Absender / Admins / Niemand |

---

### 4.14 Benutzergruppen (User Groups)

#### F-UG-01: Gruppenverwalung
- Name und Handle (z.B. `@engineering`)
- Beschreibung (optional)
- Mitglieder manuell hinzufuegen/entfernen
- Standard-Channels: Gruppenmitglieder werden automatisch hinzugefuegt

#### F-UG-02: Gruppen-Erwaehnungen
- `@handle` in Nachrichten erwaehnt alle Gruppenmitglieder
- Nur Mitglieder im jeweiligen Channel erhalten Benachrichtigung
- Konfigurierbar: Wer darf Gruppen erstellen (Alle / Admins)

---

## 5. Phase 2 — Kollaboration (Uebersicht)

> Detail-Pflichtenheft wird vor Phase-2-Start erstellt.

### 5.1 Huddles (Audio/Video)
- Spontane Audio-/Videoanrufe in Channels und DMs
- Bildschirmfreigabe
- Begleitender Text-Chat (Huddle Thread)
- Max. 50 Teilnehmer
- WebRTC-basiert

### 5.2 Canvas (Dokumente)
- Kollaborative Dokumente in Channels
- Echtzeit-Co-Editing
- Elemente: Text, Listen, Checklisten, Code-Bloecke, Bilder, Tabellen
- Versionshistorie

### 5.3 Clips (Audio-/Videonachrichten)
- Kurze Audio-/Video-Aufnahmen (max. 5 Min)
- Automatische Transkription
- Inline-Wiedergabe mit Geschwindigkeitskontrolle

### 5.4 Listen (Task-Tracking)
- Strukturierte Listen mit konfigurierbaren Feldern
- Status, Zuweisung, Faelligkeitsdatum, Prioritaet
- Tabellen- und Kanban-Ansicht
- Integration mit Workflow Builder

### 5.5 Slash-Befehle & Erinnerungen
- Eingebaute Befehle: /remind, /status, /mute, /topic, etc.
- Custom Slash Commands via App-API
- Erinnerungen: fuer sich selbst, andere Nutzer, Channels
- Wiederkehrende Erinnerungen

### 5.6 Geplante Nachrichten (erweitert)
- Wiederkehrende geplante Nachrichten
- Geplante Nachrichten in Threads

---

## 6. Phase 3 — Automation & Enterprise (Uebersicht)

> Detail-Pflichtenheft wird vor Phase-3-Start erstellt.

### 6.1 Workflow Builder
- No-Code-Automationen mit Trigger + Steps
- Trigger: Channel-Nachricht, Emoji, Webhook, Zeitplan, Shortcut
- Steps: Nachricht senden, Formular, Channel erstellen, HTTP Request, Bedingung
- Variablen und bedingte Verzweigungen

### 6.2 Webhook-System
- Incoming Webhooks: HTTP-Endpoint pro Channel
- Outgoing Webhooks: Trigger-Wort → HTTP-Callback
- Rate Limiting: 1 Nachricht/Sekunde

### 6.3 App/Bot-Framework & API
- REST API (Web API) fuer CRUD-Operationen
- Events API (Webhook-basiert oder Socket Mode)
- Bot-User mit eigenem Token und Profil
- Granulare Scopes/Berechtigungen
- Interactive Messages (Buttons, Menus, Modals)
- Block Kit UI-Framework

### 6.4 AI-Features
- Thread-/Channel-Zusammenfassungen
- Natuerlichsprachliche Suche
- Recaps bei laengerer Abwesenheit
- LLM-Integration (Claude API)

### 6.5 Compliance & Datenmanagement
- Nachrichten-Aufbewahrungsrichtlinien (Retention)
- Datenexport (JSON, alle Channels/DMs)
- Audit-Logs fuer administrative Aktionen
- 2FA-Pflicht

### 6.6 SSO/SAML
- SAML 2.0 Single Sign-On
- SCIM User Provisioning
- Session-Duration konfigurierbar

### 6.7 Analytics & Reporting
- Nachrichten pro Tag/Woche/Monat
- Aktive Mitglieder
- Channel-Nutzung
- CSV-Export

---

## 7. Nicht-funktionale Anforderungen

### 7.1 Performance

| Metrik | Zielwert |
|--------|----------|
| Nachrichtenzustellung (Echtzeit) | < 200ms (WebSocket) |
| API-Antwortzeit (95. Perzentil) | < 300ms |
| Seitenlade-Zeit (Initial Load) | < 2s |
| Suche (Meilisearch) | < 50ms |
| Max. gleichzeitige WebSocket-Verbindungen | 10.000+ pro Instanz |
| Max. Nachrichten pro Channel (Laden) | 50 pro Seite, Infinite Scroll |

### 7.2 Skalierbarkeit

- Horizontale Skalierung des Backends ueber mehrere Instanzen
- Redis Pub/Sub fuer WebSocket-Synchronisation zwischen Instanzen
- Meilisearch als separater Service skalierbar
- S3 fuer Dateispeicher entkoppelt
- Datenbankverbindungs-Pooling (pgBouncer bei Bedarf)

### 7.3 Sicherheit

- HTTPS erzwungen (Caddy mit automatischem Let's Encrypt)
- Passwort-Hashing: bcrypt mit Work Factor ≥ 12
- CSRF-Schutz
- Rate Limiting: Login-Versuche (max. 5 pro Minute), API (100 Requests/Minute pro User)
- Input-Sanitisierung gegen XSS
- SQL-Injection-Schutz durch ORM (TypeORM/Prisma)
- File-Upload: Virenscanning optional, Dateityp-Validierung
- WebSocket-Authentifizierung per JWT

### 7.4 Verfuegbarkeit

- Ziel: 99,9% Uptime
- Health-Check-Endpoints fuer Monitoring
- Graceful Shutdown bei Deployments
- Automatischer Reconnect bei WebSocket-Unterbrechung
- Offline-Entwuerfe im Frontend (lokaler Speicher)

### 7.5 Datenschutz

- Alle Daten auf eigenem Server (Self-Hosted)
- Keine Telemetrie an Dritte
- Nutzer-Daten exportierbar (DSGVO-konform)
- Nutzer-Daten loeschbar auf Anfrage
- Verschluesselung at rest (Datenbank) und in transit (TLS)

### 7.6 Barrierefreiheit

- WCAG 2.1 AA angestrebt
- Vollstaendige Tastaturnavigation
- Screen-Reader-kompatibel (ARIA-Labels)
- Dark Mode
- Konfigurierbare Schriftgroesse

### 7.7 Internationalisierung (i18n)

- Unterstuetzte Sprachen: Deutsch, Englisch
- Nutzer waehlt Sprache individuell
- Alle UI-Texte ueber Sprachdateien
- Datums-/Zeitformate an Locale angepasst
- Zeitzonen-Support (pro Nutzer)

---

## 8. Echtzeit-Architektur

### 8.1 WebSocket-Gateway

```
Client (Browser)
    ↕ WebSocket (Socket.IO)
NestJS Gateway
    ↕ Redis Pub/Sub
NestJS Gateway (Instanz 2, 3, ...)
```

### 8.2 Events ueber WebSocket

| Event | Richtung | Beschreibung |
|-------|----------|--------------|
| `message:new` | Server → Client | Neue Nachricht in Channel/DM |
| `message:update` | Server → Client | Nachricht bearbeitet |
| `message:delete` | Server → Client | Nachricht geloescht |
| `reaction:add` | Server → Client | Reaktion hinzugefuegt |
| `reaction:remove` | Server → Client | Reaktion entfernt |
| `typing:start` | Client → Server → Clients | Nutzer tippt |
| `typing:stop` | Client → Server → Clients | Nutzer hat aufgehoert zu tippen |
| `presence:update` | Server → Client | Praesenz-Aenderung |
| `channel:update` | Server → Client | Channel-Einstellungen geaendert |
| `member:join` | Server → Client | Nutzer beigetreten |
| `member:leave` | Server → Client | Nutzer hat verlassen |
| `thread:reply` | Server → Client | Neue Thread-Antwort |
| `notification` | Server → Client | Benachrichtigung (Erwaehnung etc.) |

### 8.3 Typing-Indikator

- Client sendet `typing:start` bei Tasteneingabe
- Debounce: Max. 1 Event pro 3 Sekunden
- Automatisches `typing:stop` nach 5 Sekunden Inaktivitaet
- Anzeige: "[User] tippt..." unterhalb des Nachrichtenfelds
- Bei mehreren: "[User1] und [User2] tippen..."
- Bei >2: "Mehrere Personen tippen..."

### 8.4 Unread-Tracking

- Server speichert `last_read_timestamp` pro Nutzer pro Channel
- Bei Nachrichtenempfang: Vergleich mit `last_read_timestamp`
- Client sendet `mark_read` Event beim Oeffnen eines Channels
- Ungelesene Zaehler werden in Echtzeit aktualisiert

---

## 9. Datenmodell (Phase 1)

### 9.1 Kern-Entitaeten

```
workspace
├── id (UUID)
├── name
├── slug
├── icon_url
├── settings (JSONB)
└── created_at

user
├── id (UUID)
├── workspace_id (FK)
├── email (unique per workspace)
├── password_hash
├── display_name
├── full_name
├── title
├── phone
├── timezone
├── avatar_url
├── status_text
├── status_emoji
├── status_expiration
├── presence (active/away/dnd)
├── role (primary_owner/owner/admin/member/guest)
├── guest_type (single_channel/multi_channel, nullable)
├── is_active (boolean)
├── last_active_at
├── two_factor_enabled
└── created_at

channel
├── id (UUID)
├── workspace_id (FK)
├── name (unique per workspace)
├── type (public/private)
├── topic
├── description
├── created_by (FK user)
├── is_archived
├── is_default
├── posting_permission (everyone/admins/specific)
└── created_at

channel_member
├── channel_id (FK)
├── user_id (FK)
├── notification_preference (all/mentions/mute)
├── last_read_at (timestamp)
└── joined_at

message
├── id (UUID)
├── channel_id (FK, nullable — null fuer DMs)
├── dm_conversation_id (FK, nullable)
├── thread_parent_id (FK message, nullable)
├── user_id (FK)
├── content (text — mrkdwn)
├── content_rendered (text — HTML, cached)
├── is_edited
├── edited_at
├── is_deleted
├── is_pinned
├── also_sent_to_channel (boolean, fuer Thread-Antworten)
├── scheduled_at (nullable)
├── is_system_message
├── system_message_type
└── created_at

dm_conversation
├── id (UUID)
├── workspace_id (FK)
├── is_group (boolean)
└── created_at

dm_participant
├── dm_conversation_id (FK)
├── user_id (FK)
├── last_read_at
└── joined_at

reaction
├── id (UUID)
├── message_id (FK)
├── user_id (FK)
├── emoji_code (text — z.B. ":thumbsup:" oder ":custom-emoji:")
└── created_at
UNIQUE(message_id, user_id, emoji_code)

file_attachment
├── id (UUID)
├── message_id (FK)
├── user_id (FK)
├── filename
├── original_filename
├── mime_type
├── size_bytes
├── storage_key (S3 key)
├── thumbnail_key (nullable)
├── width (nullable, fuer Bilder)
├── height (nullable)
├── description
└── created_at

custom_emoji
├── id (UUID)
├── workspace_id (FK)
├── name (unique per workspace)
├── image_url
├── uploaded_by (FK user)
├── alias_for (FK custom_emoji, nullable)
└── created_at

user_group
├── id (UUID)
├── workspace_id (FK)
├── name
├── handle (unique per workspace)
├── description
├── created_by (FK user)
└── created_at

user_group_member
├── user_group_id (FK)
├── user_id (FK)
└── added_at

channel_bookmark
├── id (UUID)
├── channel_id (FK)
├── title
├── url (nullable)
├── file_id (FK file_attachment, nullable)
├── emoji
├── sort_order
├── created_by (FK user)
└── created_at

saved_item
├── id (UUID)
├── user_id (FK)
├── message_id (FK, nullable)
├── file_id (FK, nullable)
├── status (in_progress/completed/archived)
├── remind_at (nullable)
└── created_at

notification
├── id (UUID)
├── user_id (FK)
├── type (mention/reaction/thread_reply/channel_invite/system)
├── message_id (FK, nullable)
├── channel_id (FK, nullable)
├── actor_id (FK user — wer die Aktion ausgeloest hat)
├── is_read
└── created_at

user_session
├── id (UUID)
├── user_id (FK)
├── refresh_token_hash
├── device_info
├── ip_address
├── last_active_at
├── expires_at
└── created_at

workspace_settings (JSONB in workspace oder separate Tabelle)
├── default_channels[]
├── who_can_create_channels
├── who_can_archive_channels
├── who_can_invite_members
├── who_can_invite_guests
├── who_can_upload_emoji
├── who_can_use_at_channel
├── message_edit_window
├── message_delete_policy
├── require_2fa
├── allowed_email_domains[]
├── invitation_approval_required
└── dnd_default_schedule

custom_profile_field
├── id (UUID)
├── workspace_id (FK)
├── label
├── type (text/link/date/options/paragraph)
├── options (JSONB, nullable)
├── is_required
├── sort_order
└── created_at

user_profile_value
├── user_id (FK)
├── field_id (FK custom_profile_field)
├── value (text)
└── updated_at
```

---

## 10. API-Uebersicht (Phase 1)

### 10.1 REST API Endpoints

#### Auth
- `POST /auth/register` — Registrierung
- `POST /auth/login` — Login (JWT)
- `POST /auth/refresh` — Token erneuern
- `POST /auth/logout` — Logout (Session invalidieren)
- `POST /auth/forgot-password` — Passwort-Reset anfordern
- `POST /auth/reset-password` — Passwort zuruecksetzen
- `POST /auth/2fa/enable` — 2FA aktivieren
- `POST /auth/2fa/verify` — 2FA verifizieren

#### Users
- `GET /users` — Mitgliederliste
- `GET /users/:id` — Nutzerprofil
- `PATCH /users/me` — Eigenes Profil bearbeiten
- `PATCH /users/me/status` — Status setzen
- `PATCH /users/me/presence` — Praesenz setzen
- `GET /users/me/sessions` — Aktive Sessions
- `DELETE /users/me/sessions/:id` — Session beenden

#### Channels
- `GET /channels` — Channel-Liste
- `POST /channels` — Channel erstellen
- `GET /channels/:id` — Channel-Details
- `PATCH /channels/:id` — Channel bearbeiten
- `DELETE /channels/:id` — Channel loeschen
- `POST /channels/:id/archive` — Archivieren
- `POST /channels/:id/unarchive` — Dearchivieren
- `GET /channels/:id/members` — Mitglieder
- `POST /channels/:id/members` — Mitglied hinzufuegen
- `DELETE /channels/:id/members/:userId` — Mitglied entfernen
- `POST /channels/:id/join` — Beitreten
- `POST /channels/:id/leave` — Verlassen

#### Messages
- `GET /channels/:id/messages` — Nachrichten laden (Pagination)
- `POST /channels/:id/messages` — Nachricht senden
- `PATCH /messages/:id` — Nachricht bearbeiten
- `DELETE /messages/:id` — Nachricht loeschen
- `POST /messages/:id/pin` — Pinnen
- `DELETE /messages/:id/pin` — Entpinnen
- `GET /messages/:id/thread` — Thread-Antworten laden
- `POST /messages/:id/thread` — Thread-Antwort senden

#### DMs
- `GET /dms` — DM-Konversationen
- `POST /dms` — DM starten (1:1 oder Gruppe)
- `GET /dms/:id/messages` — Nachrichten laden
- `POST /dms/:id/messages` — Nachricht senden

#### Reactions
- `POST /messages/:id/reactions` — Reaktion hinzufuegen
- `DELETE /messages/:id/reactions/:emoji` — Reaktion entfernen

#### Files
- `POST /files/upload` — Datei hochladen (Multipart)
- `GET /files/:id` — Datei-Metadaten
- `GET /files/:id/download` — Datei herunterladen
- `DELETE /files/:id` — Datei loeschen

#### Search
- `GET /search` — Globale Suche (q, filters)

#### Emoji
- `GET /emoji` — Custom Emoji auflisten
- `POST /emoji` — Custom Emoji hochladen
- `DELETE /emoji/:id` — Custom Emoji loeschen

#### User Groups
- `GET /user-groups` — Gruppen auflisten
- `POST /user-groups` — Gruppe erstellen
- `PATCH /user-groups/:id` — Gruppe bearbeiten
- `DELETE /user-groups/:id` — Gruppe loeschen
- `POST /user-groups/:id/members` — Mitglied hinzufuegen
- `DELETE /user-groups/:id/members/:userId` — Mitglied entfernen

#### Notifications
- `GET /notifications` — Benachrichtigungen laden
- `POST /notifications/mark-read` — Als gelesen markieren

#### Workspace
- `GET /workspace` — Workspace-Info
- `PATCH /workspace` — Workspace bearbeiten (Admin)
- `POST /workspace/invite` — Einladung senden
- `GET /workspace/invitations` — Einladungen auflisten

---

## 11. Deployment

### 11.1 Docker Compose (Produktion)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: chat
      POSTGRES_USER: chat
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  meilisearch:
    image: getmeili/meilisearch:v1.7
    volumes:
      - meili_data:/meili_data
    environment:
      MEILI_MASTER_KEY: ${MEILI_KEY}

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    environment:
      MINIO_ROOT_USER: ${MINIO_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}

  backend:
    build: ./packages/backend
    depends_on: [postgres, redis, meilisearch, minio]
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://chat:${DB_PASSWORD}@postgres:5432/chat
      REDIS_URL: redis://redis:6379
      MEILI_URL: http://meilisearch:7700
      MEILI_KEY: ${MEILI_KEY}
      S3_ENDPOINT: http://minio:9000
      JWT_SECRET: ${JWT_SECRET}

  frontend:
    build: ./packages/frontend
    depends_on: [backend]
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: ${API_URL}
      NEXT_PUBLIC_WS_URL: ${WS_URL}

  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
```

### 11.2 Mindest-Systemanforderungen

| Ressource | Minimum | Empfohlen |
|-----------|---------|-----------|
| CPU | 2 Kerne | 4 Kerne |
| RAM | 4 GB | 8 GB |
| Speicher | 20 GB SSD | 100 GB SSD |
| Nutzer | bis 100 | bis 1.000 |

---

## 12. Abnahmekriterien Phase 1

Die Phase 1 gilt als abgeschlossen, wenn folgende Szenarien funktionieren:

1. **Workspace erstellen:** Admin kann Workspace anlegen, Icon setzen, erste Nutzer einladen
2. **Registrierung & Login:** Nutzer kann sich registrieren, einloggen, 2FA aktivieren
3. **Channel-Workflow:** Channel erstellen, beitreten, Nachrichten senden, Topic setzen, archivieren
4. **Messaging:** Nachrichten mit Formatierung senden, bearbeiten, loeschen, pinnen
5. **Threading:** Thread starten, antworten, "auch an Channel senden", Thread-Panel nutzen
6. **DMs:** 1:1 DM und Gruppen-DM (bis 9) erstellen und nutzen
7. **Reaktionen:** Emoji-Reaktion hinzufuegen/entfernen, Custom Emoji hochladen
8. **Dateien:** Datei hochladen (Drag & Drop), Vorschau, herunterladen
9. **Suche:** Nachrichten und Dateien finden mit Modifikatoren (from:, in:, has:, before:)
10. **Benachrichtigungen:** Desktop-Push bei @-Erwaehnung, DND funktioniert, pro-Channel stummschaltbar
11. **Praesenz:** Online/Offline-Status in Echtzeit, Custom Status mit Ablauf
12. **Berechtigungen:** Rollen funktionieren, Gaeste sehen nur zugewiesene Channels
13. **Echtzeit:** Nachrichten erscheinen sofort bei allen Teilnehmern, Typing-Indikator funktioniert
14. **Performance:** Nachrichtenzustellung < 200ms, Seitenlade < 2s

---

*Erstellt am 13.04.2026 — Grundlage fuer die Entwicklung der eigenstaendigen Chat-Plattform.*
