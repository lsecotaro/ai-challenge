import { Module } from '@nestjs/common';
import { VehicleServiceHistoryController } from './vehicle-service-history.controller';
import { VehicleServiceHistoryService } from './vehicle-service-history.service';

@Module({
  imports: [],
  controllers: [VehicleServiceHistoryController],
  providers: [VehicleServiceHistoryService],
})
export class VehicleServiceHistoryModule {}
