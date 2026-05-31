import { BatchesService } from './batches.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
export declare class BatchesController {
    private readonly batchesService;
    constructor(batchesService: BatchesService);
    create(dto: CreateBatchDto, tenantId: string): Promise<{
        success: boolean;
        data: import("./entities/batch.entity").Batch;
        message: string;
    }>;
    findAll(tenantId: string): Promise<{
        success: boolean;
        data: import("./entities/batch.entity").Batch[];
        message: string;
    }>;
    findExpiring(tenantId: string, days?: number): Promise<{
        success: boolean;
        data: import("./entities/batch.entity").Batch[];
        message: string;
    }>;
    findByMedicine(medicineId: string, tenantId: string): Promise<{
        success: boolean;
        data: import("./entities/batch.entity").Batch[];
        message: string;
    }>;
    findOne(id: string, tenantId: string): Promise<{
        success: boolean;
        data: import("./entities/batch.entity").Batch;
        message: string;
    }>;
    update(id: string, dto: UpdateBatchDto, tenantId: string): Promise<{
        success: boolean;
        data: import("./entities/batch.entity").Batch;
        message: string;
    }>;
    remove(id: string, tenantId: string): Promise<void>;
}
