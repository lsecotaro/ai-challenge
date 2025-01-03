import { Module } from '@nestjs/common';
import { OpenAIService } from './open-ai.service';

@Module({
  providers: [
    {
      provide: 'AiActions',
      useClass: OpenAIService,
    },
  ],
  exports: ['AiActions'],
})
export class OpenAIModule {}
