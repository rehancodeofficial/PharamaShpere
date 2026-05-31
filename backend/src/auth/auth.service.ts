import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { CognitoIdentityProviderClient, InitiateAuthCommand, SignUpCommand, ForgotPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { TenantsService } from '../tenants/tenants.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  private cognitoClient: CognitoIdentityProviderClient;
  private clientId: string;

  constructor(
    private tenantsService: TenantsService,
    private usersService: UsersService,
  ) {
    this.clientId = process.env.COGNITO_CLIENT_ID || '';
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  async login(loginDto: LoginDto) {
    if (process.env.OFFLINE_MODE === 'true') {
      const user = await this.usersService.findByEmail(loginDto.email);
      if (!user) {
        throw new BadRequestException('User not found. Please register first.');
      }
      return {
        accessToken: 'mock-access-token',
        idToken: 'mock-id-token',
        refreshToken: 'mock-refresh-token',
      };
    }
    try {
      const command = new InitiateAuthCommand({
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
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Login failed');
    }
  }

  async register(registerDto: RegisterDto) {
    try {
      // 1. Create Tenant in Postgres
      let tenant = await this.tenantsService.findBySubdomain(registerDto.subdomain);
      if (!tenant) {
        tenant = await this.tenantsService.create({
          name: registerDto.pharmacyName,
          subdomain: registerDto.subdomain,
        });
      }

      let user = await this.usersService.findByEmail(registerDto.email);
      if (user) {
        throw new BadRequestException('Email already registered');
      }

      user = await this.usersService.create({
        tenant_id: tenant.id,
        email: registerDto.email,
        full_name: registerDto.full_name,
        role: UserRole.PHARMACY_OWNER,
      });

      if (process.env.OFFLINE_MODE === 'true') {
        return { message: 'Registration successful (Offline Mode). You can now log in.' };
      }

      // 3. Register User in Cognito
      const command = new SignUpCommand({
        ClientId: this.clientId,
        Username: registerDto.email,
        Password: registerDto.password,
        UserAttributes: [
          { Name: 'email', Value: registerDto.email },
          { Name: 'custom:tenant_id', Value: tenant.id },
          { Name: 'custom:role', Value: UserRole.PHARMACY_OWNER },
        ],
      });

      await this.cognitoClient.send(command);
      return { message: 'Registration successful. Please check your email to verify your account.' };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message || 'Registration failed');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    if (process.env.OFFLINE_MODE === 'true') {
      return { message: 'Password reset code sent successfully (Offline Mode)' };
    }
    try {
      const command = new ForgotPasswordCommand({
        ClientId: this.clientId,
        Username: forgotPasswordDto.email,
      });
      await this.cognitoClient.send(command);
      return { message: 'Password reset code sent successfully' };
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Failed to send reset code');
    }
  }
}
