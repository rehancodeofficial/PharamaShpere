import { Repository } from 'typeorm';
import { Batch } from './entities/batch.entity';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
export declare class BatchesService {
    private readonly batchRepository;
    constructor(batchRepository: Repository<Batch>);
    create(tenantId: string, dto: CreateBatchDto): Promise<Batch>;
    findAllByMedicine(tenantId: string, medicineId: string): Promise<Batch[]>;
    findAllByTenant(tenantId: string): Promise<Batch[]>;
    findOne(id: string, tenantId: string): Promise<Batch>;
    update(id: string, tenantId: string, dto: UpdateBatchDto): Promise<Batch>;
    remove(id: string, tenantId: string): Promise<void>;
    deductStock(id: string, tenantId: string, quantity: number): Promise<Batch>;
    findExpiring(tenantId: string, days?: number): Promise<Batch[]>;
}
