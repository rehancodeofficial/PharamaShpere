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
exports.PrescriptionsController = void 0;
const common_1 = require("@nestjs/common");
const prescriptions_service_1 = require("./prescriptions.service");
const create_prescription_dto_1 = require("./dto/create-prescription.dto");
const prescription_entity_1 = require("./entities/prescription.entity");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const tenant_guard_1 = require("../common/guards/tenant.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../common/decorators/current-tenant.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let PrescriptionsController = class PrescriptionsController {
    prescriptionsService;
    constructor(prescriptionsService) {
        this.prescriptionsService = prescriptionsService;
    }
    async getUploadUrl(tenantId, fileName, contentType) {
        const data = await this.prescriptionsService.generateUploadUrl(tenantId, fileName, contentType);
        return { success: true, data, message: 'Upload URL generated successfully' };
    }
    async create(dto, tenantId, user) {
        const data = await this.prescriptionsService.create(tenantId, user.id, dto);
        return { success: true, data, message: 'Prescription metadata saved successfully' };
    }
    async findAll(tenantId, status, page = 1, limit = 20) {
        const result = await this.prescriptionsService.findAll(tenantId, status, Number(page), Number(limit));
        return {
            success: true,
            data: result.data,
            meta: { page: result.page, limit: result.limit, total: result.total },
        };
    }
    async findOne(id, tenantId) {
        const data = await this.prescriptionsService.findOne(id, tenantId);
        return { success: true, data, message: 'Prescription retrieved successfully' };
    }
    async updateStatus(id, dto, tenantId) {
        const data = await this.prescriptionsService.updateStatus(id, tenantId, dto);
        return { success: true, data, message: 'Prescription status updated successfully' };
    }
};
exports.PrescriptionsController = PrescriptionsController;
__decorate([
    (0, common_1.Post)('upload-url'),
    (0, roles_decorator_1.Roles)('super_admin', 'pharmacy_owner', 'pharmacist', 'cashier'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)('fileName')),
    __param(2, (0, common_1.Body)('contentType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PrescriptionsController.prototype, "getUploadUrl", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('super_admin', 'pharmacy_owner', 'pharmacist', 'cashier'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_prescription_dto_1.CreatePrescriptionDto, String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], PrescriptionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('super_admin', 'pharmacy_owner', 'pharmacist', 'cashier'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], PrescriptionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('super_admin', 'pharmacy_owner', 'pharmacist'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PrescriptionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)('super_admin', 'pharmacy_owner', 'pharmacist'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_prescription_dto_1.UpdatePrescriptionStatusDto, String]),
    __metadata("design:returntype", Promise)
], PrescriptionsController.prototype, "updateStatus", null);
exports.PrescriptionsController = PrescriptionsController = __decorate([
    (0, common_1.Controller)('prescriptions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [prescriptions_service_1.PrescriptionsService])
], PrescriptionsController);
//# sourceMappingURL=prescriptions.controller.js.map