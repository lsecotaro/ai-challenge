import { EnrichedPhoneDto } from './enriched-phone.dto';
import { EnrichedVehicleDto } from './enriched-vehicle-dto';
import { EnrichedServiceDto } from './enriched-service.dto';
import { IsString, IsBoolean, ValidateNested } from 'class-validator';
import { EnrichedReminderDto } from './enriched-reminder.dto';

export class EnrichedVehicleServiceDto {
  @IsString()
  name: string;

  @IsString()
  alias: string;

  @ValidateNested()
  phone: EnrichedPhoneDto;

  @ValidateNested()
  vehicle: EnrichedVehicleDto;

  @IsString()
  plate: string;

  @ValidateNested()
  service: EnrichedServiceDto;

  @IsString()
  date: string;

  @IsBoolean()
  isCompany: boolean;

  @IsBoolean()
  isValid: boolean;

  @ValidateNested()
  reminder: EnrichedReminderDto;
}
