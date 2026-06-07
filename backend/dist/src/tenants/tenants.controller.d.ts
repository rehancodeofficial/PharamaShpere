import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    create(createTenantDto: CreateTenantDto): Promise<import("./entities/tenant.entity").Tenant>;
    findAll(): Promise<import("./entities/tenant.entity").Tenant[]>;
    findOne(id: string): Promise<import("./entities/tenant.entity").Tenant>;
    updateSubscription(id: string, body: {
        subscription_plan: string;
    }): Promise<import("./entities/tenant.entity").Tenant>;
    updateStatus(id: string, body: {
        is_active: boolean;
    }): Promise<import("./entities/tenant.entity").Tenant>;
}
