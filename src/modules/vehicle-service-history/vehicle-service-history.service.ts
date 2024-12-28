import {Inject, Injectable} from '@nestjs/common';
import {IAActions} from "../interfaces/IaActions";

@Injectable()
export class VehicleServiceHistoryService {
  constructor(@Inject('IaActions') private readonly aIService: IAActions) {
  }

  add(): Promise<string> {
    return this.aIService.test("Name: John,, Age: 29, Email: john.doe@example.com");
  }
}
