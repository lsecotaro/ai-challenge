import { PrismaService } from './prisma.service';
import { ReminderRepository } from '../../interfaces/reminder.repository';
import { EnrichedReminderDto } from '../../vehicle-service/dto/enriched/enriched-reminder.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaReminderRepository implements ReminderRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(customerId: string, dto: EnrichedReminderDto): any {
    return this.prismaService.reminder.create({
      data: {
        message: dto.message,
        dueDate: new Date(dto.estimatedDateToNextService),
        customer: {
          connect: {
            id: customerId,
          },
        },
      },
    });
  }
}
