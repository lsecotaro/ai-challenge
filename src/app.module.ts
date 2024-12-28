import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {VehicleServiceHistoryModule} from "./modules/vehicle-service-history/vehicle-service-history.module";

@Module({
  imports: [
    ConfigModule.forRoot({
        isGlobal: true,
    }),
    VehicleServiceHistoryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
