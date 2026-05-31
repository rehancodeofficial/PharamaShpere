export declare class CreateBatchDto {
    tenant_id?: string;
    medicine_id: string;
    supplier_id?: string;
    batch_number: string;
    quantity: number;
    cost_price: number;
    sell_price: number;
    expiry_date: string;
    manufacture_date?: string;
}
