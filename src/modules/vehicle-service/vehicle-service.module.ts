import { Module } from '@nestjs/common';
import { VehicleServiceController } from './vehicle-service.controller';
import { VehicleService } from './vehicle.service';
import { OpenAIModule } from '../integrations/open-ia/open-ai.module';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { CommonsModule } from '../commons/commons.module';

@Module({
  imports: [OpenAIModule, PrismaModule, CommonsModule],
  controllers: [VehicleServiceController],
  providers: [VehicleService],
})
export class VehicleServiceModule {}
