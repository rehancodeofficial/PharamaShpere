import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    invite(createUserDto: CreateUserDto, tenantId: string): Promise<import("./entities/user.entity").User>;
    updateRole(id: string, body: {
        role: string;
    }, tenantId: string): Promise<import("./entities/user.entity").User>;
    updateStatus(id: string, body: {
        is_active: boolean;
    }, tenantId: string): Promise<import("./entities/user.entity").User>;
    findAll(tenantId: string): Promise<import("./entities/user.entity").User[]>;
    findOne(id: string, tenantId: string): Promise<import("./entities/user.entity").User>;
}
