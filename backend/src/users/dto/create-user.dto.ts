import { IsString, IsEmail, IsNotEmpty, IsEnum, IsUUID, IsOptional } from 'class-validator';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  PHARMACY_OWNER = 'pharmacy_owner',
  PHARMACIST = 'pharmacist',
  CASHIER = 'cashier',
}

export class CreateUserDto {
  @IsUUID()
  @IsNotEmpty()
  tenant_id: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  cognito_id?: string;

  @IsEnum(UserRole)
  role: UserRole;
}
