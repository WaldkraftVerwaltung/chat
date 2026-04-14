import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileAttachment } from './file-attachment.entity';
import { S3Service } from './s3.service';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import * as path from 'path';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileAttachment) private readonly fileRepo: Repository<FileAttachment>,
    private s3: S3Service,
  ) {}

  async upload(file: Express.Multer.File, userId: string, messageId?: string): Promise<FileAttachment> {
    const id = uuid();
    const ext = path.extname(file.originalname);
    const storageKey = `files/${id}${ext}`;

    await this.s3.upload(storageKey, file.buffer, file.mimetype);

    let thumbnailKey: string | null = null;
    let width: number | null = null;
    let height: number | null = null;

    if (file.mimetype.startsWith('image/')) {
      try {
        const metadata = await sharp(file.buffer).metadata();
        width = metadata.width || null;
        height = metadata.height || null;

        if (width && height) {
          const thumbBuffer = await sharp(file.buffer).resize(300, 300, { fit: 'inside' }).jpeg({ quality: 80 }).toBuffer();
          thumbnailKey = `thumbnails/${id}.jpg`;
          await this.s3.upload(thumbnailKey, thumbBuffer, 'image/jpeg');
        }
      } catch {}
    }

    const attachment = this.fileRepo.create({
      id, filename: `${id}${ext}`, originalFilename: file.originalname,
      mimeType: file.mimetype, sizeBytes: file.size, storageKey,
      thumbnailKey, width, height, userId, messageId: messageId || null,
    });
    return this.fileRepo.save(attachment);
  }

  async findById(id: string): Promise<FileAttachment> {
    const file = await this.fileRepo.findOne({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  async getDownloadUrl(id: string): Promise<string> {
    const file = await this.findById(id);
    return this.s3.getSignedDownloadUrl(file.storageKey);
  }

  async getThumbnailUrl(id: string): Promise<string | null> {
    const file = await this.findById(id);
    if (!file.thumbnailKey) return null;
    return this.s3.getSignedDownloadUrl(file.thumbnailKey);
  }

  async delete(id: string, userId: string): Promise<void> {
    const file = await this.findById(id);
    await this.s3.delete(file.storageKey);
    if (file.thumbnailKey) await this.s3.delete(file.thumbnailKey);
    await this.fileRepo.remove(file);
  }

  async findByMessage(messageId: string): Promise<FileAttachment[]> {
    return this.fileRepo.find({ where: { messageId }, order: { createdAt: 'ASC' } });
  }

  async findAll(limit = 100): Promise<FileAttachment[]> {
    return this.fileRepo.find({
      relations: ['user', 'message', 'message.channel'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
