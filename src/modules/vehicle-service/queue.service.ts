import { Inject, Injectable, Logger } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { ClientProxy } from '@nestjs/microservices';
import { VehicleServiceRequestDto } from './dto/vehicle-service-request.dto';
import { BatchServiceMessageDto } from './dto/batch-sevice-message.dto';

@Injectable()
export class QueueService {
  private readonly logger: Logger = new Logger(VehicleService.name);
  constructor(
    @Inject('QUEUE_SERVICE_CLIENT') private readonly queueClient: ClientProxy,
  ) {}

  async publish(batch: VehicleServiceRequestDto[], batchNumber: number) {
    this.logger.log(
      `Publishing batch ${batchNumber + 1} with ${batch.length} items`,
    );
    try {
      const message = new BatchServiceMessageDto();
      message.batchNumber = batchNumber;
      message.services = batch;

      await this.queueClient.emit('vehicle-service', message);
    } catch (error) {
      this.logger.error(`Error processing batch ${batchNumber + 1}:`, error);
    }
  }
}
