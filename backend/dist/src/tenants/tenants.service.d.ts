import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
export declare class TenantsService {
    private readonly tenantRepository;
    constructor(tenantRepository: Repository<Tenant>);
    create(createTenantDto: CreateTenantDto): Promise<Tenant>;
    findAll(): Promise<Tenant[]>;
    findOne(id: string): Promise<Tenant>;
    findBySubdomain(subdomain: string): Promise<Tenant | null>;
    updateSubscription(id: string, plan: string): Promise<Tenant>;
    updateStatus(id: string, isActive: boolean): Promise<Tenant>;
}
