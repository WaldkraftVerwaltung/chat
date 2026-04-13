import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomEmoji } from './custom-emoji.entity';
import { S3Service } from '../files/s3.service';
import * as path from 'path';

@Injectable()
export class EmojiService {
  constructor(
    @InjectRepository(CustomEmoji) private readonly emojiRepo: Repository<CustomEmoji>,
    private s3: S3Service,
  ) {}

  async create(file: Express.Multer.File, name: string, userId: string, workspaceId: string): Promise<CustomEmoji> {
    const existing = await this.emojiRepo.findOne({ where: { name, workspaceId } });
    if (existing) throw new ConflictException(`Emoji :${name}: already exists`);

    const ext = path.extname(file.originalname);
    const storageKey = `emoji/${workspaceId}/${name}${ext}`;
    await this.s3.upload(storageKey, file.buffer, file.mimetype);

    const emoji = this.emojiRepo.create({ name, imageUrl: storageKey, uploadedBy: userId, workspaceId });
    return this.emojiRepo.save(emoji);
  }

  async findAll(workspaceId: string): Promise<CustomEmoji[]> {
    return this.emojiRepo.find({ where: { workspaceId }, order: { name: 'ASC' } });
  }

  async delete(id: string): Promise<void> {
    const emoji = await this.emojiRepo.findOne({ where: { id } });
    if (!emoji) throw new NotFoundException('Emoji not found');
    await this.s3.delete(emoji.imageUrl);
    await this.emojiRepo.remove(emoji);
  }

  async getImageUrl(id: string): Promise<string> {
    const emoji = await this.emojiRepo.findOne({ where: { id } });
    if (!emoji) throw new NotFoundException('Emoji not found');
    return this.s3.getSignedDownloadUrl(emoji.imageUrl);
  }
}
