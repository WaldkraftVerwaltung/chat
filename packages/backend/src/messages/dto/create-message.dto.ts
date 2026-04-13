import { IsString, IsOptional, IsBoolean, MaxLength, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @MaxLength(40000)
  content: string;

  @IsUUID()
  @IsOptional()
  threadParentId?: string;

  @IsBoolean()
  @IsOptional()
  alsoSentToChannel?: boolean;
}
