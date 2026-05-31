import { IsString, IsOptional, IsEmail, IsDateString } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  full_name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string;
}