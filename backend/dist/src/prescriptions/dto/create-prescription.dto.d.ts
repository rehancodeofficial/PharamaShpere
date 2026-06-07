import { PrescriptionStatus } from '../entities/prescription.entity';
export declare class CreatePrescriptionDto {
    customer_name: string;
    customer_phone?: string;
    doctor_name?: string;
    file_url: string;
    notes?: string;
}
export declare class UpdatePrescriptionStatusDto {
    status: PrescriptionStatus;
    notes?: string;
}
