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
exports.PrescriptionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
const prescription_entity_1 = require("./entities/prescription.entity");
let PrescriptionsService = class PrescriptionsService {
    prescriptionRepository;
    s3Client;
    bucketName;
    constructor(prescriptionRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.s3Client = new client_s3_1.S3Client({
            region: process.env.AWS_REGION || 'us-east-1',
        });
        this.bucketName = process.env.S3_PRESCRIPTION_BUCKET || 'pharmasphere-prescriptions';
    }
    async generateUploadUrl(tenantId, fileName, contentType) {
        const fileExtension = fileName.split('.').pop();
        const fileKey = `tenants/${tenantId}/prescriptions/${(0, uuid_1.v4)()}.${fileExtension}`;
        try {
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
                ContentType: contentType,
            });
            const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn: 900 });
            return { uploadUrl, fileKey };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Failed to generate upload URL: ${error.message}`);
        }
    }
    async create(tenantId, userId, dto) {
        const prescription = this.prescriptionRepository.create({
            ...dto,
            tenant_id: tenantId,
            created_by_id: userId,
        });
        return this.prescriptionRepository.save(prescription);
    }
    async findAll(tenantId, status, page = 1, limit = 20) {
        const where = { tenant_id: tenantId };
        if (status)
            where['status'] = status;
        const [data, total] = await this.prescriptionRepository.findAndCount({
            where,
            relations: { created_by: true },
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total, page, limit };
    }
    async findOne(id, tenantId) {
        const prescription = await this.prescriptionRepository.findOne({
            where: { id, tenant_id: tenantId },
            relations: { created_by: true },
        });
        if (!prescription)
            throw new common_1.NotFoundException('Prescription not found');
        return prescription;
    }
    async updateStatus(id, tenantId, dto) {
        const prescription = await this.findOne(id, tenantId);
        prescription.status = dto.status;
        if (dto.notes) {
            prescription.notes = dto.notes;
        }
        return this.prescriptionRepository.save(prescription);
    }
};
exports.PrescriptionsService = PrescriptionsService;
exports.PrescriptionsService = PrescriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(prescription_entity_1.Prescription)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PrescriptionsService);
//# sourceMappingURL=prescriptions.service.js.map