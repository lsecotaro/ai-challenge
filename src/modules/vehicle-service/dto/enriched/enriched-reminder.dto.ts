import { IsString } from 'class-validator';

export class EnrichedReminderDto {
  @IsString()
  message: string;

  @IsString()
  estimatedDateToNextService: string;
}
