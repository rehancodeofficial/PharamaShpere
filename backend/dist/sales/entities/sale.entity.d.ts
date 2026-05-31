import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';
import { SaleItem } from './sale-item.entity';
export declare enum PaymentMethod {
    CASH = "CASH",
    CARD = "CARD",
    INSURANCE = "INSURANCE"
}
export declare class Sale {
    id: string;
    tenant_id: string;
    tenant: Tenant;
    customer_name: string;
    customer_phone: string;
    total_amount: number;
    discount_amount: number;
    payment_method: PaymentMethod;
    created_by_id: string;
    created_by: User;
    items: SaleItem[];
    created_at: Date;
    updated_at: Date;
}
