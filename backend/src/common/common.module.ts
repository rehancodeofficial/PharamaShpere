import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { Tenant } from '../tenants/entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { Batch } from '../batches/entities/batch.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, User, Supplier, Medicine, Batch]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class CommonModule {}
