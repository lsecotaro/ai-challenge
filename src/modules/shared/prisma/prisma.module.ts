import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaVehicleServiceRepository } from './prisma-vehicle-service.repository';

@Module({
  providers: [
    {
      provide: 'VehicleServiceRepository',
      useClass: PrismaVehicleServiceRepository,
    },
    PrismaService,
  ],
  exports: [PrismaService, 'VehicleServiceRepository'],
})
export class PrismaModule {}
