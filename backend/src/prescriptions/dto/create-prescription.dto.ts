import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { PrescriptionStatus } from '../entities/prescription.entity';

export class CreatePrescriptionDto {
  @IsString()
  @IsNotEmpty()
  customer_name: string;

  @IsString()
  @IsOptional()
  customer_phone?: string;

  @IsString()
  @IsOptional()
  doctor_name?: string;

  @IsString()
  @IsNotEmpty()
  file_url: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdatePrescriptionStatusDto {
  @IsEnum(PrescriptionStatus)
  status: PrescriptionStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
