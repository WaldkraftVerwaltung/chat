import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { ChannelsService } from '../channels/channels.service';
import { UsersService } from '../users/users.service';
import { ChannelType, UserRole, PostingPermission } from '@chat/shared';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Message } from '../messages/message.entity';
import { Reaction } from '../reactions/reaction.entity';
import { DmService } from '../dm/dm.service';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const workspacesService = app.get(WorkspacesService);
  const channelsService = app.get(ChannelsService);
  const usersService = app.get(UsersService);
  const dmService = app.get(DmService);
  const messageRepo = app.get(getRepositoryToken(Message));
  const reactionRepo = app.get(getRepositoryToken(Reaction));
  const dataSource = app.get(DataSource);

  // 1. Ensure default workspace
  const workspace = await workspacesService.ensureDefault();
  console.log(`Workspace: ${workspace.name} (${workspace.id})`);

  // 2. Create all users
  const passwordHash = await bcrypt.hash('Chat2026!', 12);

  const userDefs = [
    { email: 'jacob@waldkraft.bio',     displayName: 'Jacob',     fullName: 'Jacob Dill',           role: UserRole.PRIMARY_OWNER, avatarSeed: 'Jacob'     },
    { email: 'andre@waldkraft.bio',     displayName: 'Andre',     fullName: 'Andre Neumann',        role: UserRole.MEMBER,        avatarSeed: 'Andre'     },
    { email: 'bjoern@waldkraft.bio',    displayName: 'Björn',     fullName: 'Björn Schmidt',        role: UserRole.ADMIN,         avatarSeed: 'Bjoern'    },
    { email: 'lisa@waldkraft.bio',      displayName: 'Lisa',      fullName: 'Lisa Müller',          role: UserRole.MEMBER,        avatarSeed: 'Lisa'      },
    { email: 'thomas@waldkraft.bio',    displayName: 'Thomas',    fullName: 'Thomas Weber',         role: UserRole.MEMBER,        avatarSeed: 'Thomas'    },
    { email: 'sarah@waldkraft.bio',     displayName: 'Sarah',     fullName: 'Sarah Koch',           role: UserRole.MEMBER,        avatarSeed: 'Sarah'     },
    { email: 'michael@waldkraft.bio',   displayName: 'Michael',   fullName: 'Michael Braun',        role: UserRole.MEMBER,        avatarSeed: 'Michael'   },
    { email: 'julia@waldkraft.bio',     displayName: 'Julia',     fullName: 'Julia Fischer',        role: UserRole.MEMBER,        avatarSeed: 'Julia'     },
    { email: 'stefan@waldkraft.bio',    displayName: 'Stefan',    fullName: 'Stefan Wagner',        role: UserRole.MEMBER,        avatarSeed: 'Stefan'    },
    { email: 'katharina@waldkraft.bio', displayName: 'Katharina', fullName: 'Katharina Becker',     role: UserRole.MEMBER,        avatarSeed: 'Katharina' },
    { email: 'florian@waldkraft.bio',   displayName: 'Florian',   fullName: 'Florian Zimmering',    role: UserRole.MEMBER,        avatarSeed: 'Florian'   },
    { email: 'maria@waldkraft.bio',     displayName: 'Maria',     fullName: 'Maria Hoffmann',       role: UserRole.MEMBER,        avatarSeed: 'Maria'     },
    { email: 'christian@waldkraft.bio', displayName: 'Christian', fullName: 'Christian Schäfer',    role: UserRole.MEMBER,        avatarSeed: 'Christian' },
    { email: 'anna@waldkraft.bio',      displayName: 'Anna',      fullName: 'Anna Richter',         role: UserRole.MEMBER,        avatarSeed: 'Anna'      },
    { email: 'markus@waldkraft.bio',    displayName: 'Markus',    fullName: 'Markus Wolf',          role: UserRole.MEMBER,        avatarSeed: 'Markus'    },
    { email: 'laura@waldkraft.bio',     displayName: 'Laura',     fullName: 'Laura Klein',          role: UserRole.MEMBER,        avatarSeed: 'Laura'     },
    { email: 'daniel@waldkraft.bio',    displayName: 'Daniel',    fullName: 'Daniel Hartmann',      role: UserRole.MEMBER,        avatarSeed: 'Daniel'    },
    { email: 'sophie@waldkraft.bio',    displayName: 'Sophie',    fullName: 'Sophie Krause',        role: UserRole.MEMBER,        avatarSeed: 'Sophie'    },
    { email: 'patrick@waldkraft.bio',   displayName: 'Patrick',   fullName: 'Patrick Lehmann',      role: UserRole.MEMBER,        avatarSeed: 'Patrick'   },
    { email: 'elena@waldkraft.bio',     displayName: 'Elena',     fullName: 'Elena Schulz',         role: UserRole.MEMBER,        avatarSeed: 'Elena'     },
  ];

  const users: Record<string, any> = {};
  for (const def of userDefs) {
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${def.avatarSeed}`;
    let user = await usersService.findByEmail(def.email);
    if (!user) {
      user = await usersService.create({
        email: def.email,
        passwordHash,
        displayName: def.displayName,
        fullName: def.fullName,
        role: def.role,
        workspaceId: workspace.id,
        timezone: 'Europe/Berlin',
        avatarUrl,
      });
      console.log(`Created user: ${def.fullName} (${def.role})`);
    } else {
      console.log(`User ${def.displayName} already exists`);
    }
    if (!user.avatarUrl) {
      user.avatarUrl = avatarUrl;
      await usersService.updateProfile(user.id, { avatarUrl } as any);
      console.log(`Updated avatarUrl for ${def.displayName}`);
    }
    users[def.displayName] = user;
  }

  // Helper: create or find channel
  async function ensureChannel(
    name: string,
    description: string,
    type: ChannelType,
    memberKeys: string[],
    postingPermission: PostingPermission = PostingPermission.EVERYONE,
  ) {
    let channel: any;
    try {
      channel = await channelsService.create(
        { name, type, description, postingPermission },
        users['Jacob'].id,
        workspace.id,
      );
      console.log(`Created #${name}`);
    } catch {
      const all = await channelsService.findAll(workspace.id, users['Jacob'].id);
      channel = all.find((c: any) => c.name === name);
      if (!channel) {
        console.error(`Could not find or create channel #${name}`);
        return null;
      }
      console.log(`#${name} already exists`);
    }
    // Add members
    for (const key of memberKeys) {
      const u = users[key];
      if (!u) continue;
      try { await channelsService.addMember(channel.id, u.id); } catch {}
    }
    return channel;
  }

  // Helper: create message (idempotent via try/catch)
  async function msg(
    channelId: string | null,
    dmConversationId: string | null,
    userId: string,
    content: string,
    createdAt: Date,
    threadParentId?: string,
  ): Promise<any> {
    const m = messageRepo.create({
      channelId,
      dmConversationId: dmConversationId ?? undefined,
      userId,
      content,
      threadParentId: threadParentId ?? null,
    });
    const saved = await messageRepo.save(m);
    // Override createdAt via raw query (TypeORM CreateDateColumn ignores the value)
    try {
      await dataSource.query(
        `UPDATE messages SET created_at = $1 WHERE id = $2`,
        [createdAt, saved.id],
      );
    } catch {}
    return saved;
  }

  // Helper: add reaction
  async function react(messageId: string, userId: string, emojiCode: string) {
    try {
      await reactionRepo.save(reactionRepo.create({ messageId, userId, emojiCode }));
    } catch {} // unique constraint — ignore duplicates
  }

  // Helper: add multiple reactions from a list of user display names
  async function reactMany(messageId: string, userKeys: string[], emojiCode: string) {
    for (const key of userKeys) {
      if (users[key]) await react(messageId, users[key].id, emojiCode);
    }
  }

  // 3. Create channels
  const allUsers = Object.keys(users);

  const general = await ensureChannel(
    'general', 'Allgemeiner Channel für das gesamte Team', ChannelType.PUBLIC, allUsers,
  );
  const team = await ensureChannel(
    'team', 'Team-Kanal für alle Mitarbeiter', ChannelType.PUBLIC, allUsers,
  );
  const marketing = await ensureChannel(
    'marketing', 'Marketing-Team', ChannelType.PUBLIC,
    ['Jacob', 'Lisa', 'Florian', 'Anna', 'Laura', 'Sophie'],
  );
  const entwicklung = await ensureChannel(
    'entwicklung', 'Entwicklung & IT', ChannelType.PRIVATE,
    ['Jacob', 'Björn', 'Thomas', 'Stefan', 'Christian', 'Daniel', 'Patrick'],
  );
  const support = await ensureChannel(
    'support', 'Kundensupport', ChannelType.PRIVATE,
    ['Andre', 'Sarah', 'Julia', 'Katharina', 'Maria'],
  );
  const lager = await ensureChannel(
    'lager', 'Lager & Versand', ChannelType.PRIVATE,
    ['Björn', 'Michael', 'Markus', 'Elena'],
  );
  const management = await ensureChannel(
    'management', 'Geschäftsleitung', ChannelType.PRIVATE,
    ['Jacob', 'Björn', 'Lisa'],
  );
  const random = await ensureChannel(
    'random', 'Off-Topic — alles was nicht in andere Channels passt', ChannelType.PUBLIC, allUsers,
  );
  const ankuendigungen = await ensureChannel(
    'ankuendigungen', 'Ankündigungen für das gesamte Team', ChannelType.PUBLIC, allUsers,
    PostingPermission.ADMINS,
  );
  const projekte = await ensureChannel(
    'projekte', 'Projektmanagement', ChannelType.PRIVATE,
    ['Jacob', 'Thomas', 'Stefan', 'Julia', 'Daniel'],
  );

  // 4. Seed messages

  // ── #general ──────────────────────────────────────────────────────────────
  if (general) {
    const g = general.id;
    const j = users['Jacob'].id;
    const bj = users['Björn'].id;
    const li = users['Lisa'].id;
    const th = users['Thomas'].id;
    const sa = users['Sarah'].id;
    const mi = users['Michael'].id;
    const an = users['Andre'].id;

    // Message 1: Jacob — Team-Meeting
    const m1 = await msg(g, null, j,
      'Guten Morgen zusammen! 👋 Kurze Erinnerung: Heute um 14 Uhr ist das Team-Meeting.',
      new Date('2026-04-13T08:00:00+02:00'),
    );
    await reactMany(m1.id, ['Björn', 'Lisa', 'Thomas', 'Sarah', 'Michael', 'Andre'], '👍');
    // Thread replies
    const m1r1 = await msg(g, null, bj, 'Bin dabei! Soll ich die Quartalszahlen mitbringen?',
      new Date('2026-04-13T08:03:00+02:00'), m1.id);
    await msg(g, null, j, 'Ja bitte, das wäre super 👍',
      new Date('2026-04-13T08:05:00+02:00'), m1.id);

    // Message 2: Lisa — Brand Guide
    const m2 = await msg(g, null, li,
      'Hat jemand den Link zum neuen Brand Guide? Ich finde ihn nicht mehr.',
      new Date('2026-04-13T08:15:00+02:00'),
    );
    await msg(g, null, j, 'Ist im Google Drive unter "Marketing / Brand / Brand Guide 2026.pdf" — ich schick dir gleich den Link direkt 📎',
      new Date('2026-04-13T08:17:00+02:00'), m2.id);
    await reactMany(m2.id, ['Thomas', 'Stefan'], '🤔');

    // Message 3: Thomas — Server-Umzug
    const m3 = await msg(g, null, th,
      'Der Server-Umzug ist für nächste Woche geplant. Bitte sichert eure lokalen Daten.',
      new Date('2026-04-13T09:00:00+02:00'),
    );
    await reactMany(m3.id, ['Jacob', 'Björn', 'Lisa', 'Stefan', 'Christian'], '👍');

    // Message 4: Sarah — Frohe Ostern
    const m4 = await msg(g, null, sa,
      'Frohe Ostern euch allen! 🐰🥚',
      new Date('2026-04-10T09:00:00+02:00'),
    );
    await reactMany(m4.id, ['Jacob', 'Björn', 'Lisa', 'Thomas', 'Michael', 'Andre', 'Julia', 'Katharina'], '❤️');
    await reactMany(m4.id, ['Florian', 'Anna', 'Laura'], '🎉');

    // Message 5: Björn — Wawi-Update WICHTIG
    const m5 = await msg(g, null, bj,
      '*WICHTIG*: Wawi-Update auf neue Version 1.11.7 — Morgen 7 Uhr. Bitte alle Wawi und WMS schliessen ab 7:00.',
      new Date('2026-04-12T17:00:00+02:00'),
    );
    await reactMany(m5.id,
      ['Jacob', 'Lisa', 'Thomas', 'Sarah', 'Michael', 'Julia', 'Stefan',
       'Katharina', 'Florian', 'Maria', 'Christian', 'Anna'], '👍');
    const m5r1 = await msg(g, null, mi,
      'Wie lange dauert das Update ungefähr?',
      new Date('2026-04-12T17:05:00+02:00'), m5.id);
    await msg(g, null, bj,
      'Ca. 30 Minuten, ich melde mich sobald wir durch sind.',
      new Date('2026-04-12T17:08:00+02:00'), m5.id);

    // Message 6: Andre — Kaffeevollautomat
    const m6 = await msg(g, null, an,
      'Neuer Kaffeevollautomat ist da! ☕ Steht in der Küche.',
      new Date('2026-04-11T10:30:00+02:00'),
    );
    await reactMany(m6.id,
      ['Jacob', 'Björn', 'Lisa', 'Thomas', 'Sarah', 'Michael', 'Julia', 'Stefan',
       'Katharina', 'Florian', 'Maria', 'Christian', 'Anna', 'Markus', 'Laura'], '🎉');
    await reactMany(m6.id, ['Jacob', 'Lisa', 'Thomas', 'Stefan', 'Florian', 'Laura'], '☕');

    // Message 7: Björn — Ankündigung Betriebsausflug
    const m7 = await msg(g, null, bj,
      'Kurze Info: Der Betriebsausflug findet am 6. Juni statt. Details folgen in Kürze. Schon mal Datum vormerken! 📅',
      new Date('2026-04-11T14:00:00+02:00'),
    );
    await reactMany(m7.id, ['Jacob', 'Lisa', 'Thomas', 'Sarah', 'Michael', 'Julia', 'Stefan', 'Maria'], '🎉');

    // Message 8: Jacob — Umsatzziel
    const m8 = await msg(g, null, j,
      'Q1 abgeschlossen — wir haben unser Umsatzziel um 12% übertroffen! Großartige Leistung von allen 💪🏆',
      new Date('2026-04-01T09:00:00+02:00'),
    );
    await reactMany(m8.id,
      ['Björn', 'Lisa', 'Thomas', 'Sarah', 'Michael', 'Julia', 'Stefan',
       'Katharina', 'Florian', 'Maria', 'Christian', 'Anna', 'Markus', 'Laura', 'Daniel', 'Sophie'], '🎉');
    await reactMany(m8.id, ['Björn', 'Lisa', 'Florian', 'Anna'], '💪');

    // Message 9: Katharina — Neue Arbeitszeiten
    await msg(g, null, users['Katharina'].id,
      'Erinnerung: Ab nächster Woche gelten die neuen Gleitzeitregelungen. Kernzeit ist 9-15 Uhr. Fragen gerne an HR.',
      new Date('2026-04-10T11:00:00+02:00'),
    );

    // Message 10: Florian — IT-Tool
    const m10 = await msg(g, null, users['Florian'].id,
      'Das neue interne Tool ist jetzt live auf teamtest.waldkraft.bio — bitte mal ausprobieren und Feedback geben! 🚀',
      new Date('2026-04-09T16:00:00+02:00'),
    );
    await reactMany(m10.id, ['Jacob', 'Björn', 'Lisa', 'Thomas', 'Andre'], '🚀');
    await msg(g, null, users['Anna'].id, 'Super! Ich teste es gleich 👍',
      new Date('2026-04-09T16:05:00+02:00'), m10.id);
    await msg(g, null, users['Sophie'].id, 'Sieht wirklich gut aus! 😍',
      new Date('2026-04-09T16:20:00+02:00'), m10.id);
  }

  // ── #marketing ────────────────────────────────────────────────────────────
  if (marketing) {
    const mkt = marketing.id;
    const li = users['Lisa'].id;
    const fl = users['Florian'].id;
    const an = users['Anna'].id;
    const la = users['Laura'].id;
    const sp = users['Sophie'].id;
    const ja = users['Jacob'].id;

    const mm1 = await msg(mkt, null, li,
      'Neue Kampagne für Arthridea läuft seit heute. Erste Ergebnisse sehen vielversprechend aus.',
      new Date('2026-04-13T09:00:00+02:00'),
    );
    await reactMany(mm1.id, ['Jacob', 'Florian', 'Anna'], '🔥');

    const mm2 = await msg(mkt, null, fl,
      '@Lisa der Accountplan sollte jetzt von jedem aufgerufen und betrachtet werden können. Gerne mal testen.',
      new Date('2026-04-12T10:30:00+02:00'),
    );
    await msg(mkt, null, li, 'Funktioniert perfekt, danke! ✅',
      new Date('2026-04-12T10:45:00+02:00'), mm2.id);

    const mm3 = await msg(mkt, null, an,
      'Newsletter-Entwurf ist fertig. Kann jemand gegenlesen? 🙏',
      new Date('2026-04-11T14:00:00+02:00'),
    );
    await msg(mkt, null, la, 'Ich schau drüber, schick mal den Link',
      new Date('2026-04-11T14:10:00+02:00'), mm3.id);
    await msg(mkt, null, an, 'Super danke! Schicke dir gleich den Drive-Link.',
      new Date('2026-04-11T14:12:00+02:00'), mm3.id);

    const mm4 = await msg(mkt, null, sp,
      'Social Media Report KW 15: Instagram +340 Follower, Facebook +89, TikTok +1.2K 🚀',
      new Date('2026-04-10T16:00:00+02:00'),
    );
    await reactMany(mm4.id, ['Lisa', 'Florian', 'Anna', 'Laura'], '🔥');
    await reactMany(mm4.id, ['Jacob', 'Lisa'], '🎉');

    await msg(mkt, null, la,
      'Achtung: Die neuen Produktfotos sind auf Google Drive hochgeladen. Ordner "Produktfotos Q2 2026"',
      new Date('2026-04-09T11:00:00+02:00'),
    );

    await msg(mkt, null, li,
      'Planungsmeeting nächste Woche Dienstag 10 Uhr. Bitte alle kommen mit Q2-Ideen vorbereitet.',
      new Date('2026-04-08T17:00:00+02:00'),
    );

    const mm6 = await msg(mkt, null, ja,
      'Das neue Produktvideo ist fertig! Schaut es euch mal an und gebt Feedback bevor wir es live schalten.',
      new Date('2026-04-07T15:00:00+02:00'),
    );
    await reactMany(mm6.id, ['Lisa', 'Florian', 'Anna', 'Laura', 'Sophie'], '😍');

    await msg(mkt, null, fl,
      'Google Ads CTR diese Woche: 4.8% — bisher bester Wert seit Launch! ROAS liegt bei 3.7x 📈',
      new Date('2026-04-06T10:00:00+02:00'),
    );
  }

  // ── #entwicklung ──────────────────────────────────────────────────────────
  if (entwicklung) {
    const ent = entwicklung.id;
    const th = users['Thomas'].id;
    const st = users['Stefan'].id;
    const bj = users['Björn'].id;
    const ch = users['Christian'].id;
    const da = users['Daniel'].id;
    const pa = users['Patrick'].id;
    const ja = users['Jacob'].id;

    const em1 = await msg(ent, null, th,
      'Deployment heute Nacht um 2 Uhr. Wer kann Bereitschaft übernehmen?',
      new Date('2026-04-13T10:00:00+02:00'),
    );
    await msg(ent, null, st, 'Ich mache das. Hab mir schon einen Wecker gestellt 😅',
      new Date('2026-04-13T10:05:00+02:00'), em1.id);
    await msg(ent, null, th, 'Super, danke Stefan! Ich bin auf Rufbereitschaft falls was schiefläuft.',
      new Date('2026-04-13T10:08:00+02:00'), em1.id);

    const em2 = await msg(ent, null, bj,
      'Bug in der Bestellverarbeitung gefunden. Ticket #4521. @Christian kannst du dir das anschauen?',
      new Date('2026-04-12T09:00:00+02:00'),
    );
    await msg(ent, null, ch, 'Bin dran, sieht nach einem Race Condition Problem aus.',
      new Date('2026-04-12T09:20:00+02:00'), em2.id);
    await msg(ent, null, ch, 'Fix ist fertig, PR #289 gestellt. Bitte einmal drüberschauen.',
      new Date('2026-04-12T14:30:00+02:00'), em2.id);

    const em3 = await msg(ent, null, da,
      'PR #287 ist bereit zum Review. Bitte schaut mal drüber wenn ihr Zeit habt.',
      new Date('2026-04-11T15:00:00+02:00'),
    );
    await reactMany(em3.id, ['Thomas', 'Stefan'], '👍');
    await msg(ent, null, th, 'Schau ich mir heute Abend noch an.',
      new Date('2026-04-11T15:10:00+02:00'), em3.id);

    const em4 = await msg(ent, null, pa,
      'Hat jemand Erfahrung mit Redis Cluster? Brauche Hilfe bei der Konfiguration.',
      new Date('2026-04-10T11:00:00+02:00'),
    );
    await msg(ent, null, th, 'Ja, ich hab das bei uns eingerichtet. Lass uns morgen kurz zusammensetzen.',
      new Date('2026-04-10T11:15:00+02:00'), em4.id);
    await msg(ent, null, pa, 'Top, bin um 10 Uhr frei — passt das?',
      new Date('2026-04-10T11:20:00+02:00'), em4.id);
    await msg(ent, null, th, 'Passt! Ich schick dir einen Terminlink.',
      new Date('2026-04-10T11:25:00+02:00'), em4.id);

    const em5 = await msg(ent, null, ja,
      'Neues Feature-Request vom Marketing: Automatische Bildkomprimierung beim Upload. Wer hat Kapazitäten?',
      new Date('2026-04-09T16:00:00+02:00'),
    );
    await msg(ent, null, da, 'Ich könnte das in Sprint 24 einplanen.',
      new Date('2026-04-09T16:30:00+02:00'), em5.id);

    await msg(ent, null, st,
      'Monitoring-Alert war heute Nacht ein False Positive. Uptime ist 99.97%, alles grün ✅',
      new Date('2026-04-08T09:00:00+02:00'),
    );

    await msg(ent, null, ch,
      'TypeScript Upgrade auf 5.4 abgeschlossen — alle Tests grün, keine Breaking Changes.',
      new Date('2026-04-07T17:00:00+02:00'),
    );
  }

  // ── #support ──────────────────────────────────────────────────────────────
  if (support) {
    const sup = support.id;
    const sa = users['Sarah'].id;
    const ju = users['Julia'].id;
    const ka = users['Katharina'].id;
    const an = users['Andre'].id;
    const ma = users['Maria'].id;

    const sm1 = await msg(sup, null, sa,
      'Kunde #12847 hat ein Problem mit der Lieferung. Sendungsverfolgung zeigt "zugestellt", Kunde sagt nein.',
      new Date('2026-04-13T09:00:00+02:00'),
    );
    await msg(sup, null, ju, 'Ich kümmere mich drum, hab den Fall aufgenommen.',
      new Date('2026-04-13T09:05:00+02:00'), sm1.id);
    await msg(sup, null, ju, 'Update: DHL bestätigt Zustellung bei Nachbar. Kunde informiert ✅',
      new Date('2026-04-13T11:30:00+02:00'), sm1.id);

    await msg(sup, null, ka,
      'FAQ-Seite ist aktualisiert. Neue Fragen zu Rückgabe und Umtausch hinzugefügt.',
      new Date('2026-04-12T14:00:00+02:00'),
    );

    await msg(sup, null, an,
      'Reminder: Ab sofort bitte alle Tickets mit Priorität versehen. Hilft uns beim Triage.',
      new Date('2026-04-11T09:00:00+02:00'),
    );

    await msg(sup, null, ma,
      'Telefonzeiten morgen: Ich bin ab 9 Uhr erreichbar, Julia übernimmt ab 14 Uhr.',
      new Date('2026-04-10T17:00:00+02:00'),
    );

    const sm5 = await msg(sup, null, sa,
      'Heute ungewöhnlich viele Anfragen zu Arthridea. Könnte mit der neuen Kampagne zusammenhängen. @Andre weißt du mehr?',
      new Date('2026-04-09T14:00:00+02:00'),
    );
    await msg(sup, null, an, 'Ja, Marketing hat heute eine große E-Mail-Kampagne rausgeschickt. Erwartet ca. 200 Tickets in den nächsten 48h.',
      new Date('2026-04-09T14:10:00+02:00'), sm5.id);
  }

  // ── #lager ────────────────────────────────────────────────────────────────
  if (lager) {
    const lag = lager.id;
    const bj = users['Björn'].id;
    const mi = users['Michael'].id;
    const ma = users['Markus'].id;
    const el = users['Elena'].id;

    const lm1 = await msg(lag, null, bj,
      'Neue Lieferung Arthridea Rohstoffe ist angekommen. Bitte einlagern und in Wawi einbuchen.',
      new Date('2026-04-13T07:30:00+02:00'),
    );
    await reactMany(lm1.id, ['Michael', 'Markus', 'Elena'], '👍');

    await msg(lag, null, mi,
      'Einlagerung abgeschlossen. Chargen-Nr. CH-2026-0412 in Wawi erfasst.',
      new Date('2026-04-13T09:30:00+02:00'),
    );

    const lm3 = await msg(lag, null, ma,
      'Packmaschine A zeigt heute Fehlermeldung E-04. Soll ich den Techniker rufen?',
      new Date('2026-04-12T08:00:00+02:00'),
    );
    await msg(lag, null, bj, 'Ja bitte, Techniker-Nummer ist im Ordner "Wartung" auf dem Schreibtisch.',
      new Date('2026-04-12T08:05:00+02:00'), lm3.id);

    await msg(lag, null, el,
      'Versandstatistik KW 15: 847 Pakete versendet, Rücklaufquote 1.2% — neuer Bestwert 📦✅',
      new Date('2026-04-11T17:00:00+02:00'),
    );

    await msg(lag, null, bj,
      'Schichtplan KW 17 ist erstellt und in der Zeiterfassung hinterlegt. Bitte prüfen und bei Fragen melden.',
      new Date('2026-04-10T16:00:00+02:00'),
    );
  }

  // ── #random ───────────────────────────────────────────────────────────────
  if (random) {
    const ran = random.id;
    const mi = users['Michael'].id;
    const el = users['Elena'].id;
    const st = users['Stefan'].id;
    const li = users['Lisa'].id;
    const pa = users['Patrick'].id;
    const th = users['Thomas'].id;
    const sp = users['Sophie'].id;
    const an = users['Andre'].id;

    const rm1 = await msg(ran, null, mi,
      'Wer hat Lust auf Feierabend-Bier am Freitag? 🍺',
      new Date('2026-04-13T12:00:00+02:00'),
    );
    await reactMany(rm1.id,
      ['Jacob', 'Björn', 'Thomas', 'Stefan', 'Christian', 'Daniel', 'Patrick', 'Andre', 'Markus'], '🍺');
    await reactMany(rm1.id, ['Lisa', 'Florian', 'Anna', 'Laura'], '🎉');
    await msg(ran, null, el, 'Bin dabei!',
      new Date('2026-04-13T12:05:00+02:00'), rm1.id);
    await msg(ran, null, st, 'Same! Wo treffen wir uns?',
      new Date('2026-04-13T12:07:00+02:00'), rm1.id);
    await msg(ran, null, mi, 'Vorschlag: Brauhaus am Markt, 18 Uhr?',
      new Date('2026-04-13T12:10:00+02:00'), rm1.id);
    await msg(ran, null, st, 'Perfekt! Bin dabei 🍻',
      new Date('2026-04-13T12:12:00+02:00'), rm1.id);

    const rm2 = await msg(ran, null, li,
      'Mein Kaktus im Büro hat geblüht! 🌵🌸',
      new Date('2026-04-12T11:00:00+02:00'),
    );
    await reactMany(rm2.id,
      ['Jacob', 'Thomas', 'Sarah', 'Julia', 'Anna', 'Sophie', 'Katharina'], '😍');

    await msg(ran, null, pa,
      'Fun Fact: Der durchschnittliche Büro-Angestellte geht 8x am Tag zum Kühlschrank.',
      new Date('2026-04-11T13:00:00+02:00'),
    );

    const rm4 = await msg(ran, null, th,
      'Hat jemand ein USB-C Kabel übrig? Meins ist kaputt gegangen.',
      new Date('2026-04-10T14:00:00+02:00'),
    );
    await msg(ran, null, an, 'Ich hab eins in der Schublade, komm kurz vorbei!',
      new Date('2026-04-10T14:05:00+02:00'), rm4.id);

    await msg(ran, null, sp,
      'Mittagessen-Empfehlung: Der neue Thai-Laden in der Friedrichstraße ist richtig gut! 🍜',
      new Date('2026-04-09T13:00:00+02:00'),
    );

    await msg(ran, null, users['Anna'].id,
      'Hat jemand das neue Netflix-Special gesehen? Absolut empfehlenswert 😂',
      new Date('2026-04-08T19:00:00+02:00'),
    );
  }

  // ── #ankuendigungen ───────────────────────────────────────────────────────
  if (ankuendigungen) {
    const ank = ankuendigungen.id;
    const ja = users['Jacob'].id;
    const bj = users['Björn'].id;

    await msg(ank, null, ja,
      '📢 Willkommen im neuen internen Team-Chat! Ab sofort nutzen wir diese Plattform für alle Teamkommunikation.',
      new Date('2026-04-01T09:00:00+02:00'),
    );
    await msg(ank, null, bj,
      '📢 Wawi-Update v1.11.7 erfolgreich abgeschlossen. Alle Systeme laufen normal ✅',
      new Date('2026-04-13T07:30:00+02:00'),
    );
    await msg(ank, null, ja,
      '📢 Q1 Ergebnis: Wir haben alle Ziele übertroffen! Danke an das gesamte Team für die tolle Arbeit 🏆',
      new Date('2026-04-01T10:00:00+02:00'),
    );
  }

  // ── #projekte ─────────────────────────────────────────────────────────────
  if (projekte) {
    const proj = projekte.id;
    const ja = users['Jacob'].id;
    const th = users['Thomas'].id;
    const st = users['Stefan'].id;
    const ju = users['Julia'].id;
    const da = users['Daniel'].id;

    const pm1 = await msg(proj, null, ja,
      'Neues Projekt: Relaunch Kundensupport-Portal. Kickoff nächste Woche Montag 9 Uhr.',
      new Date('2026-04-13T10:00:00+02:00'),
    );
    await reactMany(pm1.id, ['Thomas', 'Stefan', 'Julia', 'Daniel'], '👍');

    await msg(proj, null, th,
      'Technische Architektur für Projekt A ist fertig. Dokument im Drive unter "Projekte / Portal-Relaunch".',
      new Date('2026-04-12T15:00:00+02:00'),
    );

    const pm3 = await msg(proj, null, da,
      'Sprint 23 Review: 18/20 Story Points abgeschlossen. Zwei Tickets verschoben wegen unerwartetem Aufwand.',
      new Date('2026-04-11T17:00:00+02:00'),
    );
    await msg(proj, null, ja, 'Gutes Ergebnis! Was waren die Blocker?',
      new Date('2026-04-11T17:10:00+02:00'), pm3.id);
    await msg(proj, null, da, 'API-Dokumentation war unvollständig, mussten erst beim Anbieter nachfragen.',
      new Date('2026-04-11T17:15:00+02:00'), pm3.id);

    await msg(proj, null, ju,
      'User-Testing für das neue Ticket-Interface abgeschlossen. 8/10 Teilnehmer würden das System weiterempfehlen 🎯',
      new Date('2026-04-10T16:00:00+02:00'),
    );

    await msg(proj, null, st,
      'Staging-Umgebung ist bereit für QA-Tests. URL: teamtest.waldkraft.bio — Login-Daten im Passwort-Manager.',
      new Date('2026-04-09T14:00:00+02:00'),
    );
  }

  // 5. Group DMs
  console.log('\nCreating Group DMs...');

  // DM 1: Jacob + Björn + Lisa (Management)
  const dm1 = await dmService.findOrCreate(workspace.id, [users['Jacob'].id, users['Björn'].id, users['Lisa'].id]);
  console.log('Group DM: Jacob + Björn + Lisa (findOrCreate)');

  if (dm1) {
    await msg(null, dm1.id, users['Jacob'].id,
      'Kurzes Update: Umsatz Q1 liegt 12% über Plan 📈',
      new Date('2026-04-13T08:30:00+02:00'),
    );
    await msg(null, dm1.id, users['Björn'].id,
      'Super Ergebnis! Lager-Durchsatz hat sich auch verbessert.',
      new Date('2026-04-13T08:32:00+02:00'),
    );
    await msg(null, dm1.id, users['Lisa'].id,
      'Marketing-ROI ist bei 3.2x, bester Wert seit 6 Monaten.',
      new Date('2026-04-13T08:35:00+02:00'),
    );
  }

  // DM 2: Thomas + Stefan + Daniel (Dev-Team)
  const dm2 = await dmService.findOrCreate(workspace.id, [users['Thomas'].id, users['Stefan'].id, users['Daniel'].id]);
  console.log('Group DM: Thomas + Stefan + Daniel (findOrCreate)');

  if (dm2) {
    await msg(null, dm2.id, users['Thomas'].id,
      'Deployment war erfolgreich, keine Fehler 🟢',
      new Date('2026-04-13T02:35:00+02:00'),
    );
    await msg(null, dm2.id, users['Stefan'].id,
      'Perfekt. Monitoring sieht auch gut aus.',
      new Date('2026-04-13T02:37:00+02:00'),
    );
    await msg(null, dm2.id, users['Daniel'].id,
      'Nice! Dann können wir morgen mit dem nächsten Sprint starten.',
      new Date('2026-04-13T08:00:00+02:00'),
    );
  }

  // DM 3: Jacob + Andre (1:1)
  const dm3 = await dmService.findOrCreate(workspace.id, [users['Jacob'].id, users['Andre'].id]);
  console.log('1:1 DM: Jacob + Andre (findOrCreate)');

  if (dm3) {
    await msg(null, dm3.id, users['Jacob'].id,
      'Wie läuft das neue Ticketsystem?',
      new Date('2026-04-13T09:00:00+02:00'),
    );
    await msg(null, dm3.id, users['Andre'].id,
      'Gut! Die Teamleistung ist 30% besser seit der Umstellung.',
      new Date('2026-04-13T09:05:00+02:00'),
    );
    await msg(null, dm3.id, users['Jacob'].id,
      'Fantastisch! Ich freue mich auf den Monats-Report.',
      new Date('2026-04-13T09:07:00+02:00'),
    );
  }

  await app.close();

  console.log('\n✅ Seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Login-Daten (alle Passwörter: Chat2026!):');
  console.log('  jacob@waldkraft.bio      — Primary Owner');
  console.log('  andre@waldkraft.bio      — Member');
  console.log('  bjoern@waldkraft.bio     — Admin');
  console.log('  lisa@waldkraft.bio       — Member');
  console.log('  thomas@waldkraft.bio     — Member');
  console.log('  sarah@waldkraft.bio      — Member');
  console.log('  michael@waldkraft.bio    — Member');
  console.log('  julia@waldkraft.bio      — Member');
  console.log('  stefan@waldkraft.bio     — Member');
  console.log('  katharina@waldkraft.bio  — Member');
  console.log('  florian@waldkraft.bio    — Member');
  console.log('  maria@waldkraft.bio      — Member');
  console.log('  christian@waldkraft.bio  — Member');
  console.log('  anna@waldkraft.bio       — Member');
  console.log('  markus@waldkraft.bio     — Member');
  console.log('  laura@waldkraft.bio      — Member');
  console.log('  daniel@waldkraft.bio     — Member');
  console.log('  sophie@waldkraft.bio     — Member');
  console.log('  patrick@waldkraft.bio    — Member');
  console.log('  elena@waldkraft.bio      — Member');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
