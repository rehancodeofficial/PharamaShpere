import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';
export declare enum PrescriptionStatus {
    PENDING = "PENDING",
    VERIFIED = "VERIFIED",
    REJECTED = "REJECTED"
}
export declare class Prescription {
    id: string;
    tenant_id: string;
    tenant: Tenant;
    customer_name: string;
    customer_phone: string;
    doctor_name: string;
    file_url: string;
    status: PrescriptionStatus;
    notes: string;
    created_by_id: string;
    created_by: User;
    created_at: Date;
    updated_at: Date;
}
