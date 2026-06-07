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
exports.MedicinesController = void 0;
const common_1 = require("@nestjs/common");
const medicines_service_1 = require("./medicines.service");
const create_medicine_dto_1 = require("./dto/create-medicine.dto");
const update_medicine_dto_1 = require("./dto/update-medicine.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const tenant_guard_1 = require("../common/guards/tenant.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../common/decorators/current-tenant.decorator");
let MedicinesController = class MedicinesController {
    medicinesService;
    constructor(medicinesService) {
        this.medicinesService = medicinesService;
    }
    async create(dto, tenantId) {
        const data = await this.medicinesService.create(tenantId, dto);
        return { success: true, data, message: 'Medicine created successfully' };
    }
    async findAll(tenantId, search, category, page = 1, limit = 20) {
        const result = await this.medicinesService.findAll(tenantId, search, category, Number(page), Number(limit));
        return {
            success: true,
            data: result.data,
            message: 'Medicines retrieved successfully',
            meta: { page: result.page, limit: result.limit, total: result.total },
        };
    }
    async findLowStock(tenantId) {
        const data = await this.medicinesService.findLowStock(tenantId);
        return { success: true, data, message: 'Low stock medicines retrieved' };
    }
    async findOne(id, tenantId) {
        const data = await this.medicinesService.findOne(id, tenantId);
        return { success: true, data, message: 'Medicine retrieved successfully' };
    }
    async update(id, dto, tenantId) {
        const data = await this.medicinesService.update(id, tenantId, dto);
        return { success: true, data, message: 'Medicine updated successfully' };
    }
    async remove(id, tenantId) {
        await this.medicinesService.remove(id, tenantId);
    }
};
exports.MedicinesController = MedicinesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('super_admin', 'pharmacy_owner', 'pharmacist'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_medicine_dto_1.CreateMedicineDto, String]),
    __metadata("design:returntype", Promise)
], MedicinesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('super_admin', 'pharmacy_owner', 'pharmacist', 'cashier'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('category')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], MedicinesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('low-stock'),
    (0, roles_decorator_1.Roles)('super_admin', 'pharmacy_owner', 'pharmacist'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MedicinesController.prototype, "findLowStock", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('super_admin', 'pharmacy_owner', 'pharmacist', 'cashier'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MedicinesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('super_admin', 'pharmacy_owner', 'pharmacist'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_medicine_dto_1.UpdateMedicineDto, String]),
    __metadata("design:returntype", Promise)
], MedicinesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, roles_decorator_1.Roles)('super_admin', 'pharmacy_owner'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MedicinesController.prototype, "remove", null);
exports.MedicinesController = MedicinesController = __decorate([
    (0, common_1.Controller)('medicines'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [medicines_service_1.MedicinesService])
], MedicinesController);
//# sourceMappingURL=medicines.controller.js.map