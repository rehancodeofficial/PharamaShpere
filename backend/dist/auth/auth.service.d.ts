import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { TenantsService } from '../tenants/tenants.service';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private tenantsService;
    private usersService;
    private cognitoClient;
    private clientId;
    constructor(tenantsService: TenantsService, usersService: UsersService);
    login(loginDto: LoginDto): Promise<{
        accessToken: string | undefined;
        idToken: string | undefined;
        refreshToken: string | undefined;
    }>;
    register(registerDto: RegisterDto): Promise<{
        message: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
}
