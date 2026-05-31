import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { User } from '../users/entities/user.entity';
export declare class SalesController {
    private readonly salesService;
    constructor(salesService: SalesService);
    create(dto: CreateSaleDto, tenantId: string, user: User): Promise<{
        success: boolean;
        data: import("./entities/sale.entity").Sale;
        message: string;
    }>;
    getHistory(tenantId: string, page?: number, limit?: number): Promise<{
        success: boolean;
        data: import("./entities/sale.entity").Sale[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    getDailySummary(tenantId: string, date?: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
}
