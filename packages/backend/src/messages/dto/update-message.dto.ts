import { IsString, MaxLength } from 'class-validator';

export class UpdateMessageDto {
  @IsString()
  @MaxLength(40000)
  content: string;
}
