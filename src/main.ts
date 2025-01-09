import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL],
      queue: process.env.RABBITMQ_QUEUE,
      queueOptions: {
        durable: true,
      },
      prefetchCount: 5, // Limit to 5 unacknowledged messages at a time
    },
  });

  await app.startAllMicroservices(); // Start the RabbitMQ listener
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
