import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaVehicleServiceRepository } from './prisma-vehicle-service.repository';
import { PrismaReminderRepository } from './prisma-reminder.repository';

@Module({
  providers: [
    {
      provide: 'VehicleServiceRepository',
      useClass: PrismaVehicleServiceRepository,
    },
    {
      provide: 'ReminderRepository',
      useClass: PrismaReminderRepository,
    },
    PrismaService,
  ],
  exports: [PrismaService, 'VehicleServiceRepository', 'ReminderRepository'],
})
export class PrismaModule {}
