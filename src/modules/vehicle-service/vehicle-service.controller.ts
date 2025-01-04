import { Body, Controller, Get, Post } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { VehicleServiceRequestDto } from './dto/vehicle-service-request.dto';
import { EnrichedVehicleServiceDto } from './dto/enriched/enriched-vehicle-service.dto';

@Controller('vehicle-service')
export class VehicleServiceController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post('clean')
  async cleanNews(
    @Body() request: Array<VehicleServiceRequestDto>,
  ): Promise<Array<EnrichedVehicleServiceDto> | void> {
    return await this.vehicleService.processNews(request);
  }
}
