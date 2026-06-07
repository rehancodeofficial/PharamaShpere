"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchesController = void 0;
const common_1 = require("@nestjs/common");
const batches_service_1 = require("./batches.service");
const create_batch_dto_1 = require("./dto/create-batch.dto");
const update_batch_dto_1 = require("./dto/update-batch.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const tenant_guard_1 = require("../common/guards/tenant.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../common/decorators/current-tenant.decorator");
let BatchesController = class BatchesController {
    batchesService;
    constructor(batchesService) {
        this.batchesService = batchesService;
    }
    async create(dto, tenantId) {
        const data = await this.batchesService.create(tenantId, dto);
        return { success: true, data, message: 'Batch created successfully' };
    }
    async findAll(tenantId) {
        const data = await this.batchesService.findAllByTenant(tenantId);
        return { success: true, data, message: 'Batches retrieved successfully' };
    }
    async findExpiring(tenantId, days = 30) {
        const data = await this.batchesService.findExpiring(tenantId, Number(days));
        return {
            success: true,
            data,
            message: `Batches expiring within ${days} days retrieved`,
        };
    }
    async findByMedicine(medicineId, tenantId) {
        const data = await this.batchesService.findAllByMedicine(tenantId, medicineId);
        return { success: true, data, message: 'Batches for medicine retrieved' };
    }
    async findOne(id, tenantId) {
        const data = await this.batchesService.findOne(id, tenantId);
        return { success: true, data, message: 'Batch retrieved successfully' };
    }
    async update(id, dto, tenantId) {
        const data = await this.batchesService.update(id, tenantId, dto);
        return { success: true, data, message: 'Batch updated successfully' };
    }
    async remove(id, tenantId) {
        await this.batchesService.remove(id, tenantId);
    }
};
exports.BatchesController = BatchesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('super_admin', 'pharmacy_owner', 'pharmacist'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_batch_dto_1.CreateBatchDto, String]),
    __metadata("design:returntype", Promise)
], BatchesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('super_admin', 'pharmacy_owner', 'pharmacist', 'cashier'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BatchesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('expiring'),
    (0, roles_decorator_1.Roles)('super_admin', 'pharmacy_owner', 'pharmacist'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BatchesController.prototype, "findExpiring", null);
__decorate([
    (0, common_1.Get)('medicine/:medicineId'),
    (0, roles_decorator_1.Roles)('super_admin', 'pharmacy_owner', 'pharmacist', 'cashier'),
    __param(0, (0, common_1.Param)('medicineId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BatchesController.prototype, "findByMedicine", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('super_admin', 'pharmacy_owner', 'pharmacist', 'cashier'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BatchesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('super_admin', 'pharmacy_owner', 'pharmacist'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_batch_dto_1.UpdateBatchDto, String]),
    __metadata("design:returntype", Promise)
], BatchesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, roles_decorator_1.Roles)('super_admin', 'pharmacy_owner'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BatchesController.prototype, "remove", null);
exports.BatchesController = BatchesController = __decorate([
    (0, common_1.Controller)('batches'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [batches_service_1.BatchesService])
], BatchesController);
//# sourceMappingURL=batches.controller.js.map