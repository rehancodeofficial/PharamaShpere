"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const common_module_1 = require("./common/common.module");
const tenants_module_1 = require("./tenants/tenants.module");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const medicines_module_1 = require("./medicines/medicines.module");
const batches_module_1 = require("./batches/batches.module");
const suppliers_module_1 = require("./suppliers/suppliers.module");
const sales_module_1 = require("./sales/sales.module");
const prescriptions_module_1 = require("./prescriptions/prescriptions.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432', 10),
                username: process.env.DB_USER || 'pharma_admin',
                password: process.env.DB_PASSWORD || 'SuperSecretPassword123!',
                database: process.env.DB_NAME || 'pharmasphere_dev',
                autoLoadEntities: true,
                synchronize: process.env.NODE_ENV !== 'production',
            }),
            common_module_1.CommonModule,
            tenants_module_1.TenantsModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            medicines_module_1.MedicinesModule,
            batches_module_1.BatchesModule,
            suppliers_module_1.SuppliersModule,
            sales_module_1.SalesModule,
            prescriptions_module_1.PrescriptionsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map