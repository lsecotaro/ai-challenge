import {PrismaService} from "./prisma.service";
import {EnrichedVehicleServiceDto} from "../../vehicle-service/dto/enriched/enriched-vehicle-service.dto";
import {VehicleServiceType} from "../../commons/model/service-type.enum";
import {Injectable} from "@nestjs/common";
import {VehicleServiceRepository} from "../../interfaces/prisma-vehicle-service-repository.interface";

@Injectable()
export class PrismaVehicleServiceRepository implements VehicleServiceRepository {
    constructor(private readonly prismaService: PrismaService ) {}

    findByName(name: string) {
        return this.prismaService.customer.findUnique({
            where: {
                name,
            },
            include: {
                vehicles: {
                    include: {
                        appointments: true,
                    },
                },
                phones: true,
            },
        });
    }

    async create(dto: EnrichedVehicleServiceDto) {
        const {name, alias, phone, vehicle, plate, service, date, isCompany, isValid} = dto;
        const serviceEnum = this.getEnumConstant(service.enum);

        const customer = await this.prismaService.customer.create({
            data: {
                name,
                alias,
                isCompany: isCompany,
                phones: {
                    create: {
                        countryCode: phone.countryCode,
                        number: phone.number,
                    },
                },
                vehicles: {
                    create: {
                        brand: vehicle.brand,
                        model: vehicle.model,
                        plate,
                        appointments: {
                            create: {
                                type: serviceEnum,
                                date: new Date(date),
                            },
                        }
                    }
                }
            }
        });

        return customer;
    }

    createPhone(param: { number: string; countryCode: string; customerId: string }) {
        const {number, countryCode, customerId} = param;
        return this.prismaService.phone.create({
            data: {
                countryCode,
                number,
                customer: {
                    connect: {
                        id: customerId,
                    },
                },
            },
        });
    }

    createVehicle(param: { customerId: any; model: string; plate: string; brand: string }) {
        const {customerId, model, plate, brand} = param;
        return this.prismaService.vehicle.create({
            data: {
                brand,
                model,
                plate,
                customer: {
                    connect: {
                        id: customerId,
                    },
                },
            },
        });
    }

    createAppointment(param: { date: string; vehicleId: any; type: string }) {
        const {date, vehicleId, type} = param;
        return this.prismaService.appointment.create({
            data: {
                type: this.getEnumConstant(type),
                date: new Date(date),
                vehicle: {
                    connect: {
                        id: vehicleId,
                    },
                },
            },
        });
    }

    private getEnumConstant(value: string): VehicleServiceType | undefined {
        return Object.entries(VehicleServiceType).find(
            ([, enumValue]) => enumValue === value,
        )?.[0] as VehicleServiceType | undefined;
    }
}