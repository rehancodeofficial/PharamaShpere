import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MedicinesModule } from './medicines/medicines.module';
import { BatchesModule } from './batches/batches.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { SalesModule } from './sales/sales.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { PatientsModule } from './patients/patients.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'pharma_admin',
      password: process.env.DB_PASSWORD || 'SuperSecretPassword123!',
      database: process.env.DB_NAME || 'pharmasphere_dev',
      autoLoadEntities: true,
      // Never use synchronize:true in production — always run TypeORM migrations
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    CommonModule,
    TenantsModule,
    UsersModule,
    AuthModule,
    MedicinesModule,
    BatchesModule,
    SuppliersModule,
    SalesModule,
    PrescriptionsModule,
    PatientsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
