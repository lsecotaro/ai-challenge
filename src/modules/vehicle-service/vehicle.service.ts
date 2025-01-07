import { Inject, Injectable, Logger } from '@nestjs/common';
import { AiActions } from '../interfaces/ai.actions';
import { VehicleServiceRequestDto } from './dto/vehicle-service-request.dto';
import { EnrichedVehicleServiceDto } from './dto/enriched/enriched-vehicle-service.dto';
import { plainToInstance } from 'class-transformer';
import { VehicleServiceRepository } from '../interfaces/vehicle-service.repository';
import { ServiceTypeHelper } from '../commons/service-type.helper';
import { EnrichedReminderDto } from './dto/enriched/enriched-reminder.dto';
import { ReminderRepository } from '../interfaces/reminder.repository';
import * as process from 'process';

@Injectable()
export class VehicleService {
  private readonly logger: Logger = new Logger(VehicleService.name);
  private readonly batchSize;

  constructor(
    @Inject('AiActions') private readonly aIService: AiActions,
    @Inject('VehicleServiceRepository')
    private readonly vehicleServiceRepository: VehicleServiceRepository,
    @Inject('ReminderRepository')
    private readonly reminderRepository: ReminderRepository,
  ) {
    this.batchSize = process.env.BATCH_SIZE;
  }

  async processUploadCsv(content: any[], filename: string ) {
    this.logger.log('Processing CSV {}...', filename);
    const news = this.mapToVehicleServiceRequestDto(content);

    let batchNumber = 1;
    for (let i = 0; i < news.length; i += this.batchSize) {
      this.logger.log('Processing batch ' + batchNumber);
      const batch = news.slice(i, i + this.batchSize);
      await this.processNews(batch);
      batchNumber++;
    }

    this.logger.log('CSV Processing completed for {}.', filename);
  }

  async processNews(
    services: Array<VehicleServiceRequestDto>,
  ): Promise<Array<EnrichedVehicleServiceDto> | void> {
    this.logger.log('Processing news...');

    this.logger.log('Cleaning news data...');
    const enrichedNews: Array<EnrichedVehicleServiceDto> =
      await this.cleanData(services);

    this.logger.log('Enriching news data...');
    const enrichedReminders: Array<EnrichedVehicleServiceDto> =
      await this.enrichData(enrichedNews);

    this.logger.log('Saving news data...');
    if (enrichedReminders && Array.isArray(enrichedReminders)) {
      for (const enrichedNewsItem of enrichedReminders) {
        if (enrichedNewsItem.isValid) {
          const customer = await this.saveValidNewsItem(enrichedNewsItem);
          if (customer != null) {
            await this.saveReminder(customer.id, enrichedNewsItem.reminder);
          }
        } else {
          this.logger.log('Invalid news: ' + JSON.stringify(enrichedNewsItem));
        }
      }
    } else {
      this.logger.error('Error: Unable to transform news data');
    }

    this.logger.log('Processing news finished');
  }

  private async cleanData(services: Array<VehicleServiceRequestDto>) {
    const response = await this.aIService.cleanData(JSON.stringify(services));
    const cleanedResponse = response.replace(/^```json\s*|```$/g, '');

    return this.jsonArrayToEnrichedVehicleServiceDto(cleanedResponse);
  }

  private async enrichData(services: Array<EnrichedVehicleServiceDto>) {
    const response = await this.aIService.enrichData(JSON.stringify(services));
    const cleanedResponse = response.replace(/^```json\s*|```$/g, '');

    return await this.jsonArrayToEnrichedVehicleServiceDto(cleanedResponse);
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

  private async jsonArrayToEnrichedVehicleServiceDto(
    json: string,
  ): Promise<Array<EnrichedVehicleServiceDto>> {
    const plainObjects = JSON.parse(json);
    const plainArrays = Array.isArray(plainObjects)
      ? plainObjects
      : [plainObjects];
    return plainToInstance(EnrichedVehicleServiceDto, plainArrays);
  }

  mapToVehicleServiceRequestDto(input: any[]): VehicleServiceRequestDto[] {
    this.logger.log('Mapping to VehicleServiceRequestDto');

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
