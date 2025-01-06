import { EnrichedVehicleServiceDto } from '../vehicle-service/dto/enriched/enriched-vehicle-service.dto';

export interface VehicleServiceRepository {
  findByName(name: string): any;

  createAllEntities(dto: EnrichedVehicleServiceDto): Promise<any>;

  createPhone(param: {
    number: string;
    countryCode: string;
    customerId: string;
  }): any;

  createVehicle(param: {
    customerId: any;
    model: string;
    plate: string;
    brand: string;
  }): any;

  createAppointment(param: {
    date: string;
    vehicleId: string;
    type: string;
  }): any;
}
