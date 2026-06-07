"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    canActivate(context) {
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
    handleRequest(err, user, info, context) {
        if (process.env.OFFLINE_MODE === 'true') {
            const request = context.switchToHttp().getRequest();
            return request.user;
        }
        if (err || !user) {
            throw err || new common_1.UnauthorizedException();
        }
        return user;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map