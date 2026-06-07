"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const tenants_service_1 = require("../tenants/tenants.service");
const users_service_1 = require("../users/users.service");
const create_user_dto_1 = require("../users/dto/create-user.dto");
let AuthService = class AuthService {
    tenantsService;
    usersService;
    cognitoClient;
    clientId;
    constructor(tenantsService, usersService) {
        this.tenantsService = tenantsService;
        this.usersService = usersService;
        this.clientId = process.env.COGNITO_CLIENT_ID || '';
        this.cognitoClient = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({
            region: process.env.AWS_REGION || 'us-east-1',
        });
    }
    async login(loginDto) {
        if (process.env.OFFLINE_MODE === 'true') {
            const user = await this.usersService.findByEmail(loginDto.email);
            if (!user) {
                throw new common_1.BadRequestException('User not found. Please register first.');
            }
            return {
                accessToken: 'mock-access-token',
                idToken: 'mock-id-token',
                refreshToken: 'mock-refresh-token',
            };
        }
        try {
            const command = new client_cognito_identity_provider_1.InitiateAuthCommand({
                AuthFlow: 'USER_PASSWORD_AUTH',
                ClientId: this.clientId,
                AuthParameters: {
                    USERNAME: loginDto.email,
                    PASSWORD: loginDto.password,
                },
            });
            const response = await this.cognitoClient.send(command);
            return {
                accessToken: response.AuthenticationResult?.AccessToken,
                idToken: response.AuthenticationResult?.IdToken,
                refreshToken: response.AuthenticationResult?.RefreshToken,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message || 'Login failed');
        }
    }
    async register(registerDto) {
        try {
            let tenant = await this.tenantsService.findBySubdomain(registerDto.subdomain);
            if (!tenant) {
                tenant = await this.tenantsService.create({
                    name: registerDto.pharmacyName,
                    subdomain: registerDto.subdomain,
                });
            }
            let user = await this.usersService.findByEmail(registerDto.email);
            if (user) {
                throw new common_1.BadRequestException('Email already registered');
            }
            user = await this.usersService.create({
                tenant_id: tenant.id,
                email: registerDto.email,
                full_name: registerDto.full_name,
                role: create_user_dto_1.UserRole.PHARMACY_OWNER,
            });
            if (process.env.OFFLINE_MODE === 'true') {
                return { message: 'Registration successful (Offline Mode). You can now log in.' };
            }
            const command = new client_cognito_identity_provider_1.SignUpCommand({
                ClientId: this.clientId,
                Username: registerDto.email,
                Password: registerDto.password,
                UserAttributes: [
                    { Name: 'email', Value: registerDto.email },
                    { Name: 'custom:tenant_id', Value: tenant.id },
                    { Name: 'custom:role', Value: create_user_dto_1.UserRole.PHARMACY_OWNER },
                ],
            });
            await this.cognitoClient.send(command);
            return { message: 'Registration successful. Please check your email to verify your account.' };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(error.message || 'Registration failed');
        }
    }
    async forgotPassword(forgotPasswordDto) {
        if (process.env.OFFLINE_MODE === 'true') {
            return { message: 'Password reset code sent successfully (Offline Mode)' };
        }
        try {
            const command = new client_cognito_identity_provider_1.ForgotPasswordCommand({
                ClientId: this.clientId,
                Username: forgotPasswordDto.email,
            });
            await this.cognitoClient.send(command);
            return { message: 'Password reset code sent successfully' };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message || 'Failed to send reset code');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService,
        users_service_1.UsersService])
], AuthService);
//# sourceMappingURL=auth.service.js.map