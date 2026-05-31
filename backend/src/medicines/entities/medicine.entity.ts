import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Batch } from '../../batches/entities/batch.entity';

@Entity('medicines')
export class Medicine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenant_id: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column()
  name: string;

  @Column({ nullable: true })
  generic_name: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  unit: string; // e.g. tablet, ml, mg

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true, unique: false })
  barcode: string;

  @Column({ default: 10 })
  reorder_level: number; // alert when stock falls below this

  @OneToMany(() => Batch, (batch) => batch.medicine)
  batches: Batch[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
