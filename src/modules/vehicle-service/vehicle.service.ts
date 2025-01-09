import { Inject, Injectable, Logger } from '@nestjs/common';
import { AiActions } from '../interfaces/ai.actions';
import { VehicleServiceRequestDto } from './dto/vehicle-service-request.dto';
import { EnrichedVehicleServiceDto } from './dto/enriched/enriched-vehicle-service.dto';
import { VehicleServiceRepository } from '../interfaces/vehicle-service.repository';
import { ServiceTypeHelper } from '../commons/service-type.helper';
import { EnrichedReminderDto } from './dto/enriched/enriched-reminder.dto';
import { ReminderRepository } from '../interfaces/reminder.repository';
import * as process from 'process';
import { ApiIntegrationService } from '../commons/api-integration.service';
import { QueueService } from './queue.service';
import { VehicleServiceMapper } from './vehicle-service.mapper';

@Injectable()
export class VehicleService {
  private readonly logger: Logger = new Logger(VehicleService.name);
  private readonly batchSize: number;

  constructor(
    @Inject('AiActions') private readonly aIService: AiActions,
    @Inject('VehicleServiceRepository')
    private readonly vehicleServiceRepository: VehicleServiceRepository,
    @Inject('ReminderRepository')
    private readonly reminderRepository: ReminderRepository,
    private readonly queueService: QueueService,
    private readonly apiIntegrationService: ApiIntegrationService,
    private readonly vehicleServiceMapper: VehicleServiceMapper,
  ) {
    this.batchSize = Number(process.env.BATCH_SIZE);
  }

  async processUploadCsv(content: any[], filename: string) {
    this.logger.log('Processing CSV ' + filename);
    const news =
      this.vehicleServiceMapper.mapToVehicleServiceRequestDto(content);

    const totalBatches = Math.ceil(news.length / this.batchSize);

    for (let batchNumber = 0; batchNumber < totalBatches; batchNumber++) {
      const start = batchNumber * this.batchSize;
      const batch = news.slice(start, start + this.batchSize);
      await this.queueService.publish(batch, batchNumber + 1);
    }

    this.logger.log('CSV Processing completed for ' + filename);
  }

  async processNews(
    services: Array<VehicleServiceRequestDto>,
    batchNumber: number,
  ): Promise<Array<EnrichedVehicleServiceDto> | void> {
    this.logger.log(`Processing news #${batchNumber}...`);

    try {
      this.logger.log(`Cleaning news data #${batchNumber}...`);
      const enrichedNews: Array<EnrichedVehicleServiceDto> =
        await this.cleanData(services);

      this.logger.log(`Enriching news data #${batchNumber}...`);
      const enrichedReminders: Array<EnrichedVehicleServiceDto> =
        await this.enrichData(enrichedNews);

      this.logger.log(`Saving news data #${batchNumber}...`);
      if (enrichedReminders && Array.isArray(enrichedReminders)) {
        for (const enrichedNewsItem of enrichedReminders) {
          await this.processSingleNewsItem(enrichedNewsItem);
        }
      } else {
        this.logger.error('Error: Unable to transform news data');
      }
      this.logger.log(`Processing news finished #${batchNumber}`);
    } catch (error) {
      this.logger.error('An error occurred during the news processing.', error);
    }
  }

  private async processSingleNewsItem(
    enrichedNewsItem: EnrichedVehicleServiceDto,
  ) {
    try {
      const customer = await this.saveValidNewsItem(enrichedNewsItem);

      if (customer != null) {
        await this.saveReminder(customer.id, enrichedNewsItem.reminder);
      }
    } catch (error) {
      this.logger.error(
        `Error processing news item: ${JSON.stringify(enrichedNewsItem)}`,
        error,
      );
    }
  }

  private async cleanData(services: Array<VehicleServiceRequestDto>) {
    const response = await this.apiIntegrationService.retryableApiCall(() =>
      this.aIService.cleanData(JSON.stringify(services)),
    );
    const cleanedResponse = response.replace(/^```json\s*|```$/g, '');
    const cleanedNews =
      await this.vehicleServiceMapper.jsonArrayToEnrichedVehicleServiceDto(
        cleanedResponse,
      );
    const validNews = cleanedNews.filter(
      (enrichedNewsItem) => enrichedNewsItem.isValid,
    );
    this.logger.log('Invalid news  ' + (cleanedNews.length - validNews.length));
    return validNews;
  }

  private async enrichData(services: Array<EnrichedVehicleServiceDto>) {
    const response = await this.apiIntegrationService.retryableApiCall(() =>
      this.aIService.enrichData(JSON.stringify(services)),
    );
    const cleanedResponse = response.replace(/^```json\s*|```$/g, '');

    return await this.vehicleServiceMapper.jsonArrayToEnrichedVehicleServiceDto(
      cleanedResponse,
    );
  }

  private async saveValidNewsItem(enrichedNewsItem: EnrichedVehicleServiceDto) {
    try {
      const customer = await this.vehicleServiceRepository.findByName(
        enrichedNewsItem.name,
      );
      if (!customer) {
        return await this.vehicleServiceRepository.createAllEntities(
          enrichedNewsItem,
        );
      } else {
        await this.createPhoneIfNotExist(customer, enrichedNewsItem);
        await this.createVehicleAppointmentIfNotExist(
          customer,
          enrichedNewsItem,
        );
      }
      return customer;
    } catch (error) {
      this.logger.error(error.message);
      return null;
    }
  }

  private async createPhoneIfNotExist(
    customer,
    enrichedNewsItem: EnrichedVehicleServiceDto,
  ) {
    const existingPhone = customer.phones.find((phone) => {
      return (
        phone.countryCode === enrichedNewsItem.phone.countryCode &&
        phone.number === enrichedNewsItem.phone.number
      );
    });

    if (!existingPhone) {
      await this.vehicleServiceRepository.createPhone({
        customerId: customer.id,
        countryCode: enrichedNewsItem.phone.countryCode,
        number: enrichedNewsItem.phone.number,
      });
    }
  }

  private async createVehicleAppointmentIfNotExist(
    customer,
    enrichedNewsItem: EnrichedVehicleServiceDto,
  ) {
    const existingVehicle = customer.vehicles.find((vehicle) => {
      return vehicle.plate === enrichedNewsItem.plate;
    });

    if (!existingVehicle) {
      const newVehicle = await this.vehicleServiceRepository.createVehicle({
        customerId: customer.id,
        brand: enrichedNewsItem.vehicle.brand,
        model: enrichedNewsItem.vehicle.model,
        plate: enrichedNewsItem.plate,
      });
      await this.vehicleServiceRepository.createAppointment({
        vehicleId: newVehicle.id,
        type: enrichedNewsItem.service.enum,
        date: enrichedNewsItem.date,
      });
    } else {
      await this.createAppointmentIfNotExist(existingVehicle, enrichedNewsItem);
    }
  }

  private async createAppointmentIfNotExist(
    existingVehicle,
    enrichedNewsItem: EnrichedVehicleServiceDto,
  ) {
    const existingAppointment = existingVehicle.appointments.find(
      (appointment) => {
        return (
          appointment.type ===
            ServiceTypeHelper.getEnumConstant(enrichedNewsItem.service.enum) &&
          appointment.date.getTime() ===
            new Date(enrichedNewsItem.date).getTime()
        );
      },
    );

    if (!existingAppointment) {
      await this.vehicleServiceRepository.createAppointment({
        vehicleId: existingVehicle.id,
        type: enrichedNewsItem.service.enum,
        date: enrichedNewsItem.date,
      });
    }
  }

  private async saveReminder(id: string, reminder: EnrichedReminderDto) {
    await this.reminderRepository.create(id, reminder);
  }
}
