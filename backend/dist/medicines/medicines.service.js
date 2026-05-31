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
exports.MedicinesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const medicine_entity_1 = require("./entities/medicine.entity");
let MedicinesService = class MedicinesService {
    medicineRepository;
    constructor(medicineRepository) {
        this.medicineRepository = medicineRepository;
    }
    async create(tenantId, dto) {
        const medicine = this.medicineRepository.create({
            ...dto,
            tenant_id: tenantId,
        });
        return this.medicineRepository.save(medicine);
    }
    async findAll(tenantId, search, category, page = 1, limit = 20) {
        const where = { tenant_id: tenantId };
        if (category)
            where['category'] = category;
        const [data, total] = await this.medicineRepository.findAndCount({
            where: search
                ? [
                    { tenant_id: tenantId, name: (0, typeorm_2.ILike)(`%${search}%`) },
                    { tenant_id: tenantId, generic_name: (0, typeorm_2.ILike)(`%${search}%`) },
                    { tenant_id: tenantId, barcode: (0, typeorm_2.ILike)(`%${search}%`) },
                ]
                : where,
            relations: { batches: true },
            skip: (page - 1) * limit,
            take: limit,
            order: { created_at: 'DESC' },
            withDeleted: false,
        });
        return { data, total, page, limit };
    }
    async findOne(id, tenantId) {
        const medicine = await this.medicineRepository.findOne({
            where: { id, tenant_id: tenantId },
            relations: { batches: true },
        });
        if (!medicine)
            throw new common_1.NotFoundException(`Medicine not found`);
        return medicine;
    }
    async update(id, tenantId, dto) {
        const medicine = await this.findOne(id, tenantId);
        Object.assign(medicine, dto);
        return this.medicineRepository.save(medicine);
    }
    async remove(id, tenantId) {
        const medicine = await this.findOne(id, tenantId);
        await this.medicineRepository.softDelete(medicine.id);
    }
    async findLowStock(tenantId) {
        return this.medicineRepository
            .createQueryBuilder('medicine')
            .leftJoin('medicine.batches', 'batch', 'batch.deleted_at IS NULL')
            .addSelect('COALESCE(SUM(batch.quantity), 0)', 'total_stock')
            .where('medicine.tenant_id = :tenantId', { tenantId })
            .andWhere('medicine.deleted_at IS NULL')
            .groupBy('medicine.id')
            .having('COALESCE(SUM(batch.quantity), 0) <= medicine.reorder_level')
            .getMany();
    }
};
exports.MedicinesService = MedicinesService;
exports.MedicinesService = MedicinesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(medicine_entity_1.Medicine)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MedicinesService);
//# sourceMappingURL=medicines.service.js.map