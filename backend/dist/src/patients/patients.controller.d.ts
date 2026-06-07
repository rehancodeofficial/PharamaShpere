import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
export declare class PatientsController {
    private readonly patientsService;
    constructor(patientsService: PatientsService);
    create(tenantId: string, dto: CreatePatientDto): Promise<import("./entities/patient.entity").Patient>;
    findAll(tenantId: string, page?: number, limit?: number): Promise<{
        data: import("./entities/patient.entity").Patient[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(tenantId: string, id: string): Promise<import("./entities/patient.entity").Patient>;
    update(tenantId: string, id: string, dto: UpdatePatientDto): Promise<import("./entities/patient.entity").Patient>;
    remove(tenantId: string, id: string): Promise<void>;
}
