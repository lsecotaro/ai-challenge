import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VehicleServiceModule } from '../vehicle-service/vehicle-service.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    VehicleServiceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
