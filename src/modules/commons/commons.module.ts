import { Module } from '@nestjs/common';
import { CsvParserService } from './csv-parser.service';
import { ApiIntegrationService } from './api-integration.service';

@Module({
  providers: [CsvParserService, ApiIntegrationService],
  exports: [CsvParserService, ApiIntegrationService],
})
export class CommonsModule {}
