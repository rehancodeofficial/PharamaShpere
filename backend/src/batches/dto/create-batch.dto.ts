import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUUID,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateBatchDto {
  @IsUUID()
  @IsOptional()
  tenant_id?: string;

  @IsUUID()
  @IsNotEmpty()
  medicine_id: string;

  @IsUUID()
  @IsOptional()
  supplier_id?: string;

  @IsString()
  @IsNotEmpty()
  batch_number: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  cost_price: number;

  @IsNumber()
  @Min(0)
  sell_price: number;

  @IsDateString()
  expiry_date: string;

  @IsDateString()
  @IsOptional()
  manufacture_date?: string;
}
