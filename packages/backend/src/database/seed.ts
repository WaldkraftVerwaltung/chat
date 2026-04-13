import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { ChannelsService } from '../channels/channels.service';
import { UsersService } from '../users/users.service';
import { ChannelType, UserRole } from '@chat/shared';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const workspacesService = app.get(WorkspacesService);
  const channelsService = app.get(ChannelsService);
  const usersService = app.get(UsersService);

  // 1. Ensure default workspace
  const workspace = await workspacesService.ensureDefault();
  console.log(`Workspace: ${workspace.name} (${workspace.id})`);

  // 2. Create users
  const passwordHash = await bcrypt.hash('Chat2026!', 12);

  let jacob = await usersService.findByEmail('jacob@waldkraft.bio');
  if (!jacob) {
    jacob = await usersService.create({
      email: 'jacob@waldkraft.bio',
      passwordHash,
      displayName: 'Jacob',
      fullName: 'Jacob Dill',
      role: UserRole.PRIMARY_OWNER,
      workspaceId: workspace.id,
      timezone: 'Europe/Berlin',
    });
    console.log('Created user: Jacob (Primary Owner)');
  } else {
    console.log('User Jacob already exists');
  }

  let andre = await usersService.findByEmail('andre@waldkraft.bio');
  if (!andre) {
    andre = await usersService.create({
      email: 'andre@waldkraft.bio',
      passwordHash,
      displayName: 'Andre',
      fullName: 'Andre Waldkraft',
      role: UserRole.MEMBER,
      workspaceId: workspace.id,
      timezone: 'Europe/Berlin',
    });
    console.log('Created user: Andre (Member)');
  } else {
    console.log('User Andre already exists');
  }

  // 3. Ensure #general channel
  let general;
  try {
    general = await channelsService.create(
      { name: 'general', type: ChannelType.PUBLIC, description: 'Allgemeiner Channel' },
      jacob.id, workspace.id,
    );
    console.log('Created #general channel');
  } catch {
    console.log('#general already exists');
    // Find existing general channel and add members
    const channels = await channelsService.findAll(workspace.id, jacob.id);
    general = channels.find((c) => c.name === 'general');
  }

  // 4. Add both users to #general
  if (general) {
    try { await channelsService.addMember(general.id, jacob.id); } catch {}
    try { await channelsService.addMember(general.id, andre.id); } catch {}
    console.log('Both users added to #general');
  }

  // 5. Create a second channel
  try {
    const team = await channelsService.create(
      { name: 'team', type: ChannelType.PUBLIC, description: 'Team-Kanal' },
      jacob.id, workspace.id,
    );
    await channelsService.addMember(team.id, andre.id);
    console.log('Created #team channel with both users');
  } catch {
    console.log('#team already exists');
  }

  await app.close();
  console.log('\nSeed complete!');
  console.log('---');
  console.log('Login-Daten:');
  console.log('  Jacob (Super Admin): jacob@waldkraft.bio / Chat2026!');
  console.log('  Andre (Member):      andre@waldkraft.bio / Chat2026!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
