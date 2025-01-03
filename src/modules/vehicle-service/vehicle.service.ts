import {Inject, Injectable, Logger} from '@nestjs/common';
import { AiActions } from '../interfaces/ai.actions';
import { VehicleServiceRequestDto } from './dto/vehicle-service-request.dto';
import { EnrichedVehicleServiceDto } from './dto/enriched/enriched-vehicle-service.dto';
import { plainToInstance } from 'class-transformer';
import {VehicleServiceType} from "../commons/model/service-type.enum";
import {VehicleServiceRepository} from "../interfaces/prisma-vehicle-service-repository.interface";

@Injectable()
export class VehicleService {
  private readonly logger : Logger = new Logger(VehicleService.name);

    constructor(
      @Inject('AiActions') private readonly aIService: AiActions,
      @Inject('VehicleServiceRepository') private readonly vehicleServiceRepository: VehicleServiceRepository) {
  }

  async processNews(
    services: Array<VehicleServiceRequestDto>,
  ): Promise<Array<EnrichedVehicleServiceDto> | void> {
    const response = await this.aIService.cleanData(JSON.stringify(services));
    const cleanedResponse = response.replace(/^```json\s*|```$/g, '');

      const news: Promise<Array<EnrichedVehicleServiceDto> | void> = this.transformDto(cleanedResponse).catch(this.logger.error);

      news.then(async (enrichedNews: Array<EnrichedVehicleServiceDto> | void) => {
          if (enrichedNews && Array.isArray(enrichedNews)) {
              for (const enrichedNewsItem of enrichedNews) {
                  if (enrichedNewsItem.isValid) {
                      const customer = await this.vehicleServiceRepository.findByName(enrichedNewsItem.name);
                      if (!customer) {
                          await this.vehicleServiceRepository.create(enrichedNewsItem);
                          this.logger.log('News entities created successfully');
                      } else {
                          const existingPhone = customer.phones.find((phone) => {
                              return phone.countryCode === enrichedNewsItem.phone.countryCode && phone.number === enrichedNewsItem.phone.number;
                          });

                          if (!existingPhone) {
                              await this.vehicleServiceRepository.createPhone({
                                  customerId: customer.id,
                                  countryCode: enrichedNewsItem.phone.countryCode,
                                  number: enrichedNewsItem.phone.number,
                              });
                          }

                          const existingVehicle = customer.vehicles.find((vehicle) => {
                              return vehicle.plate === enrichedNewsItem.plate;
                          });

                          if (!existingVehicle) {
                              const newVehicle = await this.vehicleServiceRepository.createVehicle({
                                  customerId: customer.id,
                                  brand: enrichedNewsItem.vehicle.brand,
                                  model: enrichedNewsItem.vehicle.model,
                                  plate: enrichedNewsItem.plate,});
                              await this.vehicleServiceRepository.createAppointment({
                                  vehicleId: newVehicle.id,
                                  type: enrichedNewsItem.service.enum,
                                  date: enrichedNewsItem.date,
                              });
                          } else {
                              const existingAppointment = existingVehicle.appointments.find((appointment) => {
                                  return appointment.type === this.getEnumConstant(enrichedNewsItem.service.enum) && appointment.date.getTime() === new Date(enrichedNewsItem.date).getTime();
                              });

                              if (!existingAppointment) {
                                  await this.vehicleServiceRepository.createAppointment({
                                      vehicleId: existingVehicle.id,
                                      type: enrichedNewsItem.service.enum,
                                      date: enrichedNewsItem.date,
                                  })
                              }
                          }

                      }
                  } else {
                      this.logger.log(`Skipping invalid news item: ${enrichedNewsItem.name}`);
                  }
              }

          } else {
              this.logger.error('Error: Unable to transform news data');
          }
      }).catch((error) => {
          this.logger.error('Error processing news data:', error);
      });
  }

  private async transformDto(
    json: string,
  ): Promise<Array<EnrichedVehicleServiceDto> | void> {
      const plainObjects = JSON.parse(json);
      const plainArrays = Array.isArray(plainObjects) ? plainObjects : [plainObjects];
      const dtoInstances : EnrichedVehicleServiceDto[] = plainToInstance(
        EnrichedVehicleServiceDto,
        plainArrays,
      );

      return dtoInstances;
  }
  private getEnumConstant(value: string): VehicleServiceType | undefined {
        return Object.entries(VehicleServiceType).find(
            ([, enumValue]) => enumValue === value,
        )?.[0] as VehicleServiceType | undefined;
  }

}
