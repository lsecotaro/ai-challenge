import { Injectable } from '@nestjs/common';

@Injectable()
export class VehicleServiceHistoryService {
  add(): string {
    return 'History added!';
  }
}
