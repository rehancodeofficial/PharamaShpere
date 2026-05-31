import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository, Between } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Batch } from '../batches/entities/batch.entity';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
  ) {}

  async createSale(
    tenantId: string,
    userId: string,
    dto: CreateSaleDto,
  ): Promise<Sale> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalAmount = 0;
      const saleItemsToInsert: SaleItem[] = [];

      // Create Sale Entity
      const sale = queryRunner.manager.create(Sale, {
        tenant_id: tenantId,
        created_by_id: userId,
        customer_name: dto.customer_name,
        customer_phone: dto.customer_phone,
        discount_amount: dto.discount_amount || 0,
        payment_method: dto.payment_method,
      });

      // We must save the sale first to get its ID for the SaleItems
      const savedSale = await queryRunner.manager.save(Sale, sale);

      // Process each item
      for (const itemDto of dto.items) {
        // Find batch
        const batch = await queryRunner.manager.findOne(Batch, {
          where: {
            id: itemDto.batch_id,
            medicine_id: itemDto.medicine_id,
            tenant_id: tenantId,
          },
          lock: { mode: 'pessimistic_write' }, // Lock the row for update to prevent concurrent race conditions
        });

        if (!batch) {
          throw new NotFoundException(`Batch ${itemDto.batch_id} not found`);
        }

        if (batch.quantity < itemDto.quantity) {
          throw new BadRequestException(
            `Insufficient stock for batch ${batch.batch_number}. Available: ${batch.quantity}, Requested: ${itemDto.quantity}`,
          );
        }

        // Calculate item total
        const unitPrice = Number(batch.sell_price);
        const itemTotal = unitPrice * itemDto.quantity;
        totalAmount += itemTotal;

        // Deduct inventory
        batch.quantity -= itemDto.quantity;
        await queryRunner.manager.save(Batch, batch);

        // Prepare SaleItem
        const saleItem = queryRunner.manager.create(SaleItem, {
          sale_id: savedSale.id,
          medicine_id: batch.medicine_id,
          batch_id: batch.id,
          quantity: itemDto.quantity,
          unit_price: unitPrice,
          total_price: itemTotal,
        });

        saleItemsToInsert.push(saleItem);
      }

      // Finalize sale total amount minus discount
      savedSale.total_amount = totalAmount - (dto.discount_amount || 0);
      if (savedSale.total_amount < 0) {
          throw new BadRequestException('Discount cannot be greater than total amount');
      }

      await queryRunner.manager.save(SaleItem, saleItemsToInsert);
      await queryRunner.manager.save(Sale, savedSale);

      await queryRunner.commitTransaction();
      
      // Return fully loaded sale
      return await this.saleRepository.findOneOrFail({
          where: { id: savedSale.id },
          relations: {
            items: {
              medicine: true,
              batch: true,
            },
            created_by: true,
          }
      });

    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      if (err instanceof BadRequestException || err instanceof NotFoundException) {
        throw err;
      }
      throw new InternalServerErrorException(
        `Failed to process sale: ${err.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getSalesHistory(
    tenantId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: Sale[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.saleRepository.findAndCount({
      where: { tenant_id: tenantId },
      relations: {
        items: true,
        created_by: true,
      },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async getDailySalesSummary(tenantId: string, dateString: string): Promise<any> {
    const startOfDay = new Date(dateString);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dateString);
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await this.saleRepository.find({
      where: {
        tenant_id: tenantId,
        created_at: Between(startOfDay, endOfDay),
      },
    });

    const totalSalesAmount = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
    const totalTransactions = sales.length;

    return {
      date: dateString,
      total_sales_amount: totalSalesAmount,
      total_transactions: totalTransactions,
      sales,
    };
  }
}
