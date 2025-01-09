import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { VehicleServiceRequestDto } from './dto/vehicle-service-request.dto';
import { EnrichedVehicleServiceDto } from './dto/enriched/enriched-vehicle-service.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CsvParserService } from '../commons/csv-parser.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { BatchServiceMessageDto } from './dto/batch-sevice-message.dto';

@Controller('vehicle-service')
export class VehicleServiceController {
  private readonly logger: Logger = new Logger(VehicleServiceController.name);
  constructor(
    private readonly vehicleService: VehicleService,
    private readonly csvParserService: CsvParserService,
  ) {}

  @Post('clean')
  async cleanNews(
    @Body() request: Array<VehicleServiceRequestDto>,
  ): Promise<Array<EnrichedVehicleServiceDto> | void> {
    return await this.vehicleService.processNews(request, 1);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('csv'))
  async uploadCsv(@UploadedFile() file: Express.Multer.File) {
    const buffer = file.buffer;
    const parsedData = await this.csvParserService.parseCsv(buffer);
    return this.vehicleService.processUploadCsv(parsedData, file.originalname);
  }

  @EventPattern('vehicle-service')
  async handleVehicleEvent(
    @Payload() message: BatchServiceMessageDto,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      this.logger.log(
        'Message received: batch ' +
          message.batchNumber +
          ', news: ' +
          message.services.length,
      );
      await this.vehicleService.processNews(
        message.services,
        message.batchNumber,
      );
    } catch (error) {
      console.error('Error processing message:', error);
      channel.nack(originalMessage);
    }
  }
}
