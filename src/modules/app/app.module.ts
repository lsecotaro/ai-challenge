import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VehicleServiceModule } from '../vehicle-service/vehicle-service.module';
import {MulterModule} from "@nestjs/platform-express";
import * as multer from 'multer';


@Module({
  imports: [
    MulterModule.register({
      storage: multer.memoryStorage(),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    VehicleServiceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
