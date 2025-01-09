import { Injectable } from '@nestjs/common';
import { EnrichedVehicleServiceDto } from './dto/enriched/enriched-vehicle-service.dto';
import { plainToInstance } from 'class-transformer';
import { VehicleServiceRequestDto } from './dto/vehicle-service-request.dto';

@Injectable()
export class VehicleServiceMapper {
  async jsonArrayToEnrichedVehicleServiceDto(
    json: string,
  ): Promise<Array<EnrichedVehicleServiceDto>> {
    const plainObjects = JSON.parse(json);
    const plainArrays = Array.isArray(plainObjects)
      ? plainObjects
      : [plainObjects];
    return plainToInstance(EnrichedVehicleServiceDto, plainArrays);
  }

  mapToVehicleServiceRequestDto(input: any[]): VehicleServiceRequestDto[] {
    return input.map((item) => ({
      name: item.Nombre,
      phone: item.Telefono,
      vehicle: item.Vehiculo,
      plate: item.Patente,
      service: item['Servicio '].trim(),
      date: item.Fecha,
    }));
  }
}
