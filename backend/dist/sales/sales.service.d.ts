import { DataSource, Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
export declare class SalesService {
    private readonly dataSource;
    private readonly saleRepository;
    constructor(dataSource: DataSource, saleRepository: Repository<Sale>);
    createSale(tenantId: string, userId: string, dto: CreateSaleDto): Promise<Sale>;
    getSalesHistory(tenantId: string, page?: number, limit?: number): Promise<{
        data: Sale[];
        total: number;
        page: number;
        limit: number;
    }>;
    getDailySalesSummary(tenantId: string, dateString: string): Promise<any>;
}
