import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    if (process.env.OFFLINE_MODE === 'true') {
      const request = context.switchToHttp().getRequest();
      request.user = {
        id: process.env.MOCK_USER_ID || '00000000-0000-0000-0000-000000000002',
        email: 'admin@pharmasphere.local',
        tenant_id: process.env.MOCK_TENANT_ID || '00000000-0000-0000-0000-000000000001',
        role: 'pharmacy_owner',
      };
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (process.env.OFFLINE_MODE === 'true') {
      const request = context.switchToHttp().getRequest();
      return request.user;
    }
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
