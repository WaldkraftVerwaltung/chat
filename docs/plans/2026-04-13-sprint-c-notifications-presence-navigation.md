# Sprint C: Benachrichtigungen, Praesenz, Sidebar/Navigation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Benachrichtigungssystem (Desktop-Push, pro-Channel, DND, Keywords), Praesenz-Tracking (Echtzeit online/offline/away), Sidebar mit Sektionen, Quick Switcher, Ungelesen-Zaehler.

**Architecture:** Notification-Entity mit WebSocket-Push, Redis-basiertes Praesenz-Tracking, Sidebar-Sektionen als User-Preferences in DB, Quick Switcher als Frontend-Modal.

**Sprint-Scope:** Tasks 1-8

---

## Task 1: Notification Entity und Service (Backend)

Notification-Entity mit Typen (mention, reaction, thread_reply, channel_invite, dm, system).
NotificationsService mit create, findByUser, getUnreadCount, markAsRead, markAllAsRead.
NotificationsController mit GET /notifications, GET /notifications/count, POST /notifications/mark-read, POST /notifications/mark-all-read.

## Task 2: Mention Detection und Notification Triggers

MentionDetectorService erkennt @user, @here, @channel, @everyone in Nachrichtentext.
ChatGateway erstellt Notifications nach dem Senden und pusht via WebSocket.
Thread-Replies erzeugen Benachrichtigung fuer Thread-Starter.

## Task 3: Unread Tracking

ChannelsService: updateLastRead, getUnreadCounts.
WebSocket mark:read Event. REST GET /channels/unread-counts.

## Task 4: Presence System (Redis)

PresenceService mit Redis SET/GET/EXPIRE. TTL 120s mit Heartbeat.
WebSocket: presence:update bei Connect/Disconnect, presence:heartbeat alle 60s.

## Task 5: Notification und Presence Frontend

NotificationsStore, Activity-Panel, Presence-Dots, Unread-Badges in Sidebar.
Browser Notification API. Heartbeat-Interval.

## Task 6: Sidebar Sections

SidebarSection-Komponente mit Collapse/Expand.
Favoriten, Channels, DMs als Sektionen. Star/Unstar mit localStorage.

## Task 7: Quick Switcher Enhancement

SearchModal zeigt bei leerem Input Recent Channels. Fuzzy-Match auf Channel-Namen.

## Task 8: DND und Push

DND-Felder auf User-Entity. Endpoints und Sidebar-Toggle. Git Push.
