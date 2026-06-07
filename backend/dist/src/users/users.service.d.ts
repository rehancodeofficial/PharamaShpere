import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private readonly userRepository;
    private cognitoClient;
    private userPoolId;
    constructor(userRepository: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<User>;
    invite(tenantId: string, createUserDto: CreateUserDto): Promise<User>;
    updateRole(id: string, tenantId: string, role: string): Promise<User>;
    updateStatus(id: string, tenantId: string, isActive: boolean): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findAllByTenant(tenantId: string): Promise<User[]>;
    findOneByTenant(id: string, tenantId: string): Promise<User>;
}
