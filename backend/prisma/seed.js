const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;
const DEFAULT_PASSWORD = 'Transit@123';

const seedUsers = [
  { name: 'Alex Morgan',  email: 'fleet@transitops.com',      role: 'FLEET_MANAGER' },
  { name: 'Jordan Lee',   email: 'dispatcher@transitops.com', role: 'DISPATCHER' },
  { name: 'Casey Rivera', email: 'safety@transitops.com',     role: 'SAFETY_OFFICER' },
  { name: 'Taylor Kim',   email: 'finance@transitops.com',    role: 'FINANCIAL_ANALYST' },
];

const seedVehicles = [
  { registrationNumber: 'TRN-001-AA', vehicleName: 'Mercedes Sprinter 315',  vehicleType: 'VAN',      maxLoadCapacity: 1500, odometer: 42300, acquisitionCost: 48000, status: 'AVAILABLE' },
  { registrationNumber: 'TRN-002-AB', vehicleName: 'Volvo FH 500',           vehicleType: 'TRUCK',    maxLoadCapacity: 20000, odometer: 187400, acquisitionCost: 145000, status: 'ON_TRIP' },
  { registrationNumber: 'TRN-003-AC', vehicleName: 'Toyota Hiace Commuter',  vehicleType: 'MINIBUS',  maxLoadCapacity: 1200, odometer: 63200, acquisitionCost: 42000, status: 'AVAILABLE' },
  { registrationNumber: 'TRN-004-AD', vehicleName: 'Scania R 450',           vehicleType: 'TRUCK',    maxLoadCapacity: 25000, odometer: 312500, acquisitionCost: 178000, status: 'IN_SHOP' },
  { registrationNumber: 'TRN-005-AE', vehicleName: 'MAN Lion\'s Coach',      vehicleType: 'BUS',      maxLoadCapacity: 8000, odometer: 94700, acquisitionCost: 215000, status: 'AVAILABLE' },
  { registrationNumber: 'TRN-006-AF', vehicleName: 'Ford Transit Custom',    vehicleType: 'VAN',      maxLoadCapacity: 1000, odometer: 28900, acquisitionCost: 38500, status: 'ON_TRIP' },
  { registrationNumber: 'TRN-007-AG', vehicleName: 'Renault Trafic',         vehicleType: 'VAN',      maxLoadCapacity: 900, odometer: 55600, acquisitionCost: 35000, status: 'AVAILABLE' },
  { registrationNumber: 'TRN-008-AH', vehicleName: 'Iveco Daily 35S',        vehicleType: 'TRUCK',    maxLoadCapacity: 3500, odometer: 78200, acquisitionCost: 62000, status: 'AVAILABLE' },
  { registrationNumber: 'TRN-009-AI', vehicleName: 'Volkswagen Crafter',     vehicleType: 'VAN',      maxLoadCapacity: 1400, odometer: 211000, acquisitionCost: 44000, status: 'RETIRED' },
  { registrationNumber: 'TRN-010-AJ', vehicleName: 'Mitsubishi Rosa',        vehicleType: 'MINIBUS',  maxLoadCapacity: 2000, odometer: 149800, acquisitionCost: 68000, status: 'AVAILABLE' },
];

const seedDrivers = [
  { fullName: 'James Cooper',    licenseNumber: 'DL-10001', licenseCategory: 'EC', licenseExpiry: new Date('2026-08-15'), contactNumber: '+27-83-001-0001', safetyScore: 95, status: 'AVAILABLE' },
  { fullName: 'Sarah Mitchell',  licenseNumber: 'DL-10002', licenseCategory: 'D',  licenseExpiry: new Date('2025-11-30'), contactNumber: '+27-83-001-0002', safetyScore: 88, status: 'ON_TRIP' },
  { fullName: 'Robert Nkosi',    licenseNumber: 'DL-10003', licenseCategory: 'C',  licenseExpiry: new Date('2027-03-20'), contactNumber: '+27-83-001-0003', safetyScore: 72, status: 'AVAILABLE' },
  { fullName: 'Lisa van der Berg',licenseNumber: 'DL-10004', licenseCategory: 'EB', licenseExpiry: new Date('2026-05-10'), contactNumber: '+27-83-001-0004', safetyScore: 91, status: 'OFF_DUTY' },
  { fullName: 'Michael Dlamini', licenseNumber: 'DL-10005', licenseCategory: 'EC', licenseExpiry: new Date('2025-09-01'), contactNumber: '+27-83-001-0005', safetyScore: 55, status: 'SUSPENDED' },
  { fullName: 'Priya Naidoo',    licenseNumber: 'DL-10006', licenseCategory: 'D',  licenseExpiry: new Date('2028-01-25'), contactNumber: '+27-83-001-0006', safetyScore: 98, status: 'AVAILABLE' },
  { fullName: 'Thomas Mahlangu', licenseNumber: 'DL-10007', licenseCategory: 'C',  licenseExpiry: new Date('2026-12-31'), contactNumber: '+27-83-001-0007', safetyScore: 83, status: 'ON_TRIP' },
  { fullName: 'Anna Botha',      licenseNumber: 'DL-10008', licenseCategory: 'EB', licenseExpiry: new Date('2027-07-14'), contactNumber: '+27-83-001-0008', safetyScore: 76, status: 'AVAILABLE' },
  { fullName: 'David Khumalo',   licenseNumber: 'DL-10009', licenseCategory: 'EC', licenseExpiry: new Date('2026-04-18'), contactNumber: '+27-83-001-0009', safetyScore: 62, status: 'AVAILABLE' },
  { fullName: 'Grace Mokoena',   licenseNumber: 'DL-10010', licenseCategory: 'D',  licenseExpiry: new Date('2025-10-05'), contactNumber: '+27-83-001-0010', safetyScore: 89, status: 'OFF_DUTY' },
  { fullName: 'Brian Steyn',     licenseNumber: 'DL-10011', licenseCategory: 'C',  licenseExpiry: new Date('2027-11-22'), contactNumber: '+27-83-001-0011', safetyScore: 94, status: 'AVAILABLE' },
  { fullName: 'Fatima Patel',    licenseNumber: 'DL-10012', licenseCategory: 'B',  licenseExpiry: new Date('2028-06-30'), contactNumber: '+27-83-001-0012', safetyScore: 100, status: 'ON_TRIP' },
  { fullName: 'Samuel Molefe',   licenseNumber: 'DL-10013', licenseCategory: 'EC', licenseExpiry: new Date('2026-02-28'), contactNumber: '+27-83-001-0013', safetyScore: 47, status: 'SUSPENDED' },
  { fullName: 'Natalie Joubert', licenseNumber: 'DL-10014', licenseCategory: 'D',  licenseExpiry: new Date('2027-09-12'), contactNumber: '+27-83-001-0014', safetyScore: 81, status: 'AVAILABLE' },
  { fullName: 'Kevin Sithole',   licenseNumber: 'DL-10015', licenseCategory: 'C',  licenseExpiry: new Date('2026-06-01'), contactNumber: '+27-83-001-0015', safetyScore: 79, status: 'AVAILABLE' },
];

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  for (const userData of seedUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: { ...userData, password: hashedPassword, isActive: true },
    });
    console.log(`✅ User: ${user.name} (${user.role})`);
  }

  for (const vehicle of seedVehicles) {
    const v = await prisma.vehicle.upsert({
      where: { registrationNumber: vehicle.registrationNumber },
      update: {},
      create: vehicle,
    });
    console.log(`🚛 Vehicle: ${v.vehicleName} [${v.registrationNumber}]`);
  }

  for (const driver of seedDrivers) {
    const d = await prisma.driver.upsert({
      where: { licenseNumber: driver.licenseNumber },
      update: {},
      create: driver,
    });
    console.log(`👤 Driver: ${d.fullName} [${d.licenseNumber}]`);
  }

  console.log('✨ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
