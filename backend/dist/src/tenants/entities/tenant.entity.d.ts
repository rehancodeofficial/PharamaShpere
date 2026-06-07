import { User } from '../../users/entities/user.entity';
export declare class Tenant {
    id: string;
    name: string;
    subdomain: string;
    subscription_plan: string;
    is_active: boolean;
    contact_email: string;
    users: User[];
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
