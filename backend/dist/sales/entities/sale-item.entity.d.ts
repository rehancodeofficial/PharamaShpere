import { Sale } from './sale.entity';
import { Medicine } from '../../medicines/entities/medicine.entity';
import { Batch } from '../../batches/entities/batch.entity';
export declare class SaleItem {
    id: string;
    sale_id: string;
    sale: Sale;
    medicine_id: string;
    medicine: Medicine;
    batch_id: string;
    batch: Batch;
    quantity: number;
    unit_price: number;
    total_price: number;
}
