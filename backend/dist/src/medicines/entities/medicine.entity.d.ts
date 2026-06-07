import { Tenant } from '../../tenants/entities/tenant.entity';
import { Batch } from '../../batches/entities/batch.entity';
export declare class Medicine {
    id: string;
    tenant_id: string;
    tenant: Tenant;
    name: string;
    generic_name: string;
    category: string;
    unit: string;
    description: string;
    barcode: string;
    reorder_level: number;
    batches: Batch[];
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
