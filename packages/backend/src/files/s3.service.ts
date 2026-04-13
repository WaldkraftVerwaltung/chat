import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service implements OnModuleInit {
  private client: S3Client;
  private bucket: string;

  constructor(private config: ConfigService) {}

  onModuleInit() {
    this.bucket = this.config.get<string>('s3.bucket')!;
    this.client = new S3Client({
      endpoint: this.config.get<string>('s3.endpoint'),
      region: 'us-east-1',
      credentials: {
        accessKeyId: this.config.get<string>('s3.accessKey')!,
        secretAccessKey: this.config.get<string>('s3.secretKey')!,
      },
      forcePathStyle: true,
    });
  }

  async upload(key: string, buffer: Buffer, contentType: string): Promise<void> {
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket, Key: key, Body: buffer, ContentType: contentType,
    }));
  }

  async getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), { expiresIn });
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
