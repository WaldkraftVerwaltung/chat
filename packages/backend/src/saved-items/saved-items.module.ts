import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedItem } from './saved-item.entity';
import { SavedItemsService } from './saved-items.service';
import { SavedItemsController } from './saved-items.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SavedItem])],
  controllers: [SavedItemsController],
  providers: [SavedItemsService],
  exports: [SavedItemsService],
})
export class SavedItemsModule {}
