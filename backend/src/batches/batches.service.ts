import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan } from 'typeorm';
import { Batch } from './entities/batch.entity';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';

@Injectable()
export class BatchesService {
  constructor(
    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,
  ) {}

  async create(tenantId: string, dto: CreateBatchDto): Promise<Batch> {
    const batch = this.batchRepository.create({
      ...dto,
      tenant_id: tenantId,
    });
    return this.batchRepository.save(batch);
  }

  async findAllByMedicine(
    tenantId: string,
    medicineId: string,
  ): Promise<Batch[]> {
    return this.batchRepository.find({
      where: { tenant_id: tenantId, medicine_id: medicineId },
      order: { expiry_date: 'ASC' },
      withDeleted: false,
    });
  }

  async findAllByTenant(tenantId: string): Promise<Batch[]> {
    return this.batchRepository.find({
      where: { tenant_id: tenantId },
      relations: { medicine: true },
      order: { expiry_date: 'ASC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Batch> {
    const batch = await this.batchRepository.findOne({
      where: { id, tenant_id: tenantId },
      relations: { medicine: true, supplier: true },
    });
    if (!batch) throw new NotFoundException(`Batch not found`);
    return batch;
  }

  async update(
    id: string,
    tenantId: string,
    dto: UpdateBatchDto,
  ): Promise<Batch> {
    const batch = await this.findOne(id, tenantId);
    Object.assign(batch, dto);
    return this.batchRepository.save(batch);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const batch = await this.findOne(id, tenantId);
    await this.batchRepository.softDelete(batch.id);
  }

  /** Reduce stock quantity atomically — used by POS sales */
  async deductStock(
    id: string,
    tenantId: string,
    quantity: number,
  ): Promise<Batch> {
    const batch = await this.findOne(id, tenantId);
    if (batch.quantity < quantity) {
      throw new BadRequestException(
        `Insufficient stock in batch ${batch.batch_number}`,
      );
    }
    batch.quantity -= quantity;
    return this.batchRepository.save(batch);
  }

  /** Batches expiring within `days` days */
  async findExpiring(tenantId: string, days = 30): Promise<Batch[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);

    return this.batchRepository.find({
      where: {
        tenant_id: tenantId,
        expiry_date: LessThanOrEqual(cutoff),
        quantity: MoreThan(0),
      },
      relations: { medicine: true },
      order: { expiry_date: 'ASC' },
    });
  }
}
