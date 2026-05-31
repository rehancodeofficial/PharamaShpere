import { Tenant } from '../../tenants/entities/tenant.entity';
import { Medicine } from '../../medicines/entities/medicine.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
export declare class Batch {
    id: string;
    tenant_id: string;
    tenant: Tenant;
    medicine_id: string;
    medicine: Medicine;
    supplier_id: string;
    supplier: Supplier;
    batch_number: string;
    quantity: number;
    cost_price: number;
    sell_price: number;
    expiry_date: Date;
    manufacture_date: Date;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
