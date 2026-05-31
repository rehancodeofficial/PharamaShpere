import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto, UpdatePrescriptionStatusDto } from './dto/create-prescription.dto';
import { PrescriptionStatus } from './entities/prescription.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post('upload-url')
  @Roles('super_admin', 'pharmacy_owner', 'pharmacist', 'cashier')
  async getUploadUrl(
    @CurrentTenant() tenantId: string,
    @Body('fileName') fileName: string,
    @Body('contentType') contentType: string,
  ) {
    const data = await this.prescriptionsService.generateUploadUrl(tenantId, fileName, contentType);
    return { success: true, data, message: 'Upload URL generated successfully' };
  }

  @Post()
  @Roles('super_admin', 'pharmacy_owner', 'pharmacist', 'cashier')
  async create(
    @Body() dto: CreatePrescriptionDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.prescriptionsService.create(tenantId, user.id, dto);
    return { success: true, data, message: 'Prescription metadata saved successfully' };
  }

  @Get()
  @Roles('super_admin', 'pharmacy_owner', 'pharmacist', 'cashier')
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: PrescriptionStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const result = await this.prescriptionsService.findAll(
      tenantId,
      status,
      Number(page),
      Number(limit),
    );
    return {
      success: true,
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total },
    };
  }

  @Get(':id')
  @Roles('super_admin', 'pharmacy_owner', 'pharmacist')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.prescriptionsService.findOne(id, tenantId);
    return { success: true, data, message: 'Prescription retrieved successfully' };
  }

  @Patch(':id/status')
  @Roles('super_admin', 'pharmacy_owner', 'pharmacist')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePrescriptionStatusDto,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.prescriptionsService.updateStatus(id, tenantId, dto);
    return { success: true, data, message: 'Prescription status updated successfully' };
  }
}
