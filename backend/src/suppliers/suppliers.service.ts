import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async create(tenantId: string, dto: CreateSupplierDto): Promise<Supplier> {
    const supplier = this.supplierRepository.create({
      ...dto,
      tenant_id: tenantId,
    });
    return this.supplierRepository.save(supplier);
  }

  async findAll(
    tenantId: string,
    search?: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: Supplier[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.supplierRepository.findAndCount({
      where: search
        ? [
            { tenant_id: tenantId, name: ILike(`%${search}%`) },
            { tenant_id: tenantId, contact_person: ILike(`%${search}%`) },
          ]
        : { tenant_id: tenantId },
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });

    return { data, total, page, limit };
  }

  async findOne(id: string, tenantId: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id, tenant_id: tenantId },
    });
    if (!supplier) throw new NotFoundException(`Supplier not found`);
    return supplier;
  }

  async update(
    id: string,
    tenantId: string,
    dto: UpdateSupplierDto,
  ): Promise<Supplier> {
    const supplier = await this.findOne(id, tenantId);
    Object.assign(supplier, dto);
    return this.supplierRepository.save(supplier);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const supplier = await this.findOne(id, tenantId);
    await this.supplierRepository.softDelete(supplier.id);
  }
}
