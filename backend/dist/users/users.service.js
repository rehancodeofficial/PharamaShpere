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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
let UsersService = class UsersService {
    userRepository;
    cognitoClient;
    userPoolId;
    constructor(userRepository) {
        this.userRepository = userRepository;
        this.userPoolId = process.env.COGNITO_USER_POOL_ID || '';
        this.cognitoClient = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({
            region: process.env.AWS_REGION || 'us-east-1',
        });
    }
    async create(createUserDto) {
        const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const user = this.userRepository.create(createUserDto);
        return this.userRepository.save(user);
    }
    async invite(tenantId, createUserDto) {
        try {
            const command = new client_cognito_identity_provider_1.AdminCreateUserCommand({
                UserPoolId: this.userPoolId,
                Username: createUserDto.email,
                UserAttributes: [
                    { Name: 'email', Value: createUserDto.email },
                    { Name: 'email_verified', Value: 'true' },
                    { Name: 'custom:tenant_id', Value: tenantId },
                    { Name: 'custom:role', Value: createUserDto.role },
                ],
                DesiredDeliveryMediums: ['EMAIL'],
            });
            const response = await this.cognitoClient.send(command);
            const cognitoId = response.User?.Attributes?.find(attr => attr.Name === 'sub')?.Value;
            createUserDto.cognito_id = cognitoId;
            createUserDto.tenant_id = tenantId;
            return this.create(createUserDto);
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error.message || 'Failed to invite user');
        }
    }
    async updateRole(id, tenantId, role) {
        const user = await this.findOneByTenant(id, tenantId);
        user.role = role;
        const updatedUser = await this.userRepository.save(user);
        try {
            const command = new client_cognito_identity_provider_1.AdminUpdateUserAttributesCommand({
                UserPoolId: this.userPoolId,
                Username: user.email,
                UserAttributes: [
                    { Name: 'custom:role', Value: role },
                ],
            });
            await this.cognitoClient.send(command);
        }
        catch (error) {
            console.error('Failed to update role in Cognito', error);
        }
        return updatedUser;
    }
    async updateStatus(id, tenantId, isActive) {
        const user = await this.findOneByTenant(id, tenantId);
        user.is_active = isActive;
        const updatedUser = await this.userRepository.save(user);
        try {
            if (isActive) {
                await this.cognitoClient.send(new client_cognito_identity_provider_1.AdminEnableUserCommand({ UserPoolId: this.userPoolId, Username: user.email }));
            }
            else {
                await this.cognitoClient.send(new client_cognito_identity_provider_1.AdminDisableUserCommand({ UserPoolId: this.userPoolId, Username: user.email }));
            }
        }
        catch (error) {
            console.error('Failed to update status in Cognito', error);
        }
        return updatedUser;
    }
    async findByEmail(email) {
        return this.userRepository.findOne({ where: { email } });
    }
    async findAllByTenant(tenantId) {
        return this.userRepository.find({ where: { tenant_id: tenantId } });
    }
    async findOneByTenant(id, tenantId) {
        const user = await this.userRepository.findOne({ where: { id, tenant_id: tenantId } });
        if (!user) {
            throw new common_1.NotFoundException(`User not found in this tenant`);
        }
        return user;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map