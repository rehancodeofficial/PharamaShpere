import { PaymentMethod } from '../entities/sale.entity';
export declare class SaleItemDto {
    medicine_id: string;
    batch_id: string;
    quantity: number;
}
export declare class CreateSaleDto {
    customer_name?: string;
    customer_phone?: string;
    discount_amount?: number;
    payment_method?: PaymentMethod;
    items: SaleItemDto[];
}
