import { Module } from '@nestjs/common';
import { OpenAIService } from './open-ai.service';

@Module({
  providers: [
    {
      provide: 'IaActions',
      useClass: OpenAIService,
    },
  ],
  exports: ['IaActions'],
})
export class OpenAIModule {}
