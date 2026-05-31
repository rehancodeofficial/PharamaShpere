import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Medicine } from './entities/medicine.entity';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

@Injectable()
export class MedicinesService {
  constructor(
    @InjectRepository(Medicine)
    private readonly medicineRepository: Repository<Medicine>,
  ) {}

  async create(
    tenantId: string,
    dto: CreateMedicineDto,
  ): Promise<Medicine> {
    const medicine = this.medicineRepository.create({
      ...dto,
      tenant_id: tenantId,
    });
    return this.medicineRepository.save(medicine);
  }

  async findAll(
    tenantId: string,
    search?: string,
    category?: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: Medicine[]; total: number; page: number; limit: number }> {
    const where: Record<string, unknown> = { tenant_id: tenantId };
    if (category) where['category'] = category;

    const [data, total] = await this.medicineRepository.findAndCount({
      where: search
        ? [
            { tenant_id: tenantId, name: ILike(`%${search}%`) },
            { tenant_id: tenantId, generic_name: ILike(`%${search}%`) },
            { tenant_id: tenantId, barcode: ILike(`%${search}%`) },
          ]
        : where,
      relations: { batches: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
      withDeleted: false,
    });

    return { data, total, page, limit };
  }

  async findOne(id: string, tenantId: string): Promise<Medicine> {
    const medicine = await this.medicineRepository.findOne({
      where: { id, tenant_id: tenantId },
      relations: { batches: true },
    });
    if (!medicine) throw new NotFoundException(`Medicine not found`);
    return medicine;
  }

  async update(
    id: string,
    tenantId: string,
    dto: UpdateMedicineDto,
  ): Promise<Medicine> {
    const medicine = await this.findOne(id, tenantId);
    Object.assign(medicine, dto);
    return this.medicineRepository.save(medicine);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const medicine = await this.findOne(id, tenantId);
    await this.medicineRepository.softDelete(medicine.id);
  }

  /** Returns medicines where total batch stock is below reorder_level */
  async findLowStock(tenantId: string): Promise<Medicine[]> {
    return this.medicineRepository
      .createQueryBuilder('medicine')
      .leftJoin('medicine.batches', 'batch', 'batch.deleted_at IS NULL')
      .addSelect('COALESCE(SUM(batch.quantity), 0)', 'total_stock')
      .where('medicine.tenant_id = :tenantId', { tenantId })
      .andWhere('medicine.deleted_at IS NULL')
      .groupBy('medicine.id')
      .having(
        'COALESCE(SUM(batch.quantity), 0) <= medicine.reorder_level',
      )
      .getMany();
  }
}
