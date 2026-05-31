import { Tenant } from '../../tenants/entities/tenant.entity';
export declare class User {
    id: string;
    tenant_id: string;
    tenant: Tenant;
    cognito_id: string;
    email: string;
    full_name: string;
    phone: string;
    is_active: boolean;
    role: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
