import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto, UpdatePrescriptionStatusDto } from './dto/create-prescription.dto';
import { PrescriptionStatus } from './entities/prescription.entity';
import { User } from '../users/entities/user.entity';
export declare class PrescriptionsController {
    private readonly prescriptionsService;
    constructor(prescriptionsService: PrescriptionsService);
    getUploadUrl(tenantId: string, fileName: string, contentType: string): Promise<{
        success: boolean;
        data: {
            uploadUrl: string;
            fileKey: string;
        };
        message: string;
    }>;
    create(dto: CreatePrescriptionDto, tenantId: string, user: User): Promise<{
        success: boolean;
        data: import("./entities/prescription.entity").Prescription;
        message: string;
    }>;
    findAll(tenantId: string, status?: PrescriptionStatus, page?: number, limit?: number): Promise<{
        success: boolean;
        data: import("./entities/prescription.entity").Prescription[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    findOne(id: string, tenantId: string): Promise<{
        success: boolean;
        data: import("./entities/prescription.entity").Prescription;
        message: string;
    }>;
    updateStatus(id: string, dto: UpdatePrescriptionStatusDto, tenantId: string): Promise<{
        success: boolean;
        data: import("./entities/prescription.entity").Prescription;
        message: string;
    }>;
}
