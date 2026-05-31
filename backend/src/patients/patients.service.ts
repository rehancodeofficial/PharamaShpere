import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create(tenantId: string, dto: CreatePatientDto): Promise<Patient> {
    const patient = this.patientRepository.create({
      tenant_id: tenantId,
      ...dto,
    });
    return await this.patientRepository.save(patient);
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: Patient[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.patientRepository.findAndCount({
      where: { tenant_id: tenantId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOne(tenantId: string, id: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id, tenant_id: tenantId },
    });

    if (!patient) {
      throw new NotFoundException(`Patient ${id} not found`);
    }

    return patient;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdatePatientDto,
  ): Promise<Patient> {
    const patient = await this.findOne(tenantId, id);

    Object.assign(patient, dto);
    return await this.patientRepository.save(patient);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const patient = await this.findOne(tenantId, id);

    await this.patientRepository.remove(patient);
  }
}