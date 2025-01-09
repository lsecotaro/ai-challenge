import { VehicleServiceRequestDto } from './vehicle-service-request.dto';

export class BatchServiceMessageDto {
  batchNumber: number;
  services: Array<VehicleServiceRequestDto>;
}
