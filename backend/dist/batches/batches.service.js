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
exports.BatchesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const batch_entity_1 = require("./entities/batch.entity");
let BatchesService = class BatchesService {
    batchRepository;
    constructor(batchRepository) {
        this.batchRepository = batchRepository;
    }
    async create(tenantId, dto) {
        const batch = this.batchRepository.create({
            ...dto,
            tenant_id: tenantId,
        });
        return this.batchRepository.save(batch);
    }
    async findAllByMedicine(tenantId, medicineId) {
        return this.batchRepository.find({
            where: { tenant_id: tenantId, medicine_id: medicineId },
            order: { expiry_date: 'ASC' },
            withDeleted: false,
        });
    }
    async findAllByTenant(tenantId) {
        return this.batchRepository.find({
            where: { tenant_id: tenantId },
            relations: { medicine: true },
            order: { expiry_date: 'ASC' },
        });
    }
    async findOne(id, tenantId) {
        const batch = await this.batchRepository.findOne({
            where: { id, tenant_id: tenantId },
            relations: { medicine: true, supplier: true },
        });
        if (!batch)
            throw new common_1.NotFoundException(`Batch not found`);
        return batch;
    }
    async update(id, tenantId, dto) {
        const batch = await this.findOne(id, tenantId);
        Object.assign(batch, dto);
        return this.batchRepository.save(batch);
    }
    async remove(id, tenantId) {
        const batch = await this.findOne(id, tenantId);
        await this.batchRepository.softDelete(batch.id);
    }
    async deductStock(id, tenantId, quantity) {
        const batch = await this.findOne(id, tenantId);
        if (batch.quantity < quantity) {
            throw new common_1.BadRequestException(`Insufficient stock in batch ${batch.batch_number}`);
        }
        batch.quantity -= quantity;
        return this.batchRepository.save(batch);
    }
    async findExpiring(tenantId, days = 30) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() + days);
        return this.batchRepository.find({
            where: {
                tenant_id: tenantId,
                expiry_date: (0, typeorm_2.LessThanOrEqual)(cutoff),
                quantity: (0, typeorm_2.MoreThan)(0),
            },
            relations: { medicine: true },
            order: { expiry_date: 'ASC' },
        });
    }
};
exports.BatchesService = BatchesService;
exports.BatchesService = BatchesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(batch_entity_1.Batch)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BatchesService);
//# sourceMappingURL=batches.service.js.map