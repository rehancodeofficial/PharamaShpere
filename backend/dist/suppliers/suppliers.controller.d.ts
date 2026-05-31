import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
export declare class SuppliersController {
    private readonly suppliersService;
    constructor(suppliersService: SuppliersService);
    create(dto: CreateSupplierDto, tenantId: string): Promise<{
        success: boolean;
        data: import("./entities/supplier.entity").Supplier;
        message: string;
    }>;
    findAll(tenantId: string, search?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        data: import("./entities/supplier.entity").Supplier[];
        message: string;
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    findOne(id: string, tenantId: string): Promise<{
        success: boolean;
        data: import("./entities/supplier.entity").Supplier;
        message: string;
    }>;
    update(id: string, dto: UpdateSupplierDto, tenantId: string): Promise<{
        success: boolean;
        data: import("./entities/supplier.entity").Supplier;
        message: string;
    }>;
    remove(id: string, tenantId: string): Promise<void>;
}
