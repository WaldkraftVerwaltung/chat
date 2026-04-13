import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileAttachment } from './file-attachment.entity';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { S3Service } from './s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([FileAttachment])],
  controllers: [FilesController],
  providers: [FilesService, S3Service],
  exports: [FilesService, S3Service],
})
export class FilesModule {}
