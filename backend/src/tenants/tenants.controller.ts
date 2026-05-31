import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  async create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async findAll() {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Post(':id/subscription')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async updateSubscription(
    @Param('id') id: string,
    @Body() body: { subscription_plan: string }
  ) {
    return this.tenantsService.updateSubscription(id, body.subscription_plan);
  }

  @Post(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { is_active: boolean }
  ) {
    return this.tenantsService.updateStatus(id, body.is_active);
  }
}
