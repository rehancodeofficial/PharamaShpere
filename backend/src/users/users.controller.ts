import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('invite')
  @Roles('super_admin', 'pharmacy_owner')
  async invite(@Body() createUserDto: CreateUserDto, @CurrentTenant() tenantId: string) {
    createUserDto.tenant_id = tenantId;
    return this.usersService.invite(tenantId, createUserDto);
  }

  @Post(':id/role')
  @Roles('super_admin', 'pharmacy_owner')
  async updateRole(
    @Param('id') id: string,
    @Body() body: { role: string },
    @CurrentTenant() tenantId: string,
  ) {
    return this.usersService.updateRole(id, tenantId, body.role);
  }

  @Post(':id/status')
  @Roles('super_admin', 'pharmacy_owner')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { is_active: boolean },
    @CurrentTenant() tenantId: string,
  ) {
    return this.usersService.updateStatus(id, tenantId, body.is_active);
  }

  @Get()
  @Roles('super_admin', 'pharmacy_owner')
  async findAll(@CurrentTenant() tenantId: string) {
    return this.usersService.findAllByTenant(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.usersService.findOneByTenant(id, tenantId);
  }
}
