import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BatchesService } from './batches.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('batches')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Post()
  @Roles('super_admin', 'pharmacy_owner', 'pharmacist')
  async create(
    @Body() dto: CreateBatchDto,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.batchesService.create(tenantId, dto);
    return { success: true, data, message: 'Batch created successfully' };
  }

  @Get()
  @Roles('super_admin', 'pharmacy_owner', 'pharmacist', 'cashier')
  async findAll(@CurrentTenant() tenantId: string) {
    const data = await this.batchesService.findAllByTenant(tenantId);
    return { success: true, data, message: 'Batches retrieved successfully' };
  }

  @Get('expiring')
  @Roles('super_admin', 'pharmacy_owner', 'pharmacist')
  async findExpiring(
    @CurrentTenant() tenantId: string,
    @Query('days') days = 30,
  ) {
    const data = await this.batchesService.findExpiring(tenantId, Number(days));
    return {
      success: true,
      data,
      message: `Batches expiring within ${days} days retrieved`,
    };
  }

  @Get('medicine/:medicineId')
  @Roles('super_admin', 'pharmacy_owner', 'pharmacist', 'cashier')
  async findByMedicine(
    @Param('medicineId', ParseUUIDPipe) medicineId: string,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.batchesService.findAllByMedicine(
      tenantId,
      medicineId,
    );
    return { success: true, data, message: 'Batches for medicine retrieved' };
  }

  @Get(':id')
  @Roles('super_admin', 'pharmacy_owner', 'pharmacist', 'cashier')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.batchesService.findOne(id, tenantId);
    return { success: true, data, message: 'Batch retrieved successfully' };
  }

  @Put(':id')
  @Roles('super_admin', 'pharmacy_owner', 'pharmacist')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBatchDto,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.batchesService.update(id, tenantId, dto);
    return { success: true, data, message: 'Batch updated successfully' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('super_admin', 'pharmacy_owner')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    await this.batchesService.remove(id, tenantId);
  }
}
