import { IsString, IsBoolean } from 'class-validator';
export class EnrichedVehicleDto {
  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsBoolean()
  isValidVehicle: boolean;
}
