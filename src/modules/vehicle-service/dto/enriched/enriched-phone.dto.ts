import { IsString } from 'class-validator';

export class EnrichedPhoneDto {
  @IsString()
  number: string;

  @IsString()
  countryCode: string;
}
