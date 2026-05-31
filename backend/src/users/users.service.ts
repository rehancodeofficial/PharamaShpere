import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminUpdateUserAttributesCommand, AdminDisableUserCommand, AdminEnableUserCommand } from '@aws-sdk/client-cognito-identity-provider';

@Injectable()
export class UsersService {
  private cognitoClient: CognitoIdentityProviderClient;
  private userPoolId: string;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.userPoolId = process.env.COGNITO_USER_POOL_ID || '';
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async invite(tenantId: string, createUserDto: CreateUserDto): Promise<User> {
    try {
      const command = new AdminCreateUserCommand({
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
    } catch (error: any) {
      throw new InternalServerErrorException(error.message || 'Failed to invite user');
    }
  }

  async updateRole(id: string, tenantId: string, role: string): Promise<User> {
    const user = await this.findOneByTenant(id, tenantId);
    user.role = role;
    const updatedUser = await this.userRepository.save(user);

    try {
      const command = new AdminUpdateUserAttributesCommand({
        UserPoolId: this.userPoolId,
        Username: user.email,
        UserAttributes: [
          { Name: 'custom:role', Value: role },
        ],
      });
      await this.cognitoClient.send(command);
    } catch (error) {
      console.error('Failed to update role in Cognito', error);
    }

    return updatedUser;
  }

  async updateStatus(id: string, tenantId: string, isActive: boolean): Promise<User> {
    const user = await this.findOneByTenant(id, tenantId);
    user.is_active = isActive;
    const updatedUser = await this.userRepository.save(user);

    try {
      if (isActive) {
         await this.cognitoClient.send(new AdminEnableUserCommand({ UserPoolId: this.userPoolId, Username: user.email }));
      } else {
         await this.cognitoClient.send(new AdminDisableUserCommand({ UserPoolId: this.userPoolId, Username: user.email }));
      }
    } catch (error) {
      console.error('Failed to update status in Cognito', error);
    }

    return updatedUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findAllByTenant(tenantId: string): Promise<User[]> {
    return this.userRepository.find({ where: { tenant_id: tenantId } });
  }

  async findOneByTenant(id: string, tenantId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id, tenant_id: tenantId } });
    if (!user) {
      throw new NotFoundException(`User not found in this tenant`);
    }
    return user;
  }
}
