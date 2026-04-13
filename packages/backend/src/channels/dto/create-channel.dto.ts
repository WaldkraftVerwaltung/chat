import { IsString, IsEnum, IsOptional, MaxLength, MinLength, Matches } from 'class-validator';
import { ChannelType, PostingPermission } from '@chat/shared';

export class CreateChannelDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Matches(/^[a-z0-9-]+$/, { message: 'Channel name: only lowercase letters, numbers, and hyphens' })
  name: string;

  @IsEnum(ChannelType)
  type: ChannelType;

  @IsString()
  @IsOptional()
  @MaxLength(250)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(250)
  topic?: string;

  @IsEnum(PostingPermission)
  @IsOptional()
  postingPermission?: PostingPermission;
}
