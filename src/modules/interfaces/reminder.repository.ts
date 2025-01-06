import { EnrichedReminderDto } from '../vehicle-service/dto/enriched/enriched-reminder.dto';

export interface ReminderRepository {
  create(customerId: string, dto: EnrichedReminderDto): any;
}
