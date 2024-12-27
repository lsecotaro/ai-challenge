import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {VehicleServiceHistoryModule} from "./modules/vehicle-service-history/vehicle-service-history.module";

@Module({
  imports: [VehicleServiceHistoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
