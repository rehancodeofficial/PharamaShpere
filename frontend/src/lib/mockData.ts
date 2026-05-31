export const mockStats = {
  todayRevenue: 45230,
  totalMedicines: 342,
  lowStockItems: 12,
  expiringSoon: 8,
};

export const mockMedicines = [
  { id: '1', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Analgesic', unit: 'Tablet', stock: 2400, reorderLevel: 500, status: 'Active' },
  { id: '2', name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', category: 'Antibiotic', unit: 'Capsule', stock: 180, reorderLevel: 200, status: 'Active' },
  { id: '3', name: 'Metformin 850mg', genericName: 'Metformin HCl', category: 'Antidiabetic', unit: 'Tablet', stock: 950, reorderLevel: 300, status: 'Active' },
  { id: '4', name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'Analgesic', unit: 'Tablet', stock: 1200, reorderLevel: 400, status: 'Active' },
  { id: '5', name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'Antacid', unit: 'Capsule', stock: 50, reorderLevel: 100, status: 'Active' },
  { id: '6', name: 'Atorvastatin 10mg', genericName: 'Atorvastatin', category: 'Lipid-lowering', unit: 'Tablet', stock: 400, reorderLevel: 150, status: 'Active' },
  { id: '7', name: 'Amlodipine 5mg', genericName: 'Amlodipine', category: 'Antihypertensive', unit: 'Tablet', stock: 800, reorderLevel: 250, status: 'Active' },
  { id: '8', name: 'Cetirizine 10mg', genericName: 'Cetirizine', category: 'Antihistamine', unit: 'Tablet', stock: 1500, reorderLevel: 300, status: 'Active' },
  { id: '9', name: 'Azithromycin 500mg', genericName: 'Azithromycin', category: 'Antibiotic', unit: 'Tablet', stock: 350, reorderLevel: 200, status: 'Active' },
  { id: '10', name: 'Salbutamol Inhaler', genericName: 'Albuterol', category: 'Bronchodilator', unit: 'Inhaler', stock: 120, reorderLevel: 50, status: 'Active' },
];

export const mockSales = [
  { id: 'INV-001', customer: 'Ahmed Khan', amount: 1250, time: '10:30 AM', status: 'completed' },
  { id: 'INV-002', customer: 'Sara Ali', amount: 890, time: '11:15 AM', status: 'completed' },
  { id: 'INV-003', customer: 'John Doe', amount: 340, time: '12:05 PM', status: 'completed' },
  { id: 'INV-004', customer: 'Emily Chen', amount: 2100, time: '01:45 PM', status: 'pending' },
  { id: 'INV-005', customer: 'Michael Ross', amount: 150, time: '02:30 PM', status: 'cancelled' },
];

export const mockRevenueData = [
  { date: 'May 1', revenue: 32000 },
  { date: 'May 2', revenue: 28500 },
  { date: 'May 3', revenue: 35000 },
  { date: 'May 4', revenue: 41000 },
  { date: 'May 5', revenue: 39500 },
  { date: 'May 6', revenue: 42000 },
  { date: 'May 7', revenue: 45230 },
];

export const mockTopSelling = [
  { name: 'Paracetamol', sales: 1240 },
  { name: 'Amoxicillin', sales: 850 },
  { name: 'Metformin', sales: 620 },
  { name: 'Ibuprofen', sales: 590 },
  { name: 'Omeprazole', sales: 410 },
];
