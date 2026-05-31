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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('suppliers')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @Roles('super_admin', 'pharmacy_owner')
  async create(
    @Body() dto: CreateSupplierDto,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.suppliersService.create(tenantId, dto);
    return { success: true, data, message: 'Supplier created successfully' };
  }

  @Get()
  @Roles('super_admin', 'pharmacy_owner', 'pharmacist')
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const result = await this.suppliersService.findAll(
      tenantId,
      search,
      Number(page),
      Number(limit),
    );
    return {
      success: true,
      data: result.data,
      message: 'Suppliers retrieved successfully',
      meta: { page: result.page, limit: result.limit, total: result.total },
    };
  }

  @Get(':id')
  @Roles('super_admin', 'pharmacy_owner', 'pharmacist')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.suppliersService.findOne(id, tenantId);
    return { success: true, data, message: 'Supplier retrieved successfully' };
  }

  @Put(':id')
  @Roles('super_admin', 'pharmacy_owner')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupplierDto,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.suppliersService.update(id, tenantId, dto);
    return { success: true, data, message: 'Supplier updated successfully' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('super_admin', 'pharmacy_owner')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    await this.suppliersService.remove(id, tenantId);
  }
}
