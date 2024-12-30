import { Inject, Injectable } from '@nestjs/common';
import { IAActions } from '../interfaces/IaActions';
import { VehicleServiceRequestDto } from './dto/vehicle-service-request.dto';
import { EnrichedVehicleServiceDto } from './dto/enriched/enriched-vehicle-service.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class VehicleService {
  constructor(@Inject('IaActions') private readonly aIService: IAActions) {}

  async processNews(
    services: Array<VehicleServiceRequestDto>,
  ): Promise<Array<EnrichedVehicleServiceDto> | void> {
    const response = await this.aIService.cleanData(JSON.stringify(services));
    const cleanedResponse = response.replace(/^```json\s*|```$/g, '');

    return this.transformDto(cleanedResponse).catch(console.error);
  }

  private async transformDto(
    json: string,
  ): Promise<Array<EnrichedVehicleServiceDto> | void> {
      const plainObjects = JSON.parse(json);
      const plainArrays = Array.isArray(plainObjects) ? plainObjects : [plainObjects];

      const dtoInstances : EnrichedVehicleServiceDto[] = plainToInstance(
        EnrichedVehicleServiceDto,
        plainArrays,
      );

      return dtoInstances;
  }
}
