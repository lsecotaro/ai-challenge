import {VehicleServiceType} from "./model/service-type.enum";

export class ServiceTypeHelper {
    static getEnumConstant(value: string): VehicleServiceType | undefined {
        return Object.entries(VehicleServiceType).find(
            ([, enumValue]) => enumValue === value,
        )?.[0] as VehicleServiceType | undefined;
    }
}
