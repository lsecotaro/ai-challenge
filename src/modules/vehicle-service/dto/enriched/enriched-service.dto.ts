import { VehicleServiceType } from '../../../commons/model/service-type.enum';
import { IsEnum, IsString } from 'class-validator';

export class EnrichedServiceDto {
  @IsString()
  inferred: string;

  @IsEnum(VehicleServiceType)
  enum: VehicleServiceType;

  @IsString()
  isValidService: boolean;
}
