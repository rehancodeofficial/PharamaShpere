import { MedicinesService } from './medicines.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
export declare class MedicinesController {
    private readonly medicinesService;
    constructor(medicinesService: MedicinesService);
    create(dto: CreateMedicineDto, tenantId: string): Promise<{
        success: boolean;
        data: import("./entities/medicine.entity").Medicine;
        message: string;
    }>;
    findAll(tenantId: string, search?: string, category?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        data: import("./entities/medicine.entity").Medicine[];
        message: string;
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    findLowStock(tenantId: string): Promise<{
        success: boolean;
        data: import("./entities/medicine.entity").Medicine[];
        message: string;
    }>;
    findOne(id: string, tenantId: string): Promise<{
        success: boolean;
        data: import("./entities/medicine.entity").Medicine;
        message: string;
    }>;
    update(id: string, dto: UpdateMedicineDto, tenantId: string): Promise<{
        success: boolean;
        data: import("./entities/medicine.entity").Medicine;
        message: string;
    }>;
    remove(id: string, tenantId: string): Promise<void>;
}
