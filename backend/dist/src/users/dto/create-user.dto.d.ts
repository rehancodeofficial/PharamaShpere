export declare enum UserRole {
    SUPER_ADMIN = "super_admin",
    PHARMACY_OWNER = "pharmacy_owner",
    PHARMACIST = "pharmacist",
    CASHIER = "cashier"
}
export declare class CreateUserDto {
    tenant_id: string;
    email: string;
    full_name: string;
    phone?: string;
    cognito_id?: string;
    role: UserRole;
}
