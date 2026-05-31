import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('sales')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Roles('super_admin', 'pharmacy_owner', 'pharmacist', 'cashier')
  async create(
    @Body() dto: CreateSaleDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.salesService.createSale(tenantId, user.id, dto);
    return { success: true, data, message: 'Sale processed successfully' };
  }

  @Get()
  @Roles('super_admin', 'pharmacy_owner', 'pharmacist', 'cashier')
  async getHistory(
    @CurrentTenant() tenantId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const result = await this.salesService.getSalesHistory(
      tenantId,
      Number(page),
      Number(limit),
    );
    return {
      success: true,
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total },
    };
  }

  @Get('daily')
  @Roles('super_admin', 'pharmacy_owner', 'pharmacist')
  async getDailySummary(
    @CurrentTenant() tenantId: string,
    @Query('date') date?: string,
  ) {
    // Default to today if no date provided
    const targetDate = date || new Date().toISOString().split('T')[0];
    const data = await this.salesService.getDailySalesSummary(
      tenantId,
      targetDate,
    );
    return { success: true, data, message: 'Daily sales retrieved' };
  }
}
