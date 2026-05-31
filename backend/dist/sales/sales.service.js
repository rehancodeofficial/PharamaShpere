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
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const sale_entity_1 = require("./entities/sale.entity");
const sale_item_entity_1 = require("./entities/sale-item.entity");
const batch_entity_1 = require("../batches/entities/batch.entity");
let SalesService = class SalesService {
    dataSource;
    saleRepository;
    constructor(dataSource, saleRepository) {
        this.dataSource = dataSource;
        this.saleRepository = saleRepository;
    }
    async createSale(tenantId, userId, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            let totalAmount = 0;
            const saleItemsToInsert = [];
            const sale = queryRunner.manager.create(sale_entity_1.Sale, {
                tenant_id: tenantId,
                created_by_id: userId,
                customer_name: dto.customer_name,
                customer_phone: dto.customer_phone,
                discount_amount: dto.discount_amount || 0,
                payment_method: dto.payment_method,
            });
            const savedSale = await queryRunner.manager.save(sale_entity_1.Sale, sale);
            for (const itemDto of dto.items) {
                const batch = await queryRunner.manager.findOne(batch_entity_1.Batch, {
                    where: {
                        id: itemDto.batch_id,
                        medicine_id: itemDto.medicine_id,
                        tenant_id: tenantId,
                    },
                    lock: { mode: 'pessimistic_write' },
                });
                if (!batch) {
                    throw new common_1.NotFoundException(`Batch ${itemDto.batch_id} not found`);
                }
                if (batch.quantity < itemDto.quantity) {
                    throw new common_1.BadRequestException(`Insufficient stock for batch ${batch.batch_number}. Available: ${batch.quantity}, Requested: ${itemDto.quantity}`);
                }
                const unitPrice = Number(batch.sell_price);
                const itemTotal = unitPrice * itemDto.quantity;
                totalAmount += itemTotal;
                batch.quantity -= itemDto.quantity;
                await queryRunner.manager.save(batch_entity_1.Batch, batch);
                const saleItem = queryRunner.manager.create(sale_item_entity_1.SaleItem, {
                    sale_id: savedSale.id,
                    medicine_id: batch.medicine_id,
                    batch_id: batch.id,
                    quantity: itemDto.quantity,
                    unit_price: unitPrice,
                    total_price: itemTotal,
                });
                saleItemsToInsert.push(saleItem);
            }
            savedSale.total_amount = totalAmount - (dto.discount_amount || 0);
            if (savedSale.total_amount < 0) {
                throw new common_1.BadRequestException('Discount cannot be greater than total amount');
            }
            await queryRunner.manager.save(sale_item_entity_1.SaleItem, saleItemsToInsert);
            await queryRunner.manager.save(sale_entity_1.Sale, savedSale);
            await queryRunner.commitTransaction();
            return await this.saleRepository.findOneOrFail({
                where: { id: savedSale.id },
                relations: {
                    items: {
                        medicine: true,
                        batch: true,
                    },
                    created_by: true,
                }
            });
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            if (err instanceof common_1.BadRequestException || err instanceof common_1.NotFoundException) {
                throw err;
            }
            throw new common_1.InternalServerErrorException(`Failed to process sale: ${err.message}`);
        }
        finally {
            await queryRunner.release();
        }
    }
    async getSalesHistory(tenantId, page = 1, limit = 20) {
        const [data, total] = await this.saleRepository.findAndCount({
            where: { tenant_id: tenantId },
            relations: {
                items: true,
                created_by: true,
            },
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total, page, limit };
    }
    async getDailySalesSummary(tenantId, dateString) {
        const startOfDay = new Date(dateString);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateString);
        endOfDay.setHours(23, 59, 59, 999);
        const sales = await this.saleRepository.find({
            where: {
                tenant_id: tenantId,
                created_at: (0, typeorm_1.Between)(startOfDay, endOfDay),
            },
        });
        const totalSalesAmount = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
        const totalTransactions = sales.length;
        return {
            date: dateString,
            total_sales_amount: totalSalesAmount,
            total_transactions: totalTransactions,
            sales,
        };
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_2.InjectRepository)(sale_entity_1.Sale)),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        typeorm_1.Repository])
], SalesService);
//# sourceMappingURL=sales.service.js.map