import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Medicine } from '../../medicines/entities/medicine.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';

@Entity('batches')
export class Batch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenant_id: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column('uuid')
  medicine_id: string;

  @ManyToOne(() => Medicine, (medicine) => medicine.batches)
  @JoinColumn({ name: 'medicine_id' })
  medicine: Medicine;

  @Column('uuid', { nullable: true })
  supplier_id: string;

  @ManyToOne(() => Supplier, { nullable: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column()
  batch_number: string;

  @Column({ default: 0 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  cost_price: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  sell_price: number;

  @Column({ type: 'date' })
  expiry_date: Date;

  @Column({ type: 'date', nullable: true })
  manufacture_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
