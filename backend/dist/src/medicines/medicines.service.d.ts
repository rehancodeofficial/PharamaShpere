import { Repository } from 'typeorm';
import { Medicine } from './entities/medicine.entity';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
export declare class MedicinesService {
    private readonly medicineRepository;
    constructor(medicineRepository: Repository<Medicine>);
    create(tenantId: string, dto: CreateMedicineDto): Promise<Medicine>;
    findAll(tenantId: string, search?: string, category?: string, page?: number, limit?: number): Promise<{
        data: Medicine[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string, tenantId: string): Promise<Medicine>;
    update(id: string, tenantId: string, dto: UpdateMedicineDto): Promise<Medicine>;
    remove(id: string, tenantId: string): Promise<void>;
    findLowStock(tenantId: string): Promise<Medicine[]>;
}
