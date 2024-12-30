import { Module } from '@nestjs/common';
import { VehicleServiceController } from './vehicle-service.controller';
import { VehicleService } from './vehicle.service';
import { OpenAIModule } from '../integrations/open-ia/open-ai.module';

@Module({
  imports: [OpenAIModule],
  controllers: [VehicleServiceController],
  providers: [VehicleService],
})
export class VehicleServiceModule {}
