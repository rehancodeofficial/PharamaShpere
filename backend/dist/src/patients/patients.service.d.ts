import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
export declare class PatientsService {
    private readonly patientRepository;
    constructor(patientRepository: Repository<Patient>);
    create(tenantId: string, dto: CreatePatientDto): Promise<Patient>;
    findAll(tenantId: string, page?: number, limit?: number): Promise<{
        data: Patient[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(tenantId: string, id: string): Promise<Patient>;
    update(tenantId: string, id: string, dto: UpdatePatientDto): Promise<Patient>;
    remove(tenantId: string, id: string): Promise<void>;
}
