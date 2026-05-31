import { Tenant } from '../../tenants/entities/tenant.entity';
export declare class Supplier {
    id: string;
    tenant_id: string;
    tenant: Tenant;
    name: string;
    contact_person: string;
    phone: string;
    email: string;
    address: string;
    notes: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
