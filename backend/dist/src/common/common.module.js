"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const seeder_service_1 = require("./seeder.service");
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
const user_entity_1 = require("../users/entities/user.entity");
const supplier_entity_1 = require("../suppliers/entities/supplier.entity");
const medicine_entity_1 = require("../medicines/entities/medicine.entity");
const batch_entity_1 = require("../batches/entities/batch.entity");
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([tenant_entity_1.Tenant, user_entity_1.User, supplier_entity_1.Supplier, medicine_entity_1.Medicine, batch_entity_1.Batch]),
        ],
        providers: [seeder_service_1.SeederService],
        exports: [seeder_service_1.SeederService],
    })
], CommonModule);
//# sourceMappingURL=common.module.js.map