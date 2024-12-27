import {Controller, Get, Post} from '@nestjs/common';
import { VehicleServiceHistoryService } from './vehicle-service-history.service';

@Controller("vehicle-service-history")
export class VehicleServiceHistoryController {
  constructor(private readonly vehicleServiceHistoryService: VehicleServiceHistoryService) {}

  @Post("history")
  getPing(): string {
    return this.vehicleServiceHistoryService.add();
  }
}
