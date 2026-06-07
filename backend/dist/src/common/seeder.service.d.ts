import { OnApplicationBootstrap } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { Batch } from '../batches/entities/batch.entity';
export declare class SeederService implements OnApplicationBootstrap {
    private readonly tenantRepository;
    private readonly userRepository;
    private readonly supplierRepository;
    private readonly medicineRepository;
    private readonly batchRepository;
    private readonly logger;
    constructor(tenantRepository: Repository<Tenant>, userRepository: Repository<User>, supplierRepository: Repository<Supplier>, medicineRepository: Repository<Medicine>, batchRepository: Repository<Batch>);
    onApplicationBootstrap(): Promise<void>;
}
