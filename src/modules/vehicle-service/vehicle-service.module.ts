import { Module } from '@nestjs/common';
import { VehicleServiceController } from './vehicle-service.controller';
import { VehicleService } from './vehicle.service';
import { OpenAIModule } from '../integrations/open-ia/open-ai.module';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { CommonsModule } from '../commons/commons.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { QueueService } from './queue.service';
import { VehicleServiceMapper } from './vehicle-service.mapper';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.register([
      {
        name: 'QUEUE_SERVICE_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
          queue: process.env.RABBITMQ_QUEUE,
          queueOptions: { durable: true },
        },
      },
    ]),
    OpenAIModule,
    PrismaModule,
    CommonsModule,
  ],
  controllers: [VehicleServiceController],
  providers: [VehicleService, QueueService, VehicleServiceMapper],
})
export class VehicleServiceModule {}
