import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { Prescription, PrescriptionStatus } from './entities/prescription.entity';
import { CreatePrescriptionDto, UpdatePrescriptionStatusDto } from './dto/create-prescription.dto';

@Injectable()
export class PrescriptionsService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
  ) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    this.bucketName = process.env.S3_PRESCRIPTION_BUCKET || 'pharmasphere-prescriptions';
  }

  async generateUploadUrl(tenantId: string, fileName: string, contentType: string): Promise<{ uploadUrl: string; fileKey: string }> {
    const fileExtension = fileName.split('.').pop();
    const fileKey = `tenants/${tenantId}/prescriptions/${uuidv4()}.${fileExtension}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        ContentType: contentType,
      });

      // URL expires in 15 minutes
      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 900 });

      return { uploadUrl, fileKey };
    } catch (error: any) {
      throw new InternalServerErrorException(`Failed to generate upload URL: ${error.message}`);
    }
  }

  async create(tenantId: string, userId: string, dto: CreatePrescriptionDto): Promise<Prescription> {
    const prescription = this.prescriptionRepository.create({
      ...dto,
      tenant_id: tenantId,
      created_by_id: userId,
    });
    return this.prescriptionRepository.save(prescription);
  }

  async findAll(
    tenantId: string,
    status?: PrescriptionStatus,
    page = 1,
    limit = 20,
  ): Promise<{ data: Prescription[]; total: number; page: number; limit: number }> {
    const where: Record<string, unknown> = { tenant_id: tenantId };
    if (status) where['status'] = status;

    const [data, total] = await this.prescriptionRepository.findAndCount({
      where,
      relations: { created_by: true },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOne(id: string, tenantId: string): Promise<Prescription> {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id, tenant_id: tenantId },
      relations: { created_by: true },
    });
    if (!prescription) throw new NotFoundException('Prescription not found');
    return prescription;
  }

  async updateStatus(
    id: string,
    tenantId: string,
    dto: UpdatePrescriptionStatusDto,
  ): Promise<Prescription> {
    const prescription = await this.findOne(id, tenantId);
    prescription.status = dto.status;
    if (dto.notes) {
      prescription.notes = dto.notes;
    }
    return this.prescriptionRepository.save(prescription);
  }
}
