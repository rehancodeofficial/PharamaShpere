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
import { MedicinesService } from './medicines.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('medicines')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Post()
  @Roles('super_admin', 'pharmacy_owner', 'pharmacist')
  async create(
    @Body() dto: CreateMedicineDto,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.medicinesService.create(tenantId, dto);
    return { success: true, data, message: 'Medicine created successfully' };
  }

  @Get()
  @Roles('super_admin', 'pharmacy_owner', 'pharmacist', 'cashier')
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const result = await this.medicinesService.findAll(
      tenantId,
      search,
      category,
      Number(page),
      Number(limit),
    );
    return {
      success: true,
      data: result.data,
      message: 'Medicines retrieved successfully',
      meta: { page: result.page, limit: result.limit, total: result.total },
    };
  }

  @Get('low-stock')
  @Roles('super_admin', 'pharmacy_owner', 'pharmacist')
  async findLowStock(@CurrentTenant() tenantId: string) {
    const data = await this.medicinesService.findLowStock(tenantId);
    return { success: true, data, message: 'Low stock medicines retrieved' };
  }

  @Get(':id')
  @Roles('super_admin', 'pharmacy_owner', 'pharmacist', 'cashier')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.medicinesService.findOne(id, tenantId);
    return { success: true, data, message: 'Medicine retrieved successfully' };
  }

  @Put(':id')
  @Roles('super_admin', 'pharmacy_owner', 'pharmacist')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMedicineDto,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.medicinesService.update(id, tenantId, dto);
    return { success: true, data, message: 'Medicine updated successfully' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('super_admin', 'pharmacy_owner')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    await this.medicinesService.remove(id, tenantId);
  }
}
