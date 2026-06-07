import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
export declare class SuppliersService {
    private readonly supplierRepository;
    constructor(supplierRepository: Repository<Supplier>);
    create(tenantId: string, dto: CreateSupplierDto): Promise<Supplier>;
    findAll(tenantId: string, search?: string, page?: number, limit?: number): Promise<{
        data: Supplier[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string, tenantId: string): Promise<Supplier>;
    update(id: string, tenantId: string, dto: UpdateSupplierDto): Promise<Supplier>;
    remove(id: string, tenantId: string): Promise<void>;
}
