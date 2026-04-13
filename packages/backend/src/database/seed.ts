import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { ChannelsService } from '../channels/channels.service';
import { ChannelType } from '@chat/shared';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const workspacesService = app.get(WorkspacesService);
  const channelsService = app.get(ChannelsService);

  const workspace = await workspacesService.ensureDefault();
  console.log(`Workspace: ${workspace.name} (${workspace.id})`);

  try {
    await channelsService.create(
      { name: 'general', type: ChannelType.PUBLIC, description: 'Allgemeiner Channel' },
      workspace.id, workspace.id,
    );
    console.log('Created #general channel');
  } catch { console.log('#general already exists'); }

  await app.close();
  console.log('Seed complete');
}
seed().catch((err) => { console.error('Seed failed:', err); process.exit(1); });
