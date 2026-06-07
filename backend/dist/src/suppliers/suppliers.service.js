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
exports.SuppliersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const supplier_entity_1 = require("./entities/supplier.entity");
let SuppliersService = class SuppliersService {
    supplierRepository;
    constructor(supplierRepository) {
        this.supplierRepository = supplierRepository;
    }
    async create(tenantId, dto) {
        const supplier = this.supplierRepository.create({
            ...dto,
            tenant_id: tenantId,
        });
        return this.supplierRepository.save(supplier);
    }
    async findAll(tenantId, search, page = 1, limit = 20) {
        const [data, total] = await this.supplierRepository.findAndCount({
            where: search
                ? [
                    { tenant_id: tenantId, name: (0, typeorm_2.ILike)(`%${search}%`) },
                    { tenant_id: tenantId, contact_person: (0, typeorm_2.ILike)(`%${search}%`) },
                ]
                : { tenant_id: tenantId },
            skip: (page - 1) * limit,
            take: limit,
            order: { name: 'ASC' },
        });
        return { data, total, page, limit };
    }
    async findOne(id, tenantId) {
        const supplier = await this.supplierRepository.findOne({
            where: { id, tenant_id: tenantId },
        });
        if (!supplier)
            throw new common_1.NotFoundException(`Supplier not found`);
        return supplier;
    }
    async update(id, tenantId, dto) {
        const supplier = await this.findOne(id, tenantId);
        Object.assign(supplier, dto);
        return this.supplierRepository.save(supplier);
    }
    async remove(id, tenantId) {
        const supplier = await this.findOne(id, tenantId);
        await this.supplierRepository.softDelete(supplier.id);
    }
};
exports.SuppliersService = SuppliersService;
exports.SuppliersService = SuppliersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(supplier_entity_1.Supplier)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SuppliersService);
//# sourceMappingURL=suppliers.service.js.map