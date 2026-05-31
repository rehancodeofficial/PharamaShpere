import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { Batch } from '../batches/entities/batch.entity';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(Medicine)
    private readonly medicineRepository: Repository<Medicine>,
    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,
  ) {}

  async onApplicationBootstrap() {
    if (process.env.OFFLINE_MODE !== 'true') {
      this.logger.log('Not in OFFLINE_MODE. Skipping database seeding.');
      return;
    }

    try {
      this.logger.log('OFFLINE_MODE active. Starting database seeding...');

      // 1. Seed Tenant
      const mockTenantId = process.env.MOCK_TENANT_ID || '00000000-0000-0000-0000-000000000001';
      let tenant = await this.tenantRepository.findOne({ where: { id: mockTenantId } });
      if (!tenant) {
        tenant = this.tenantRepository.create({
          id: mockTenantId,
          name: 'PharmaSphere Main Branch',
          subdomain: 'main',
          subscription_plan: 'premium',
          is_active: true,
          contact_email: 'admin@pharmasphere.local',
        });
        tenant = await this.tenantRepository.save(tenant);
        this.logger.log('Default tenant seeded.');
      } else {
        this.logger.log('Default tenant already exists.');
      }

      // 2. Seed User
      const mockUserId = process.env.MOCK_USER_ID || '00000000-0000-0000-0000-000000000002';
      let user = await this.userRepository.findOne({ where: { id: mockUserId } });
      if (!user) {
        user = this.userRepository.create({
          id: mockUserId,
          tenant_id: tenant.id,
          email: 'admin@pharmasphere.local',
          full_name: 'Rehan Admin',
          phone: '+923001234567',
          is_active: true,
          role: 'pharmacy_owner',
        });
        await this.userRepository.save(user);
        this.logger.log('Default admin user seeded.');
      } else {
        this.logger.log('Default admin user already exists.');
      }

      // 3. Seed Suppliers
      const suppliersData = [
        { name: 'Citi Pharma Ltd', email: 'info@citipharma.pk', phone: '+922111124842' },
        { name: 'Sami Pharmaceuticals', email: 'sales@samipharma.pk', phone: '+922134538357' },
        { name: 'Getz Pharma', email: 'orders@getzpharma.com', phone: '+922138241111' },
      ];

      const suppliers: Supplier[] = [];
      for (const item of suppliersData) {
        let supplier = await this.supplierRepository.findOne({ where: { tenant_id: tenant.id, name: item.name } });
        if (!supplier) {
          supplier = this.supplierRepository.create({
            tenant_id: tenant.id,
            name: item.name,
            email: item.email,
            phone: item.phone,
          });
          supplier = await this.supplierRepository.save(supplier);
          this.logger.log(`Supplier ${item.name} seeded.`);
        }
        suppliers.push(supplier);
      }

      // 4. Seed Medicines & Batches
      const medicinesData = [
        { name: 'Paracetamol 500mg', generic_name: 'Acetaminophen', category: 'Analgesic', unit: 'Tablet', barcode: '8901030023456', reorder_level: 500 },
        { name: 'Amoxicillin 250mg', generic_name: 'Amoxicillin', category: 'Antibiotic', unit: 'Capsule', barcode: '8901030023470', reorder_level: 200 },
        { name: 'Metformin 850mg', generic_name: 'Metformin HCl', category: 'Antidiabetic', unit: 'Tablet', barcode: '8901030023485', reorder_level: 300 },
        { name: 'Ibuprofen 400mg', generic_name: 'Ibuprofen', category: 'Analgesic', unit: 'Tablet', barcode: '8901030023490', reorder_level: 400 },
        { name: 'Omeprazole 20mg', generic_name: 'Omeprazole', category: 'Antacid', unit: 'Capsule', barcode: '8901030023500', reorder_level: 100 },
        { name: 'Atorvastatin 10mg', generic_name: 'Atorvastatin', category: 'Lipid-lowering', unit: 'Tablet', barcode: '8901030023512', reorder_level: 150 },
        { name: 'Amlodipine 5mg', generic_name: 'Amlodipine', category: 'Antihypertensive', unit: 'Tablet', barcode: '8901030023525', reorder_level: 250 },
        { name: 'Cetirizine 10mg', generic_name: 'Cetirizine', category: 'Antihistamine', unit: 'Tablet', barcode: '8901030023530', reorder_level: 300 },
        { name: 'Azithromycin 500mg', generic_name: 'Azithromycin', category: 'Antibiotic', unit: 'Tablet', barcode: '8901030023545', reorder_level: 200 },
        { name: 'Salbutamol Inhaler', generic_name: 'Albuterol', category: 'Bronchodilator', unit: 'Inhaler', barcode: '8901030023555', reorder_level: 50 },
      ];

      // Expiry dates helper
      const getFutureDate = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d;
      };

      for (let i = 0; i < medicinesData.length; i++) {
        const item = medicinesData[i];
        let medicine = await this.medicineRepository.findOne({ where: { tenant_id: tenant.id, name: item.name } });
        if (!medicine) {
          medicine = this.medicineRepository.create({
            tenant_id: tenant.id,
            name: item.name,
            generic_name: item.generic_name,
            category: item.category,
            unit: item.unit,
            barcode: item.barcode,
            reorder_level: item.reorder_level,
          });
          medicine = await this.medicineRepository.save(medicine);
          this.logger.log(`Medicine ${item.name} seeded.`);

          // Create active batches for this medicine
          // Batch 1: Expiring soon (e.g. 15 days), lower quantity
          const expirySoon = getFutureDate(15);
          const batch1 = this.batchRepository.create({
            tenant_id: tenant.id,
            medicine_id: medicine.id,
            supplier_id: suppliers[i % suppliers.length].id,
            batch_number: `LOT-${1000 + i}-A`,
            quantity: Math.floor(Math.random() * 50) + 10,
            cost_price: 15 + i * 5,
            sell_price: 25 + i * 8,
            expiry_date: expirySoon,
            manufacture_date: getFutureDate(-180),
          });
          await this.batchRepository.save(batch1);

          // Batch 2: Healthy expiry (e.g. 360 days), higher quantity
          const expiryHealthy = getFutureDate(360);
          const batch2 = this.batchRepository.create({
            tenant_id: tenant.id,
            medicine_id: medicine.id,
            supplier_id: suppliers[(i + 1) % suppliers.length].id,
            batch_number: `LOT-${1000 + i}-B`,
            quantity: Math.floor(Math.random() * 500) + 300,
            cost_price: 15 + i * 5,
            sell_price: 25 + i * 8,
            expiry_date: expiryHealthy,
            manufacture_date: getFutureDate(-30),
          });
          await this.batchRepository.save(batch2);

          this.logger.log(`Batches for ${item.name} seeded.`);
        }
      }

      this.logger.log('Database seeding successfully finished.');
    } catch (err: any) {
      this.logger.error('Database seeding failed', err);
    }
  }
}
