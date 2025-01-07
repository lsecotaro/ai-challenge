import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { VehicleServiceRequestDto } from './dto/vehicle-service-request.dto';
import { EnrichedVehicleServiceDto } from './dto/enriched/enriched-vehicle-service.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CsvParserService } from '../commons/csv-parser.service';

@Controller('vehicle-service')
export class VehicleServiceController {
  constructor(
    private readonly vehicleService: VehicleService,
    private readonly csvParserService: CsvParserService,
  ) {}

  @Post('clean')
  async cleanNews(
    @Body() request: Array<VehicleServiceRequestDto>,
  ): Promise<Array<EnrichedVehicleServiceDto> | void> {
    return await this.vehicleService.processNews(request);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('csv'))
  async uploadCsv(@UploadedFile() file: Express.Multer.File) {
    const buffer = file.buffer;
    const parsedData = await this.csvParserService.parseCsv(buffer);
    return this.vehicleService.processUploadCsv(parsedData, file.originalname);
  }
}
