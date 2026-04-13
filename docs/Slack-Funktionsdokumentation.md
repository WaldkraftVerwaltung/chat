# Slack — Vollstandige Funktionsdokumentation

> **Zweck:** Diese Dokumentation beschreibt samtliche Slack-Funktionen im Detail, um als Grundlage fur ein Pflichtenheft zur Entwicklung einer eigenstandigen Messaging-/Kollaborationsplattform zu dienen.
>
> **Stand:** April 2026

---

## Inhaltsverzeichnis

1. [Channels & Konversationen](#1-channels--konversationen)
2. [Direktnachrichten (DMs)](#2-direktnachrichten-dms)
3. [Nachrichten & Messaging](#3-nachrichten--messaging)
4. [Threads (Antwort-Strange)](#4-threads-antwort-strange)
5. [Reaktionen & Emoji](#5-reaktionen--emoji)
6. [Erwaehnungen & Benachrichtigungen](#6-erwaehnungen--benachrichtigungen)
7. [Dateifreigabe & Medien](#7-dateifreigabe--medien)
8. [Suche](#8-suche)
9. [Sidebar & Navigation](#9-sidebar--navigation)
10. [Benutzerprofil & Praesenz](#10-benutzerprofil--praesenz)
11. [Huddles (Audio/Video)](#11-huddles-audiovideo)
12. [Canvas (Dokumente)](#12-canvas-dokumente)
13. [Clips (Audio-/Videonachrichten)](#13-clips-audiovideo-nachrichten)
14. [Listen (Task-Tracking)](#14-listen-task-tracking)
15. [Workflow Builder & Automationen](#15-workflow-builder--automationen)
16. [Apps, Bots & Integrationen](#16-apps-bots--integrationen)
17. [Slash-Befehle](#17-slash-befehle)
18. [Slack API & Block Kit](#18-slack-api--block-kit)
19. [Workspace-Verwaltung & Administration](#19-workspace-verwaltung--administration)
20. [Benutzer- & Rollenverwaltung](#20-benutzer---rollenverwaltung)
21. [Berechtigungen & Zugriffssteuerung](#21-berechtigungen--zugriffssteuerung)
22. [Benutzergruppen (User Groups)](#22-benutzergruppen-user-groups)
23. [Authentifizierung & Sicherheit](#23-authentifizierung--sicherheit)
24. [Compliance & Datenmanagement](#24-compliance--datenmanagement)
25. [Slack Connect (externe Zusammenarbeit)](#25-slack-connect-externe-zusammenarbeit)
26. [Enterprise Grid](#26-enterprise-grid)
27. [Slack AI](#27-slack-ai)
28. [Analytics & Reporting](#28-analytics--reporting)
29. [Tastenkuerzel & Navigation](#29-tastenkuerzel--navigation)
30. [Mobile App](#30-mobile-app)
31. [Desktop App](#31-desktop-app)
32. [Barrierefreiheit](#32-barrierefreiheit)
33. [Plaene & Feature-Abgrenzung](#33-plaene--feature-abgrenzung)

---

## 1. Channels & Konversationen

### 1.1 Channel-Typen

- **Oeffentliche Channels (Public Channels)**
  - Sichtbar fuer alle Workspace-Mitglieder im Channel-Browser
  - Jedes Mitglied kann beitreten ohne Einladung
  - Nachrichten-Historie ist fuer alle sichtbar, auch vor dem Beitrittszeitpunkt
  - Gesamte Nachrichtenhistorie durchsuchbar fuer alle Workspace-Mitglieder
  - Icon: Raute (#)

- **Private Channels**
  - Nur fuer eingeladene Mitglieder sichtbar
  - Erscheinen nicht im Channel-Browser fuer Nicht-Mitglieder
  - Nachrichten nur fuer Mitglieder durchsuchbar
  - Koennen nicht in oeffentliche Channels zurueckkonvertiert werden (Einschraenkung je nach Plan)
  - Icon: Schloss
  - Auf Business+ und Enterprise: Admins koennen Channels zwischen oeffentlich/privat konvertieren

- **Shared Channels (Slack Connect)**
  - Channels, die mit externen Organisationen geteilt werden
  - Koennen oeffentlich oder privat sein (innerhalb der eigenen Org)
  - Verfuegbar ab Pro-Plan
  - Bis zu 250 Organisationen pro Shared Channel (Enterprise Grid)

- **Ankuendigungs-Channels (Read-Only / Announcement)**
  - Posting-Berechtigungen auf bestimmte Nutzer/Gruppen beschraenkt
  - Andere Mitglieder koennen nur lesen und mit Reaktionen/Threads antworten
  - Konfigurierbar ueber Channel-Posting-Berechtigungen

### 1.2 Channel-Erstellung

- Name: max. 80 Zeichen, Kleinbuchstaben, Zahlen, Bindestriche erlaubt
- Naming-Konventionen empfohlen (z.B. `team-`, `proj-`, `help-`)
- Beschreibung/Purpose: max. 250 Zeichen — erklaert den Zweck des Channels
- Topic: max. 250 Zeichen — wird oben im Channel angezeigt, aenderbar fuer aktuelle Themen
- Privat/Oeffentlich wird bei Erstellung gewaehlt
- Optional: Sofort Mitglieder einladen
- Admins koennen einschraenken, wer Channels erstellen darf

### 1.3 Channel-Einstellungen

- **Topic:** Wird im Channel-Header angezeigt, kann Links und Emoji enthalten, aenderbar durch alle Mitglieder (sofern Berechtigungen es erlauben)
- **Beschreibung (Description/Purpose):** Statischer Beschreibungstext, sichtbar in Channel-Details und beim Durchsuchen
- **Benachrichtigungspraeferenzen pro Channel:**
  - Alle Nachrichten
  - Nur Erwaehnungen (@mentions)
  - Nichts (stummgeschaltet)
  - Konfigurierbar: Desktop-Benachrichtigung, Mobile-Benachrichtigung, E-Mail-Zusammenfassung
- **Mute Channel:** Channel stummschalten — erscheint abgeblendet, keine Benachrichtigungen
- **Bookmarks Bar:** Leiste oben im Channel fuer angepinnte Links und Dateien

### 1.4 Channel-Verwaltung

- **Archivieren:** Channel wird readonly, Nachrichten bleiben durchsuchbar, kann von Admins wiederhergestellt werden
- **Loeschen:** Entfernt den Channel und alle Nachrichten dauerhaft (nur Workspace-Owner)
- **Konvertierung:**
  - Oeffentlich → Privat: Moeglich (Business+/Enterprise mit Admin-Tools)
  - Privat → Oeffentlich: Moeglich, aber Dateien werden ebenfalls oeffentlich und bleiben es auch bei Rueckkonvertierung
  - #general kann nicht privat gemacht werden
- **Umbenennen:** Moeglich, aendert die URL, alte Links leiten um

### 1.5 Channel-Mitgliedschaft

- Beitreten: Oeffentliche Channels frei beitretbar, private nur per Einladung
- Einladen: Jedes Mitglied kann andere einladen (sofern Berechtigungen es erlauben)
- Entfernen: Channel-Ersteller und Admins koennen Mitglieder entfernen
- Verlassen: Jedes Mitglied kann jeden Channel verlassen (ausser #general)
- **Default-Channels:** #general ist Pflicht fuer alle neuen Mitglieder; weitere Default-Channels koennen konfiguriert werden
- Gaeste koennen auf bestimmte Channels beschraenkt werden

### 1.6 Channel-Browser & Discovery

- Alle oeffentlichen Channels durchsuchbar
- Sortierung: Alphabetisch, nach Mitgliederzahl, nach Erstellungsdatum, empfohlen
- Filter: Nur Channels mit Beschreibung, bestimmte Praefix-Konventionen
- Channel-Vorschlaege basierend auf Team-Mitgliedschaft und Aktivitaet

### 1.7 Sidebar-Sektionen (Channel-Kategorien)

- Nutzer koennen eigene Sektionen/Kategorien in der Sidebar erstellen
- Channels per Drag & Drop in Sektionen verschieben
- Sektionen sind kollabierbar
- Standard-Sektionen: Favoriten (Starred), Channels, Direktnachrichten, Apps
- Automatische Sortierung: Ungelesene zuerst, alphabetisch, nach Prioritaet

---

## 2. Direktnachrichten (DMs)

### 2.1 1:1 Direktnachrichten

- Private Konversation zwischen genau zwei Personen
- Erscheinen in der Sidebar unter "Direktnachrichten"
- Nicht durchsuchbar fuer andere Workspace-Mitglieder
- Koennen nicht archiviert oder geloescht werden (einzelne Nachrichten schon)
- Unterstuetzen alle Nachrichtenformate (Dateien, Threads, Reaktionen)

### 2.2 Gruppen-DMs (Group Direct Messages)

- Konversation zwischen 3 bis maximal 9 Personen
- Haben keinen Namen (werden nach Teilnehmern benannt)
- Koennen nicht umbenannt werden
- Teilnehmer koennen hinzugefuegt werden (neue Teilnehmer sehen die bisherige Historie)
- Koennen in einen privaten Channel konvertiert werden (ab 10 Teilnehmern erforderlich)
- Kein Topic oder Beschreibung
- Keine Channel-spezifischen Benachrichtigungseinstellungen

### 2.3 Unterschiede DM vs. Channel

| Eigenschaft | Channel | DM / Gruppen-DM |
|-------------|---------|------------------|
| Max. Teilnehmer | Unbegrenzt | 9 (Gruppen-DM) |
| Topic/Beschreibung | Ja | Nein |
| Archivierbar | Ja | Nein |
| Durchsuchbar von Dritten | Oeffentl.: Ja | Nein |
| Bookmark-Leiste | Ja | Nein |
| Konvertierbar | Oeffentl. ↔ Privat | DM → Channel |
| Apps/Bots | Ja | Eingeschraenkt |
| Posting-Berechtigungen | Konfigurierbar | Alle koennen posten |

---

## 3. Nachrichten & Messaging

### 3.1 Nachrichtenkomposition

- **Rich-Text-Editor (WYSIWYG):** Umschaltbar ueber Aa-Button im Nachrichtenfeld
- **Markdown-aehnliche Syntax (mrkdwn):**
  - **Fett:** `*text*` (Sternchen, NICHT `**text**`)
  - **Kursiv:** `_text_` (Unterstriche)
  - **Durchgestrichen:** `~text~` (Tilden)
  - **Inline-Code:** `` `code` `` (Backticks)
  - **Code-Block:** ` ```code``` ` (Drei Backticks, mehrzeilig)
  - **Blockquote:** `> text` (Groesser-als-Zeichen)
  - **Sortierte Liste:** `1. text` (Zahl + Punkt + Leerzeichen)
  - **Unsortierte Liste:** `* text` oder `- text`
- **Formatierungssymbolleiste:** Bold, Italic, Strike, Code, Link, Sortierte/Unsortierte Liste, Blockquote, Code-Block
- Emoji-Picker: Zugang ueber Smiley-Icon oder `:emoji-name:`
- @-Erwaehnung: Autocomplete bei Eingabe von `@`
- #-Channel-Referenz: Autocomplete bei Eingabe von `#`

### 3.2 Nachrichtenbearbeitung

- Nachrichten koennen nachtraeglich bearbeitet werden
- Bearbeitete Nachrichten zeigen "(bearbeitet)" mit Zeitstempel
- Bearbeitungshistorie ist nicht fuer andere sichtbar (nur "bearbeitet"-Marker)
- Bearbeitungsfenster: Standardmaessig unbegrenzt, Admins koennen Zeitlimit setzen
- Admins koennen Bearbeitung ganz deaktivieren

### 3.3 Nachrichtenloeschung

- Nachrichten koennen vom Absender geloescht werden
- Admins koennen alle Nachrichten loeschen
- Geloeschte Nachricht: "Diese Nachricht wurde geloescht" (Platzhalter sichtbar)
- Dateien werden separat von Nachrichten geloescht
- Compliance-Export kann geloeschte Nachrichten trotzdem enthalten (Enterprise)

### 3.4 Nachrichten-Pinning

- Nachrichten koennen an einen Channel angepinnt werden
- Max. 100 angepinnte Nachrichten pro Channel
- Angepinnte Nachrichten sind ueber das Channel-Details-Panel einsehbar
- System-Nachricht wird gepostet: "[User] hat eine Nachricht angepinnt"
- Alle Channel-Mitglieder koennen Nachrichten anpinnen/entpinnen

### 3.5 Nachrichten-Bookmarking / Speichern (Saved Items)

- Jeder Nutzer kann Nachrichten fuer sich selbst speichern/bookmarken
- Gespeicherte Nachrichten erscheinen unter "Saved Items" / "Spaeter"
- Private Funktion — andere sehen nicht, was gespeichert wurde
- Nachrichten, Dateien und Threads koennen gespeichert werden
- Filter: Nach Channel, Datum, Typ

### 3.6 Nachrichten teilen / weiterleiten

- Nachrichten koennen in andere Channels/DMs geteilt werden
- Geteilte Nachrichten erscheinen als eingebettete Referenz mit Vorschau
- Link zur Originalnachricht wird mitgeliefert
- "Nachricht kopieren" erstellt einen Deep-Link zur Nachricht

### 3.7 Geplante Nachrichten (Scheduled Messages)

- Nachrichten koennen fuer einen bestimmten Zeitpunkt geplant werden
- Geplante Nachrichten erscheinen unter "Geplant" im Nachrichtenfeld
- Koennen vor dem Senden bearbeitet oder geloescht werden
- Zeitauswahl: Manuell oder Vorschlaege (morgen 9 Uhr, Montag 9 Uhr, etc.)
- Funktioniert in Channels und DMs

### 3.8 Nachrichtenentwuerfe (Drafts)

- Ungesendete Nachrichten werden automatisch als Entwuerfe gespeichert
- Entwuerfe sind ueber "Drafts & Sent" zugaenglich
- Pro Konversation wird ein Entwurf gespeichert
- Geraeteuebergreifend synchronisiert
- Entwuerfe koennen auch Thread-Antworten enthalten

### 3.9 System-/Bot-Nachrichten

- Join/Leave-Nachrichten: "[User] ist dem Channel beigetreten/hat den Channel verlassen"
- Topic-Aenderungen: "[User] hat das Thema geaendert"
- Pin-Benachrichtigungen
- Integration-/Bot-Nachrichten mit speziellem Layout (Attachments, Blocks)
- Ephemeral Messages: Nur fuer einen bestimmten Nutzer sichtbar (z.B. Slash-Command-Antworten)

---

## 4. Threads (Antwort-Straenge)

### 4.1 Grundkonzept

- Jede Nachricht kann einen Thread starten
- Thread-Antworten erscheinen nicht im Hauptkanal (ausser "Auch an Channel senden")
- Thread-Zaehler und Vorschau der letzten Antwort werden unter der Originalnachricht angezeigt
- Threads koennen im rechten Seitenpanel oder als eigene Ansicht geoeffnet werden

### 4.2 Thread-Benachrichtigungen

- **Automatisch abonniert wenn:**
  - Man den Thread gestartet hat (Originalnachricht)
  - Man im Thread geantwortet hat
  - Man im Thread erwaehnt wurde (@mention)
- **"Auch an #channel senden":** Checkbox beim Antworten — sendet die Thread-Antwort zusaetzlich als Nachricht in den Hauptkanal
- **Thread-Benachrichtigungen pro Channel konfigurierbar:**
  - Ueber alle Antworten benachrichtigt werden
  - Nur bei Erwaehnung
  - Keine Benachrichtigungen
- **Unfollow Thread:** Einzelne Threads koennen stummgeschaltet werden

### 4.3 Threads-Panel (Alle Threads)

- Zentraler Ueberblick ueber alle Threads, an denen man beteiligt ist
- Sortierung: Neueste Antwort zuerst
- Zeigt ungelesene Thread-Antworten
- Filterable nach Channel
- Zugang ueber Sidebar oder Tastenkuerzel

### 4.4 Thread-Details

- Jeder Thread zeigt: Originalnachricht, alle Antworten, Teilnehmer
- Dateien und Reaktionen innerhalb von Threads moeglich
- Thread-Antworten unterstuetzen alle Formatierungen wie Hauptnachrichten
- Threads koennen nicht verschoben oder in andere Channels migriert werden

---

## 5. Reaktionen & Emoji

### 5.1 Emoji-Reaktionen

- Jede Nachricht kann mit Emoji-Reaktionen versehen werden
- Mehrere verschiedene Emoji pro Nachricht moeglich
- Mehrere Nutzer koennen das gleiche Emoji reagieren (Zaehler erhoehen)
- Hovern ueber eine Reaktion zeigt: Wer reagiert hat (namentlich, bei wenigen Reaktionen alle, sonst "+X weitere")
- Reaktionen des eigenen Nutzers werden farblich hervorgehoben
- Reaktion entfernen: Erneut auf die eigene Reaktion klicken

### 5.2 Schnellreaktionen (One-Click Reactions)

- Konfigurierbare Schnellreaktions-Emoji (Standard: Augen, Haende hoch, Pluseins)
- Workspace-Admins koennen Standard-Schnellreaktionen festlegen
- Nutzer koennen eigene Schnellreaktionen definieren

### 5.3 Custom Emoji

- Workspace-Mitglieder koennen eigene Emoji hochladen
- Formate: PNG, JPG, GIF (animiert moeglich)
- Empfohlene Groesse: 128x128 Pixel (wird automatisch skaliert)
- Max. Dateigroesse: 256 KB
- Emoji-Name: Buchstaben, Zahlen, Bindestriche und Unterstriche
- Emoji-Aliase: Mehrere Namen fuer das gleiche Emoji
- Alle Workspace-Mitglieder koennen Custom Emoji verwenden
- Admin-Einstellung: Wer Custom Emoji hochladen darf
- Emoji-Verwaltungsseite fuer Admins

### 5.4 Reacji Channeler

- Integration, die Nachrichten automatisch in einen anderen Channel kopiert, wenn eine bestimmte Reaktion hinzugefuegt wird
- Konfigurierbar: Bestimmtes Emoji → bestimmter Channel
- Nuetzlich fuer Triage, Weiterleitung, Tagging

---

## 6. Erwaehnungen & Benachrichtigungen

### 6.1 Erwaehungstypen

- **@benutzername:** Einzelne Person erwaehnen — Desktop- und Mobile-Benachrichtigung
- **@here:** Benachrichtigt alle **aktiven** (online) Mitglieder des Channels
  - Kein Mobile-Push fuer abwesende Nutzer
  - Badge-Benachrichtigung am Desktop-Icon
  - Erscheint nicht in der Aktivitaetsansicht
- **@channel:** Benachrichtigt **alle** Mitglieder des Channels, unabhaengig vom Online-Status
  - Desktop- und Mobile-Alert fuer alle Mitglieder
  - Warnhinweis bei grossen Channels (>23 Mitglieder): "Du benachrichtigst X Personen"
- **@everyone:** Nur im #general-Channel verwendbar
  - Benachrichtigt alle Workspace-Mitglieder (ausser Gaeste)
  - Gleiche Benachrichtigung wie @channel
- **@gruppenname (User Groups):** Benachrichtigt alle Mitglieder der Benutzergruppe
  - Nur Mitglieder, die auch im Channel sind, erhalten eine Benachrichtigung

### 6.2 Benachrichtigungssystem

- **Desktop-Benachrichtigungen:**
  - Sound + Popup/Banner
  - Konfigurierbar: Alle Nachrichten, nur Erwaehnungen, nichts
  - Pro Channel ueberschreibbar
- **Mobile Push-Benachrichtigungen:**
  - Standard: Gleiche Einstellung wie Desktop
  - Separates Timing: Sofort oder verzoegert (wartet X Minuten auf Desktop-Aktivitaet)
- **E-Mail-Benachrichtigungen:**
  - Nur bei laengerer Inaktivitaet (nicht eingeloggt)
  - Zusammenfassung ungelesener Nachrichten
- **Badge-Zaehler:**
  - App-Icon zeigt Anzahl ungelesener Erwaehnungen
  - Unterscheidung: Nur Erwaehnungen vs. alle ungelesenen

### 6.3 Keyword-Benachrichtigungen

- Nutzer koennen Keywords definieren, bei denen sie benachrichtigt werden
- Triggert bei jedem Vorkommen des Keywords in einer Nachricht
- Konfigurierbar pro Workspace

### 6.4 "Nicht stoeren" (Do Not Disturb / DND)

- DND-Zeitplan: Taeglich von/bis (z.B. 22:00–08:00)
- Manuelles DND: Pause fuer X Minuten/Stunden oder bis zu einem Zeitpunkt
- Waehrend DND: Keine Benachrichtigungen (Desktop, Mobile, E-Mail)
- Absender sehen "Benachrichtigungen pausiert bis ..." und koennen trotzdem senden
- Option "Trotzdem senden" fuer dringende Nachrichten (durchbricht DND)

### 6.5 Benachrichtigungszeitplan

- Arbeitsstunden konfigurierbar (z.B. Mo–Fr 9–18 Uhr)
- Ausserhalb der Arbeitszeit: Benachrichtigungen werden zurueckgehalten
- Zeitzone des Nutzers wird beruecksichtigt

---

## 7. Dateifreigabe & Medien

### 7.1 Datei-Upload

- **Max. Dateigroesse:** 1 GB pro Datei
- **Upload-Methoden:**
  - Drag & Drop (bis zu 10 Dateien gleichzeitig) in das Nachrichtenfeld
  - Plus-Icon (+) neben dem Nachrichtenfeld → Datei auswaehlen
  - Einfuegen aus Zwischenablage (Clipboard Paste) — Bilder und Text
  - Mobile: Kamera, Galerie, Datei-Browser
- **Unterstuetzte Dateitypen:** Alle Dateitypen (keine Einschraenkung)
- **Datei-Vorschau im Chat:**
  - Bilder: Inline-Vorschau (max. 25.000 Pixel laengste Seite, max. 45 Mio. Pixel gesamt)
  - PDFs: Inline-Vorschau
  - MS Office: Vorschau bis 50 MB
  - Audio/Video: Eingebetteter Player
  - Code-Dateien: Syntax-Highlighting
  - ZIP/Archive: Dateiliste
- **Beschreibung:** Optionaler Beschreibungstext pro Datei
- **Reihenfolge:** Bei Mehrfach-Upload per Drag & Drop umsortierbar

### 7.2 Dateispeicher & Verwaltung

- **Speicherplatz pro Workspace:**
  - Free: 5 GB
  - Pro: 10 GB pro Mitglied
  - Business+: 20 GB pro Mitglied
  - Enterprise Grid: 1 TB pro Mitglied
- Dateien werden zentral gespeichert und koennen in mehreren Channels geteilt werden
- Dateien koennen ueber den Datei-Browser (Files-Ansicht) durchsucht werden
- Dateien koennen nachtraeglich geloescht werden (vom Uploader oder Admins)
- Geloeschte Dateien werden aus allen Channels entfernt

### 7.3 Externe Cloud-Dienste

- Integration mit Google Drive, Dropbox, Box, OneDrive
- Dateien als Link geteilt — nicht auf Slack-Server hochgeladen
- Vorschau und Berechtigungsmanagement ueber den jeweiligen Dienst

---

## 8. Suche

### 8.1 Globale Suche

- Durchsucht: Nachrichten, Dateien, Channels, Personen
- Ergebnisse in Tabs: Nachrichten, Dateien, Channels, Personen
- Relevanz-basierte Sortierung (Standard) oder chronologisch
- Suche beruecksichtigt nur Channels/DMs, zu denen der Nutzer Zugang hat

### 8.2 Such-Modifikatoren

| Modifikator | Beschreibung | Beispiel |
|-------------|-------------|---------|
| `from:` | Nachrichten von einem bestimmten Nutzer | `from:@anna` |
| `in:` | Nachrichten in einem bestimmten Channel/DM | `in:#support` |
| `to:` | DMs an einen bestimmten Nutzer | `to:@jacob` |
| `has:link` | Nachrichten mit Links | `Projektbericht has:link` |
| `has:file` | Nachrichten mit Dateien | `Rechnung has:file` |
| `has:pin` | Angepinnte Nachrichten | `has:pin in:#team` |
| `has:reaction` | Nachrichten mit Reaktionen | `has:reaction` |
| `has:star` / `is:saved` | Gespeicherte Nachrichten | `is:saved` |
| `has:emoji-name` | Nachrichten mit bestimmter Emoji-Reaktion | `has::white_check_mark:` |
| `before:` | Nachrichten vor Datum | `before:2026-01-01` |
| `after:` | Nachrichten nach Datum | `after:2026-03-15` |
| `on:` | Nachrichten an einem bestimmten Datum | `on:2026-04-01` |
| `during:` | Nachrichten waehrend eines Zeitraums | `during:march` |

### 8.3 Weitere Such-Operatoren

- **Anfuehrungszeichen:** `"exakte Phrase"` — Suche nach exakter Wortfolge
- **Asterisk:** `proj*` — Wildcard, findet "Projekt", "Projektion" etc.
- **Minus:** `-wort` — Schliesst Ergebnisse mit diesem Wort aus
- **Kombination:** Mehrere Modifikatoren kombinierbar: `Bericht in:#marketing from:@anna after:2026-01-01`

### 8.4 Such-Filter (UI)

- Nach Typ filtern: Nachrichten, Dateien
- Nach Zeitraum filtern: Heute, Letzte Woche, Letzter Monat, Benutzerdefiniert
- Nach Person filtern
- Nach Channel filtern
- Sortierung: Relevanz oder Neueste zuerst

---

## 9. Sidebar & Navigation

### 9.1 Sidebar-Struktur

- **Workspace-Kopfzeile:** Workspace-Name, Nutzer-Menu, Statusanzeige
- **Suchleiste:** Schnellsuche / Quick Switcher
- **Home:** Zusammenfassung wichtiger Aktivitaeten
- **DMs:** Liste der Direktnachrichten
- **Aktivitaet (Activity):** Alle Erwaehnungen und Reaktionen
- **Spaeter (Later/Saved):** Gespeicherte Nachrichten
- **Mehr (More):**
  - Threads
  - Alle DMs
  - Alle Channels
  - Dateien
  - Apps
  - People & User Groups
  - Canvases
  - Automationen

### 9.2 Sidebar-Sektionen

- Nutzer koennen eigene Sektionen erstellen (z.B. "Projekte", "Team", "Extern")
- Channels per Drag & Drop in Sektionen verschieben
- Sektionen koennen kollabiert werden
- Automatische Sektionen: Favoriten, Channels, Direktnachrichten, Apps
- Reihenfolge der Sektionen frei aenderbar
- Pro Sektion konfigurierbar: Sortierung (alphabetisch, Prioritaet, neueste Aktivitaet)

### 9.3 Ungelesen-Anzeige

- Channels mit ungelesenen Nachrichten werden fett dargestellt
- Badge-Zaehler fuer Erwaehnungen (@mentions)
- "Ungelesene" Ansicht: Zeigt alle Channels mit neuen Nachrichten in einer Liste
- "Alle gelesen markieren" fuer einzelne Channels oder alle

### 9.4 Quick Switcher (Cmd+K / Ctrl+K)

- Schnellnavigation zu Channels, DMs, Dateien
- Fuzzy-Suche ueber Channel-Namen und Personennamen
- Zuletzt verwendete Konversationen als Vorschlaege
- Zugriff auf Suchfunktion

---

## 10. Benutzerprofil & Praesenz

### 10.1 Profilfelder

- **Anzeigename (Display Name):** Frei waehlbar
- **Vollstaendiger Name (Full Name):** Pflichtfeld
- **Titel / Position:** z.B. "Geschaeftsfuehrer"
- **Telefon / Handynummer**
- **E-Mail-Adresse**
- **Zeitzone:** Automatisch erkannt oder manuell gesetzt
- **Profilbild:** Hochladbar, wird in verschiedenen Groessen angezeigt
- **Aussprache des Namens:** Optionales Feld
- **Benutzerdefinierte Felder:** Admins koennen eigene Profilfelder definieren (z.B. "Abteilung", "Standort", "Geburtstag")

### 10.2 Status

- **Custom Status:** Emoji + Text (z.B. "Im Meeting", "Im Urlaub")
- **Status-Ablaufdatum:** Automatische Loesung nach X Minuten/Stunden/Datum
- **Status-Vorlagen:** Vordefinierte Status-Optionen (konfigurierbar durch Admins)
- **Kalender-Integration:** Status automatisch basierend auf Google Calendar / Outlook setzen
- **DND-Status:** Zeigt anderen an, dass Benachrichtigungen pausiert sind

### 10.3 Praesenz-Anzeige

- **Aktiv (gruener Punkt):** Nutzer hat Slack geoeffnet und ist aktiv
- **Abwesend (leerer Kreis):** Nutzer ist seit >10 Minuten inaktiv oder hat Slack geschlossen
- **DND (Z-Icon):** Benachrichtigungen pausiert
- Automatische Praesenz-Erkennung basierend auf Maus-/Tastaturaktivitaet
- Manueller Override: Nutzer kann Status auf "Abwesend" oder "Aktiv" setzen
- Praesenz wird geraeteuebergreifend synchronisiert

### 10.4 People Directory

- Durchsuchbares Mitgliederverzeichnis
- Filter nach Abteilung, Titel, Benutzergruppe
- Profilansicht: Kontaktdaten, gemeinsame Channels, Zeitzone, lokale Uhrzeit

---

## 11. Huddles (Audio/Video)

### 11.1 Grundfunktion

- Spontane Audio-/Videoanrufe direkt in einem Channel oder DM
- Kein Meeting-Link oder Kalendereinladung noetig
- Beitreten per Klick auf das Kopfhoerer-Icon
- Verfuegbar in Channels, DMs und Gruppen-DMs
- Max. Teilnehmer: 50 (alle Plaene)

### 11.2 Funktionen waehrend Huddles

- **Audio:** Standardmaessig nur Audio aktiviert
- **Video:** Kamera kann hinzugeschaltet werden
- **Bildschirmfreigabe:** Gesamter Bildschirm oder einzelnes Fenster
- **Huddle-Thread:** Begleitender Text-Chat waehrend des Huddles
- **Reaktionen:** Emoji-Reaktionen waehrend des Huddles (temporaer sichtbar)
- **Zeichnen auf Bildschirmfreigabe:** Annotation-Tools fuer Teilnehmer
- **Untertitel (Live Captions):** Echtzeit-Transkription (in bestimmten Sprachen)

### 11.3 Huddle-Einstellungen

- Huddle starten: In jedem Channel oder DM moeglich
- Beitreten: Alle Channel-/DM-Mitglieder koennen dem laufenden Huddle beitreten
- Stummschalten: Eigenes Mikrofon stumm/entstummen
- Verlassen: Jederzeit moeglich
- Fortsetzen: Huddle laeuft weiter, auch wenn alle bis auf eine Person gegangen sind

---

## 12. Canvas (Dokumente)

### 12.1 Grundkonzept

- Integrierte kollaborative Dokumente innerhalb von Slack
- Koennen an einen Channel angeheftet werden oder als eigenstaendige Canvases existieren
- Unterstuetzen gleichzeitiges Bearbeiten durch mehrere Nutzer

### 12.2 Canvas-Elemente

- **Text:** Ueberschriften (H1, H2, H3), Absaetze, fett, kursiv, durchgestrichen
- **Listen:** Sortiert, unsortiert, Checklisten mit Haken
- **Code-Bloecke:** Syntax-Highlighting fuer verschiedene Sprachen
- **Medien:** Bilder, Videos einbettbar
- **Links:** Clickbare Links mit Vorschau
- **Tabellen:** Einfache Tabellen
- **Mentions:** @-Erwaehnungen in Canvas-Text
- **Divider:** Horizontale Trennlinien
- **Bookmarks / Links:** Einbettung von externen Inhalten

### 12.3 Canvas-Verwaltung

- Jeder Channel hat ein optionales "Channel Canvas" (frueher "Channel Notes")
- Eigenstaendige Canvases unter "Canvases" in der Sidebar
- Berechtigungen: Wer kann bearbeiten, wer kann nur lesen
- Versionshistorie: Aenderungen werden protokolliert
- Canvases koennen geteilt und in Nachrichten verlinkt werden

---

## 13. Clips (Audio-/Videonachrichten)

### 13.1 Funktionen

- Kurze Audio- oder Videonachrichten aufnehmen und in Channels/DMs posten
- Aufnahme direkt im Nachrichtenfeld ueber das Mikrofon-/Kamera-Icon
- Max. Laenge: 5 Minuten
- Abspielen: Direkt inline in der Nachricht
- Geschwindigkeitskontrolle: 0.5x, 1x, 1.5x, 2x
- Automatische Transkription des gesprochenen Textes
- Transkription ist durchsuchbar

### 13.2 Einschraenkungen

- Verfuegbar ab Pro-Plan
- Aufnahme nur in der Desktop- und Mobile-App
- Nicht in allen Browsern verfuegbar

---

## 14. Listen (Task-Tracking)

### 14.1 Grundkonzept

- Strukturierte Listen innerhalb von Slack fuer einfaches Task-Tracking
- Koennen in Channels erstellt und geteilt werden
- Tabellenartige Darstellung mit konfigurierbaren Spalten

### 14.2 Listenfelder

- **Status:** Konfigurierbare Statusoptionen (z.B. Offen, In Arbeit, Erledigt)
- **Zuweisung (Assignee):** Slack-Nutzer zuweisen
- **Faelligkeitsdatum:** Deadline setzen
- **Prioritaet:** Konfigurierbare Prioritaetsstufen
- **Text-Felder:** Benutzerdefinierte Text-/Nummern-/Datumsfelder
- **Tags / Labels:** Kategorisierung

### 14.3 Listen-Ansichten

- Tabellenansicht (Standard)
- Board-/Kanban-Ansicht (Gruppierung nach Status)
- Filter und Sortierung nach jedem Feld
- Gruppenansicht nach bestimmten Feldern

### 14.4 Listen-Integration

- Aufgaben koennen aus Nachrichten erstellt werden
- Aenderungen an Listenelementen erzeugen Benachrichtigungen
- Listen koennen in Channel-Canvas eingebettet werden
- Verfuegbar ab Pro-Plan

---

## 15. Workflow Builder & Automationen

### 15.1 Workflow Builder

- **No-Code-Automation-Tool** direkt in Slack
- Erstellt automatisierte Ablaeufe ohne Programmierkenntnisse
- Verfuegbar ab Pro-Plan (eingeschraenkt), voller Umfang ab Business+/Enterprise

### 15.2 Trigger-Typen

- **Channel-Trigger:** Wenn eine Nachricht in einem Channel gepostet wird
- **Emoji-Trigger:** Wenn eine bestimmte Reaktion hinzugefuegt wird
- **Webhook-Trigger:** Externer HTTP-Request startet den Workflow
- **Zeitplan-Trigger:** Workflow laeuft zu festgelegten Zeiten (taeglich, woechentlich, etc.)
- **Shortcut-Trigger:** Workflow wird ueber Slash-Befehl oder Kontextmenue gestartet
- **Person-/Channel-beigetreten-Trigger:** Wenn jemand einem Channel beitritt

### 15.3 Workflow-Schritte

- **Nachricht senden:** An Channel, DM oder Thread
- **Formular anzeigen:** Eingabeformular mit Textfeldern, Dropdowns, Datepickern, Nutzerauswahl
- **Variable setzen:** Daten zwischen Schritten uebergeben
- **Bedingung (If/Then):** Bedingte Verzweigungen
- **Channel erstellen:** Automatisch neuen Channel anlegen
- **Nachricht aktualisieren:** Bestehende Nachricht aendern
- **Externer Webaufruf:** HTTP Request an externe URL
- **Verzoegerung:** Warte X Minuten/Stunden
- **Genehmigung:** Nachricht mit Annehmen/Ablehnen-Buttons

### 15.4 Variablen & Daten

- Variablen aus Trigger-Daten (Absender, Channel, Nachrichtentext, Zeitstempel)
- Variablen aus Formular-Antworten
- Variablen aus vorherigen Schritten
- String-Manipulation und Formatierung
- Datum/Zeit-Variablen

### 15.5 Custom Functions (Enterprise)

- Entwickler koennen eigene Funktionen in JavaScript/TypeScript schreiben
- Werden auf Slack-Infrastruktur gehostet (Deno-Runtime)
- Koennen in Workflows als Schritte eingebunden werden
- Zugriff auf Slack API innerhalb der Funktion

---

## 16. Apps, Bots & Integrationen

### 16.1 Slack App Directory

- Marketplace mit tausenden vorgefertigten Apps
- Kategorien: Projektmanagement, CRM, DevOps, HR, Analytics, etc.
- Apps werden im Workspace installiert und koennen Channels beitreten
- App-Genehmigungsworkflow: Admins koennen App-Installationen genehmigungspflichtig machen

### 16.2 Bot-Nutzer

- Apps koennen als Bot-Nutzer in Channels posten
- Bot-Profilbild und -Name konfigurierbar
- Bot-Nachrichten sind als solche gekennzeichnet ("APP" Badge)
- Bots koennen auf Erwaehnungen und Events reagieren

### 16.3 Gaengige Integrationen

- **Projektmanagement:** Jira, Asana, Trello, Monday, Linear
- **Versionskontrolle:** GitHub, GitLab, Bitbucket
- **Cloud-Speicher:** Google Drive, Dropbox, Box, OneDrive
- **Video/Meetings:** Zoom, Google Meet, Microsoft Teams
- **CRM:** Salesforce, HubSpot
- **Monitoring:** PagerDuty, Datadog, New Relic
- **CI/CD:** Jenkins, CircleCI, GitHub Actions
- **Helpdesk:** Zendesk, Freshdesk
- **HR:** BambooHR, Workday

### 16.4 Incoming Webhooks

- HTTP-Endpoint, an den externe Systeme JSON-Nachrichten senden
- Nachrichten erscheinen in einem konfigurierten Channel
- Unterstuetzt Nachrichtenformatierung (Attachments, Blocks)
- Einfache Einrichtung ohne App-Erstellung
- Pro Webhook ein Channel

### 16.5 Outgoing Webhooks (Legacy)

- Trigger-Wort in einem Channel loest HTTP-Request an externe URL aus
- Antwort wird als Nachricht im Channel gepostet
- Veraltet — ersetzt durch Events API und Slash Commands

---

## 17. Slash-Befehle

### 17.1 Eingebaute Slash-Befehle

| Befehl | Funktion |
|--------|----------|
| `/archive` | Channel archivieren |
| `/away` | Status auf Abwesend setzen |
| `/call` | Huddle/Anruf starten |
| `/collapse` | Alle Vorschauen einklappen |
| `/dm @user [nachricht]` | DM an Nutzer senden |
| `/expand` | Alle Vorschauen ausklappen |
| `/feed` | RSS-Feed hinzufuegen |
| `/invite @user` | Nutzer in Channel einladen |
| `/join #channel` | Channel beitreten |
| `/leave` | Channel verlassen |
| `/me [text]` | Statusnachricht in 3. Person |
| `/msg #channel [text]` | Nachricht in Channel senden |
| `/mute` | Channel stummschalten |
| `/open #channel` | Channel oeffnen |
| `/remind` | Erinnerung setzen |
| `/remove @user` | Nutzer aus Channel entfernen |
| `/rename` | Channel umbenennen |
| `/search [text]` | Suche starten |
| `/shrug` | ¯\_(ツ)_/¯ anhaengen |
| `/status` | Status setzen |
| `/topic [text]` | Channel-Topic setzen |
| `/who` | Channel-Mitglieder anzeigen |

### 17.2 Erinnerungen (/remind)

- `/remind me [text] [zeitpunkt]` — Eigene Erinnerung setzen
- `/remind @user [text] [zeitpunkt]` — Erinnerung fuer andere Person
- `/remind #channel [text] [zeitpunkt]` — Channel-Erinnerung
- Zeitformate: "in 5 minutes", "tomorrow at 9am", "every Monday at 10am"
- Wiederkehrende Erinnerungen: "every day/week/month"
- Verwalten: `/remind list` — alle Erinnerungen anzeigen, bearbeiten, loeschen
- Erinnerungen werden als DM von Slackbot zugestellt

### 17.3 Custom Slash Commands

- Apps koennen eigene Slash-Befehle registrieren
- Format: `/befehl [parameter]`
- Antwort: Sichtbar fuer alle (in_channel) oder nur fuer Absender (ephemeral)
- Koennen interaktive Nachrichten (Buttons, Menues) zurueckgeben

---

## 18. Slack API & Block Kit

### 18.1 API-Typen

- **Web API:** RESTful HTTP-API fuer CRUD-Operationen (Nachrichten senden, Channels verwalten, Nutzer abfragen, etc.)
- **Events API:** Webhook-basiert — Slack sendet HTTP-Requests bei Events (Nachricht gepostet, Reaktion hinzugefuegt, etc.)
- **Socket Mode:** WebSocket-Verbindung fuer Events (statt oeffentliche URL, ideal fuer interne Tools)
- **RTM API (Real Time Messaging):** WebSocket-basiert, deprecated — ersetzt durch Events API + Socket Mode
- **Conversations API:** Einheitliche API fuer Channels, DMs, Gruppen-DMs

### 18.2 Block Kit (UI-Framework)

Block Kit ist das UI-Framework fuer Slack-Nachrichten, Modals und Home-Tabs.

#### Block-Typen:
- **Section Block:** Text (mit optionalen Accessory-Elementen wie Button, Overflow-Menu, Image)
- **Divider Block:** Horizontale Trennlinie
- **Image Block:** Einzelnes Bild mit optionalem Titel/Alt-Text
- **Actions Block:** Reihe interaktiver Elemente (Buttons, Select-Menus, Datepicker)
- **Context Block:** Kleine Kontextinformation (Bild + Text, max. 10 Elemente)
- **Input Block:** Formularfelder (nur in Modals/Home)
- **Header Block:** Grosse Ueberschrift
- **Rich Text Block:** Komplexe formatierte Texte (Listen, Code, etc.)
- **Video Block:** Eingebettetes Video
- **File Block:** Dateireferenz

#### Interaktive Elemente:
- **Button:** Text-Button mit Action-ID, optional mit URL-Link oder Confirm-Dialog
- **Select Menus:** Static, User, Conversation, Channel, External Data Source
- **Multi-Select Menus:** Mehrfachauswahl fuer alle Select-Typen
- **Overflow Menu:** "..."-Menu mit mehreren Optionen
- **Date Picker:** Datumsauswahl
- **Time Picker:** Zeitauswahl
- **Datetime Picker:** Datum + Zeit
- **Checkbox Group:** Mehrfachauswahl mit Checkboxen
- **Radio Button Group:** Einfachauswahl
- **Plain Text Input:** Freitext-Eingabe
- **Email Input:** E-Mail-Eingabe
- **URL Input:** URL-Eingabe
- **Number Input:** Numerische Eingabe
- **Rich Text Input:** Formatierter Texteditor
- **File Input:** Datei-Upload

#### Modals (Views):
- Popup-Fenster mit Titel, Submit-Button, Cancel-Button
- Koennen mehrere Input-Blocks enthalten (Formulare)
- Maximal 3 verschachtelte Modals (Stacking)
- Callback-ID fuer Server-seitige Verarbeitung
- Private Metadata fuer Zustandsverwaltung

#### Home Tab:
- Persoenliche Startseite einer App
- Individuell pro Nutzer renderbar
- Unterstuetzt alle Block-Typen

### 18.3 Interactive Messages

- Nachrichten mit Buttons, Menus, etc.
- Bei Interaktion: HTTP-Request an den App-Server (Action URL)
- Nachrichten koennen nach Interaktion aktualisiert oder ersetzt werden
- Ephemeral Responses: Nur fuer den interagierenden Nutzer sichtbar

### 18.4 App Scopes & Permissions

- Granulare Berechtigungen (Scopes) pro App:
  - `channels:read`, `channels:write`, `channels:history`
  - `chat:write`, `chat:write.public`
  - `users:read`, `users:read.email`
  - `files:read`, `files:write`
  - `reactions:read`, `reactions:write`
  - `search:read`
  - etc.
- Bot Token Scopes vs. User Token Scopes
- OAuth 2.0 Installation Flow

---

## 19. Workspace-Verwaltung & Administration

### 19.1 Workspace-Einstellungen

- **Workspace-Name:** Frei waehlbar, aenderbar
- **Workspace-URL:** `name.slack.com`, aenderbar (mit Weiterleitung)
- **Workspace-Icon:** Bild-Upload (wird als App-Icon verwendet)
- **Standard-Channels:** Welche Channels neue Mitglieder automatisch joinen
- **Sprache:** Standard-Sprache des Workspace
- **Nachrichten-Aufbewahrung:** Wie lange Nachrichten/Dateien gespeichert werden

### 19.2 Einladungen & Registrierung

- **E-Mail-Einladung:** Admins senden Einladungslinks per E-Mail
- **Einladungslink:** Generierbarer Link mit optionalem Ablaufdatum
- **Domain-basierte Anmeldung:** Alle Nutzer mit bestimmter E-Mail-Domain koennen automatisch beitreten
- **Genehmigungs-Workflow:** Admins muessen neue Mitglieder genehmigen
- Gaeste koennen auf bestimmte Channels beschraenkt werden

### 19.3 Channel-Verwaltung (Admin-Tools)

- Uebersicht aller Channels (oeffentlich und privat)
- Channel-Erstellung, Archivierung, Loeschung
- Channel-Konvertierung (oeffentlich ↔ privat, nur Business+/Enterprise)
- Posting-Berechtigungen pro Channel konfigurieren
- Channel-Manager zuweisen (delegierte Verwaltung)

---

## 20. Benutzer- & Rollenverwaltung

### 20.1 Rollen

- **Workspace-Owner (Primaer):** Volle Kontrolle, kann nicht entfernt werden, Billing-Zugang
- **Workspace-Owner (weitere):** Fast alle Rechte, koennen vom Primaer-Owner hinzugefuegt werden
- **Workspace-Admin:** Mitgliederverwaltung, Channel-Verwaltung, App-Verwaltung
- **Mitglied (Member):** Standardrolle — Nachrichten senden, Channels erstellen (sofern erlaubt)
- **Gast (Single-Channel):** Zugriff auf genau einen Channel
- **Gast (Multi-Channel):** Zugriff auf ausgewaehlte Channels
- Gaeste haben eingeschraenkte Funktionen (kein Channel-Browser, kein People Directory, kein Erstellen von Channels)

### 20.2 Benutzer-Lebenszyklus

- **Einladen:** Per E-Mail oder Link
- **Aktivieren:** Nutzer registriert sich, legt Profil an
- **Deaktivieren:** Account deaktivieren (Nachrichten bleiben erhalten, Nutzer kann nicht mehr zugreifen)
- **Reaktivieren:** Deaktivierte Accounts koennen wiederhergestellt werden
- Nutzer koennen den Workspace auch selbst verlassen

### 20.3 Nutzerverwaltung (Admin-Dashboard)

- Liste aller Mitglieder mit Rolle, Status (aktiv/deaktiviert), letzter Aktivitaet
- Massenaktionen: Mehrere Nutzer gleichzeitig deaktivieren, Rolle aendern
- CSV-Import fuer Masseneinladungen
- Session-Management: Aktive Sessions einsehen, einzelne Sessions beenden
- Erzwungene Abmeldung aller Geraete

---

## 21. Berechtigungen & Zugriffssteuerung

### 21.1 Konfigurierbare Berechtigungen

| Berechtigung | Optionen |
|--------------|---------|
| Wer darf Channels erstellen? | Alle / Nur Admins / Nur Owners |
| Wer darf Channels archivieren? | Alle / Channel-Manager / Admins |
| Wer darf oeffentliche Channels loeschen? | Nur Owners |
| Wer darf Mitglieder einladen? | Alle / Nur Admins |
| Wer darf Gaeste einladen? | Alle / Nur Admins |
| Wer darf Apps installieren? | Alle / Nur Admins / Genehmigt |
| Wer darf Custom Emoji hochladen? | Alle / Nur Admins |
| Wer darf @channel/@here verwenden? | Alle / Nur Admins / Mitglieder in Channels <X |
| Nachrichten bearbeiten: Zeitlimit | Unbegrenzt / 1 Min / 5 Min / etc. |
| Nachrichten loeschen | Absender / Admins / Niemand |
| Wer darf Dateien hochladen? | Alle / Nur Mitglieder / Nur Admins |

### 21.2 Channel-spezifische Berechtigungen

- **Posting-Berechtigungen:**
  - Alle Mitglieder duerfen posten
  - Nur bestimmte Personen/Gruppen duerfen posten (Announcement Channel)
  - Thread-Antworten fuer alle erlauben, auch wenn Posting eingeschraenkt ist
- **Wer darf Mitglieder einladen?**
- **Wer darf das Topic aendern?**
- **Wer darf Nachrichten pinnen?**

---

## 22. Benutzergruppen (User Groups)

### 22.1 Erstellung & Verwaltung

- Verfuegbar ab Pro-Plan
- Name: Anzeigename (z.B. "Engineering Team")
- Handle: Kurzname fuer Erwaehnungen (z.B. `@engineering`)
- Beschreibung: Optionaler Beschreibungstext
- Standard-Channels: Channels, denen Gruppenmitglieder automatisch hinzugefuegt werden
- Mitglieder: Manuell hinzufuegen/entfernen oder aus externem System synchronisieren

### 22.2 Funktionen

- Erwaehnbar in Nachrichten mit `@handle`
- Alle Gruppenmitglieder im Channel erhalten Benachrichtigung
- Nutzer koennen sehen, wer in einer Gruppe ist
- Gruppen erscheinen im People-Verzeichnis
- Gruppen koennen in Channel-Berechtigungen referenziert werden

---

## 23. Authentifizierung & Sicherheit

### 23.1 Anmeldemethoden

- **E-Mail + Passwort:** Standard
- **Google SSO:** Anmeldung mit Google-Account
- **Apple SSO:** Anmeldung mit Apple-ID
- **SAML SSO:** Enterprise Single Sign-On (Business+/Enterprise)
  - Unterstuetzte Provider: Okta, Azure AD, OneLogin, Ping Identity, etc.
  - Erzwingbar: Alle Nutzer muessen SSO verwenden
- **Zwei-Faktor-Authentifizierung (2FA):**
  - TOTP (Authenticator-App)
  - SMS (Fallback)
  - Erzwingbar fuer alle Workspace-Mitglieder (Admins koennen 2FA-Pflicht aktivieren)

### 23.2 Session-Management

- Uebersicht aktiver Sessions (Desktop, Mobile, Browser)
- Remote-Abmeldung einzelner Sessions
- Erzwungene Abmeldung aller Geraete
- Session-Timeout: Konfigurierbar (Standard: 30 Tage)
- IP-basierte Zugriffsbeschraenkung (Enterprise)

### 23.3 Passwort-Richtlinien (Business+/Enterprise)

- Mindestlaenge
- Komplexitaetsanforderungen (Gross-/Kleinbuchstaben, Zahlen, Sonderzeichen)
- Passwort-Ablauf (erzwungener Wechsel)
- Passwort-Historie (keine Wiederverwendung)

---

## 24. Compliance & Datenmanagement

### 24.1 Nachrichten-Aufbewahrung (Retention)

- **Workspace-weite Retention:**
  - Nachrichten behalten: Fuer immer / X Tage
  - Dateien behalten: Fuer immer / X Tage
- **Pro-Channel-Retention:** Abweichende Aufbewahrungsfristen pro Channel
- **Geloeschte Nachrichten:**
  - Sofort loeschen (Standard) oder im Compliance-Export erhalten

### 24.2 Datenexport

- **Standard-Export (Free/Pro):**
  - Nachrichten und Links aus oeffentlichen Channels
  - JSON-Format
  - Durch Workspace-Owner ausfuehrbar
- **Corporate Export (Business+/Enterprise):**
  - Alle Nachrichten inkl. private Channels und DMs
  - Inklusive bearbeitete und geloeschte Nachrichten
  - Fuer Compliance, eDiscovery, Legal Hold
  - Erfordert Genehmigung durch Slack
- **Exportformat:** JSON-Dateien, organisiert nach Channel und Datum

### 24.3 eDiscovery & DLP

- Integration mit eDiscovery-Tools (Relativity, Veritas, etc.)
- Data Loss Prevention (DLP): Integration mit DLP-Tools zum Scannen von Nachrichten/Dateien
- Enterprise Key Management (EKM): Eigene Verschluesselungsschluessel (Enterprise Grid)
- Audit-Logs: Alle administrativen Aktionen werden protokolliert

---

## 25. Slack Connect (Externe Zusammenarbeit)

### 25.1 Funktionen

- Channels zwischen verschiedenen Slack-Workspaces/Organisationen teilen
- DMs mit Personen aus externen Organisationen
- Dateifreigabe (kann eingeschraenkt werden)
- Gleiche Funktionen wie interne Channels (Threads, Reaktionen, etc.)

### 25.2 Einschraenkungen & Steuerung

- Admins koennen Slack Connect vollstaendig deaktivieren
- Datei-Upload in Slack Connect Channels beschraenkbar
- Canvas-Sharing beschraenkbar
- Genehmigungsworkflow fuer neue Slack Connect Verbindungen
- Max. 250 Organisationen pro Channel (Enterprise Grid)
- Externe Gaeste haben eingeschraenkte Rechte

### 25.3 Einrichtung

1. Einladungs-Link generieren
2. Externe Organisation akzeptiert
3. Shared Channel wird erstellt
4. Beide Seiten koennen Mitglieder hinzufuegen

---

## 26. Enterprise Grid

### 26.1 Multi-Workspace-Architektur

- Uebergeordnete Organisation mit mehreren Workspaces
- Org-Level-Admins verwalten alle Workspaces
- Cross-Workspace-Channels: Channels, die in mehreren Workspaces sichtbar sind
- Zentrale Nutzer-/Identitaetsverwaltung (IdP-Integration)

### 26.2 Org-Level-Funktionen

- Zentrale Admin-Konsole
- Einheitliche Sicherheitsrichtlinien fuer alle Workspaces
- Cross-Workspace-Suche
- Org-weite Benutzergruppen
- Org-weite App-Verwaltung und -Genehmigung
- Zentrale Compliance- und Audit-Funktionen

### 26.3 Channel-Management

- Org-weite Channels (in allen oder ausgewaehlten Workspaces sichtbar)
- Workspace-lokale Channels (nur in einem Workspace)
- Admin-gesteuerte Channel-Erstellung und -Verteilung
- IDP Groups Sync: Benutzergruppen aus Azure AD/Okta automatisch synchronisieren

---

## 27. Slack AI

### 27.1 Funktionen

- **Thread-Zusammenfassung:** AI-generierte Zusammenfassung eines Threads
- **Channel-Zusammenfassung:** AI-generierte Zusammenfassung ungelesener Nachrichten in einem Channel
- **Suche mit AI:** Natuerlichsprachliche Fragen an Slack stellen, AI antwortet basierend auf Workspace-Nachrichten
- **Recaps:** Zusammenfassung der wichtigsten Aktivitaeten waehrend der Abwesenheit
- **Channel Highlights:** Automatisch wichtige Nachrichten hervorheben

### 27.2 Datenschutz

- AI-Modelle werden nicht mit Kundendaten trainiert
- Daten bleiben innerhalb der Slack-Infrastruktur
- AI-Zugriff folgt den bestehenden Channel-Berechtigungen (kein Zugriff auf private Channels, zu denen der Nutzer keinen Zugang hat)

### 27.3 Verfuegbarkeit

- Kostenpflichtiges Add-on (separate Lizenz)
- Verfuegbar fuer Pro, Business+, Enterprise Grid

---

## 28. Analytics & Reporting

### 28.1 Workspace Analytics

- **Uebersicht:**
  - Gesamt-Nachrichten gesendet (pro Tag/Woche/Monat)
  - Aktive Mitglieder (taeglich, woechentlich, monatlich)
  - Channel-Nutzung (aktivste Channels)
  - Nachrichtenverteilung: Channels vs. DMs vs. Threads
- **Mitglieder-Analytics:**
  - Nachrichten pro Nutzer
  - Lesende vs. schreibende Mitglieder
  - Letzte Aktivitaet
  - Tage seit letztem Login
- **Channel-Analytics:**
  - Nachrichten pro Channel
  - Mitglieder pro Channel
  - Aktivste Channel
  - Channels mit geringer Aktivitaet
- **Verfuegbarkeit:**
  - Basis-Analytics: Alle Plaene
  - Erweiterte Analytics: Business+/Enterprise

### 28.2 Export

- CSV-Export der Analytics-Daten
- API-Zugriff auf Analytics (Enterprise)

---

## 29. Tastenkuerzel & Navigation

### 29.1 Wichtigste Tastenkuerzel

| Kuerzel (Mac) | Kuerzel (Win/Linux) | Funktion |
|---------------|---------------------|----------|
| Cmd+K | Ctrl+K | Quick Switcher (Channel/DM wechseln) |
| Cmd+/ | Ctrl+/ | Alle Tastenkuerzel anzeigen |
| Cmd+Shift+K | Ctrl+Shift+K | DMs-Browser oeffnen |
| Cmd+Shift+L | Ctrl+Shift+L | Channels-Browser oeffnen |
| Cmd+F | Ctrl+F | In Channel suchen |
| Cmd+G | Ctrl+G | Globale Suche |
| Cmd+Shift+T | Ctrl+Shift+T | Threads-Panel oeffnen |
| Cmd+Shift+A | Ctrl+Shift+A | Alle ungelesenen anzeigen |
| Cmd+Shift+S | Ctrl+Shift+S | Saved Items oeffnen |
| Cmd+Shift+M | Ctrl+Shift+M | Erwaehnungen & Reaktionen |
| Cmd+N | Ctrl+N | Neue Nachricht verfassen |
| Cmd+Shift+Enter | Ctrl+Shift+Enter | Nachricht als Code-Block formatieren |
| Cmd+U | Ctrl+U | Datei hochladen |
| Cmd+[ | Alt+Left | Zurueck navigieren |
| Cmd+] | Alt+Right | Vorwaerts navigieren |
| Esc | Esc | Ungelesene im aktuellen Channel als gelesen markieren |
| Cmd+Shift+\ | Ctrl+Shift+\ | Reaktionen-Menu oeffnen |
| E (im Message-Hover) | E | Nachricht bearbeiten |
| R (im Message-Hover) | R | Emoji-Reaktion hinzufuegen |
| T (im Message-Hover) | T | Thread oeffnen |
| P (im Message-Hover) | P | Nachricht pinnen |
| S (im Message-Hover) | S | Nachricht speichern |
| Up Arrow | Up Arrow | Letzte eigene Nachricht bearbeiten |

### 29.2 Nachrichten-Aktionen (Kontextmenue)

- Antworten (Thread starten/beitreten)
- Weiterleiten / Teilen in Channel oder DM
- Link zur Nachricht kopieren
- Nachrichtentext kopieren
- Als ungelesen markieren (ab dieser Nachricht)
- Erinnern (Remind me: in 20 Min, 1 Std, 3 Std, morgen, naechste Woche)
- Pinnen / Entpinnen
- Speichern / Bookmark
- Bearbeiten (nur eigene Nachrichten)
- Loeschen (nur eigene Nachrichten oder Admin)
- Emoji-Reaktion hinzufuegen

---

## 30. Mobile App

### 30.1 Feature-Paritaet

- Nachrichten senden/empfangen, Threads, Reaktionen, Datei-Upload
- Push-Benachrichtigungen mit konfigurierbarer Verzoegerung
- Channel-Verwaltung (beitreten, stummschalten, verlassen)
- Huddles (Audio, eingeschraenkt Video)
- Quick Switcher
- DND-Modus
- Status setzen
- Suche
- Profilbearbeitung

### 30.2 Mobile-spezifische Features

- Swipe-Gesten fuer Navigation
- Offline-Modus: Gelesene Nachrichten cached, Entwuerfe gespeichert
- Benachrichtigungszeitplan: Separate Einstellungen fuer Mobile
- Kamera-Integration fuer Foto-/Video-Nachrichten
- QR-Code-Login fuer schnelles Anmelden

---

## 31. Desktop App

### 31.1 Plattformen

- macOS, Windows, Linux
- Basiert auf Electron

### 31.2 Desktop-spezifische Features

- **Multi-Workspace:** Mehrere Workspaces in der Seitenleiste
- **System-Tray/Menueleiste:** Icon mit Ungelesen-Zaehler
- **Native Benachrichtigungen:** OS-Benachrichtigungssystem
- **Deep Linking:** `slack://` URL-Schema zum Oeffnen bestimmter Channels/Nachrichten
- **Bild-in-Bild:** Huddle/Bildschirmfreigabe in schwebendem Fenster
- **Auto-Start:** Beim Systemstart automatisch starten
- **Download-Verzeichnis:** Dateien direkt herunterladen

### 31.3 Browser-Version

- Voll funktionsfaehige Web-App unter `workspace.slack.com`
- Keine Desktop-Benachrichtigungen ohne Browser-Erlaubnis
- Kein System-Tray-Icon
- Ansonsten nahezu Feature-Paritaet

---

## 32. Barrierefreiheit

### 32.1 Standards

- WCAG 2.1 AA-Konformitaet angestrebt
- Screen-Reader-Unterstuetzung (VoiceOver, NVDA, JAWS)
- Vollstaendige Tastaturnavigation
- Fokus-Management und Skip-Links

### 32.2 Einstellungen

- Tastaturkuerzel-Anpassung
- Animationen reduzieren (Reduced Motion)
- Link-Vorschauen deaktivieren (weniger visuelle Unruhe)
- Groesse der Schrift konfigurierbar
- Kompaktes vs. volles Nachrichtenlayout

---

## 33. Plaene & Feature-Abgrenzung

### 33.1 Free-Plan

- Zugang zu den letzten 90 Tagen Nachrichtenhistorie
- 1:1 Huddles (kein Video, keine Bildschirmfreigabe)
- 10 App-Integrationen
- 5 GB Dateispeicher (Workspace-gesamt)
- 1 Workspace
- Keine Benutzergruppen
- Keine Gaeste
- Keine Custom Retention
- Keine Slack Connect fuer Channels
- Kein Workflow Builder
- Keine erweiterte Suche

### 33.2 Pro-Plan (~7,25 EUR/Nutzer/Monat)

- Unbegrenzte Nachrichtenhistorie
- Gruppen-Huddles mit Video und Bildschirmfreigabe
- Unbegrenzte App-Integrationen
- 10 GB Dateispeicher pro Nutzer
- Benutzergruppen
- Gaeste
- Slack Connect (1:1 und Channels, bis zu 2 Organisationen pro Channel)
- Workflow Builder (eingeschraenkt)
- Clips (Audio-/Videonachrichten)
- Custom Retention Policies
- Google SSO
- Listen (Task-Tracking)

### 33.3 Business+ (~12,50 EUR/Nutzer/Monat)

- Alle Pro-Features plus:
- SAML SSO
- Erweiterte Admin-Tools (Channel Management Tools)
- Data Export (inklusive DMs und private Channels)
- 2FA-Pflicht
- Session-Management
- 20 GB Dateispeicher pro Nutzer
- Compliance-Funktionen
- Slack Connect (bis zu 250 Organisationen pro Channel)

### 33.4 Enterprise Grid (auf Anfrage)

- Alle Business+ Features plus:
- Multi-Workspace-Unterstuetzung (unbegrenzt)
- Org-weite Channels und Policies
- Enterprise Key Management (EKM)
- DLP-Integration
- eDiscovery
- SCIM Provisioning (automatische Nutzer-Sync)
- Audit-Logs API
- 1 TB Dateispeicher pro Nutzer
- HIPAA-Compliance moeglich
- Dedizierter Customer Success Manager
- SLA mit 99,99% Uptime-Garantie

---

## Anhang A: Link-Vorschauen (Unfurling)

### Verhalten

- URLs in Nachrichten werden automatisch mit einer Vorschau dargestellt
- Vorschau enthaelt: Titel, Beschreibung, Thumbnail (basierend auf Open Graph / Twitter Cards Meta-Tags)
- Spezielle Rich-Unfurls fuer bekannte Dienste: YouTube (Player), Twitter/X (Tweet), GitHub (Issue/PR), Google Docs, etc.
- Nutzer koennen die Vorschau per "X" entfernen
- Admins koennen Unfurling deaktivieren
- Apps koennen eigene Unfurls fuer ihre Domains registrieren

---

## Anhang B: E-Mail-Integration

- **E-Mail an Channel weiterleiten:** Jeder Channel hat eine optionale E-Mail-Adresse
- Eingehende E-Mails werden als Nachricht im Channel gepostet
- Abhaengig vom Plan und Admin-Einstellungen
- E-Mail-Adresse ist konfigurierbar (Zufalls-Adresse oder Custom)

---

## Anhang C: RSS/Feed-Integration

- `/feed subscribe [URL]` — RSS-Feed in Channel abonnieren
- Neue Eintraege werden automatisch als Nachrichten gepostet
- `/feed list` — Aktive Feeds im Channel anzeigen
- `/feed remove [URL]` — Feed entfernen

---

## Anhang D: Datenmodell (konzeptionell)

Fuer die Entwicklung einer Slack-Alternative sind folgende Kern-Entitaeten relevant:

```
Workspace
├── Users (Members, Admins, Owners, Guests)
├── Channels (Public, Private)
│   ├── Messages
│   │   ├── Threads (Replies)
│   │   ├── Reactions
│   │   ├── Files/Attachments
│   │   ├── Pins
│   │   └── Bookmarks
│   ├── Members (Channel Membership)
│   ├── Channel Settings (Topic, Description, Notifications)
│   └── Bookmarks Bar
├── Direct Messages
│   ├── 1:1 DMs
│   └── Group DMs (max 9)
├── User Groups
├── Custom Emoji
├── Apps / Integrations
│   ├── Bot Users
│   ├── Incoming Webhooks
│   ├── Slash Commands
│   └── Workflows
├── Canvases
├── Lists
├── Files (zentrale Dateiverwaltung)
├── Saved Items (pro User)
├── Reminders (pro User)
├── Drafts (pro User)
├── Scheduled Messages
└── Workspace Settings
    ├── Permissions
    ├── Retention Policies
    ├── Authentication Config
    ├── Notification Defaults
    └── Custom Profile Fields
```

---

## Anhang E: Echtzeit-Architektur

Slack verwendet eine Echtzeit-Architektur fuer sofortige Nachrichtenzustellung:

- **WebSocket-Verbindung:** Jeder Client haelt eine persistente WebSocket-Verbindung
- **Events:** Neue Nachrichten, Reaktionen, Typing-Indikatoren, Praesenz-Updates werden in Echtzeit gepusht
- **Typing-Indikator:** "[User] tippt..." — erscheint waehrend der Eingabe, verschwindet nach Inaktivitaet
- **Read Receipts / Unread Markers:** Server trackt die letzte gelesene Nachricht pro Nutzer pro Channel
- **Reconnection:** Automatische Wiederverbindung bei Netzwerkunterbrechung mit Gap-Sync
- **Optimistic Updates:** Nachrichten erscheinen sofort lokal, bevor Server-Bestaetigung

---

*Dokument erstellt am 13.04.2026 als Grundlage fuer die Entwicklung einer eigenstaendigen Messaging-/Kollaborationsplattform.*
