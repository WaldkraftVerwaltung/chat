import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './workspace.entity';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace) private readonly workspaceRepo: Repository<Workspace>,
  ) {}

  async findBySlug(slug: string): Promise<Workspace | null> {
    return this.workspaceRepo.findOne({ where: { slug } });
  }

  async findById(id: string): Promise<Workspace | null> {
    return this.workspaceRepo.findOne({ where: { id } });
  }

  async update(id: string, data: Partial<Workspace>): Promise<Workspace> {
    await this.workspaceRepo.update(id, data);
    return this.findById(id) as Promise<Workspace>;
  }

  async ensureDefault(): Promise<Workspace> {
    const DEFAULT_ID = '00000000-0000-0000-0000-000000000001';
    let ws = await this.workspaceRepo.findOne({ where: { id: DEFAULT_ID } });
    if (!ws) {
      ws = this.workspaceRepo.create({ id: DEFAULT_ID, name: 'SOFTGAMES', slug: 'default', settings: {} });
      ws = await this.workspaceRepo.save(ws);
    } else if (ws.name !== 'SOFTGAMES') {
      ws.name = 'SOFTGAMES';
      ws = await this.workspaceRepo.save(ws);
    }
    return ws;
  }
}
