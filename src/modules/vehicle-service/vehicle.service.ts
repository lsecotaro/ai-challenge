import { Inject, Injectable, Logger } from '@nestjs/common';
import { AiActions } from '../interfaces/ai.actions';
import { VehicleServiceRequestDto } from './dto/vehicle-service-request.dto';
import { EnrichedVehicleServiceDto } from './dto/enriched/enriched-vehicle-service.dto';
import { plainToInstance } from 'class-transformer';
import { VehicleServiceRepository } from '../interfaces/prisma-vehicle-service-repository.interface';
import { ServiceTypeHelper } from '../commons/service-type.helper';

@Injectable()
export class VehicleService {
  private readonly logger: Logger = new Logger(VehicleService.name);

  constructor(
    @Inject('AiActions') private readonly aIService: AiActions,
    @Inject('VehicleServiceRepository')
    private readonly vehicleServiceRepository: VehicleServiceRepository,
  ) {}

  async processNews(
    services: Array<VehicleServiceRequestDto>,
  ): Promise<Array<EnrichedVehicleServiceDto> | void> {
    this.logger.log('Processing news...');
    const enrichedNews: Array<EnrichedVehicleServiceDto> = await this.cleanData(services);

    if (enrichedNews && Array.isArray(enrichedNews)) {
      for (const enrichedNewsItem of enrichedNews) {
        this.logger.log(enrichedNewsItem);
        if (enrichedNewsItem.isValid) {
          await this.saveValidNewsItem(enrichedNewsItem);
        } else {
          this.logger.log(enrichedNewsItem);
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

    return this.jsonArrayToDto(cleanedResponse)
  }

  private async saveValidNewsItem(enrichedNewsItem: EnrichedVehicleServiceDto) {
    const customer = await this.vehicleServiceRepository.findByName(
        enrichedNewsItem.name,
    );
    if (!customer) {
      await this.vehicleServiceRepository.createAllEntities(enrichedNewsItem);
    } else {
      await this.createPhoneIfNotExist(customer, enrichedNewsItem);
      await this.createVehicleAppointmentIfNotExist(customer, enrichedNewsItem);
    }
  }

  private async createPhoneIfNotExist(customer, enrichedNewsItem: EnrichedVehicleServiceDto) {
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

  private async createVehicleAppointmentIfNotExist(customer, enrichedNewsItem: EnrichedVehicleServiceDto) {
    const existingVehicle = customer.vehicles.find((vehicle) => {
      return vehicle.plate === enrichedNewsItem.plate;
    });

    if (!existingVehicle) {
      const newVehicle =
          await this.vehicleServiceRepository.createVehicle({
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

  private async createAppointmentIfNotExist(existingVehicle, enrichedNewsItem: EnrichedVehicleServiceDto) {
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

  private async jsonArrayToDto(
    json: string,
  ): Promise<Array<EnrichedVehicleServiceDto>> {
    const plainObjects = JSON.parse(json);
    const plainArrays = Array.isArray(plainObjects)
      ? plainObjects
      : [plainObjects];
    return plainToInstance(
      EnrichedVehicleServiceDto,
      plainArrays,
    );
  }
}
