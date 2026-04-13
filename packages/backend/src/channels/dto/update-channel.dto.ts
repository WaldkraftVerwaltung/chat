import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { PostingPermission } from '@chat/shared';

export class UpdateChannelDto {
  @IsString()
  @IsOptional()
  @MaxLength(250)
  topic?: string;

  @IsString()
  @IsOptional()
  @MaxLength(250)
  description?: string;

  @IsEnum(PostingPermission)
  @IsOptional()
  postingPermission?: PostingPermission;
}
