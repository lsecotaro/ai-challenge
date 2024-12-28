import { Module } from '@nestjs/common';
import { VehicleServiceHistoryController } from './vehicle-service-history.controller';
import { VehicleServiceHistoryService } from './vehicle-service-history.service';
import {OpenAIModule} from "../integrations/open-ia/open-ai.module";

@Module({
  imports: [OpenAIModule],
  controllers: [VehicleServiceHistoryController],
  providers: [VehicleServiceHistoryService],
})
export class VehicleServiceHistoryModule {}
