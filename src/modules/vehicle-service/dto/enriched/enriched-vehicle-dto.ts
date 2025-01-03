import { IsString, IsBoolean } from 'class-validator';
export class EnrichedVehicleDto {
  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsString()
  plate: string;

  @IsBoolean()
  isValidVehicle: boolean;
}
