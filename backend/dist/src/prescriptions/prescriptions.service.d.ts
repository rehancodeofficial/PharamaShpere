import { Repository } from 'typeorm';
import { Prescription, PrescriptionStatus } from './entities/prescription.entity';
import { CreatePrescriptionDto, UpdatePrescriptionStatusDto } from './dto/create-prescription.dto';
export declare class PrescriptionsService {
    private readonly prescriptionRepository;
    private s3Client;
    private bucketName;
    constructor(prescriptionRepository: Repository<Prescription>);
    generateUploadUrl(tenantId: string, fileName: string, contentType: string): Promise<{
        uploadUrl: string;
        fileKey: string;
    }>;
    create(tenantId: string, userId: string, dto: CreatePrescriptionDto): Promise<Prescription>;
    findAll(tenantId: string, status?: PrescriptionStatus, page?: number, limit?: number): Promise<{
        data: Prescription[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string, tenantId: string): Promise<Prescription>;
    updateStatus(id: string, tenantId: string, dto: UpdatePrescriptionStatusDto): Promise<Prescription>;
}
