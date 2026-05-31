import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // AuthGuard should run before this and populate request.user
    if (!request.user || !request.user.tenant_id) {
      throw new ForbiddenException('Tenant context is missing');
    }

    // You can optionally add logic here to verify if the user's tenant_id matches the requested resource's tenant_id if it's passed in the URL/body.
    return true;
  }
}
