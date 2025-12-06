const db = require('../models');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await db.Admin.findOne({
      where: { email: 'admin@microinsurance.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin already exists');
      return;
    }

    // Create admin
    const passwordHash = await bcrypt.hash('adminpassword123', 10);
    
    const admin = await db.Admin.create({
      fullName: 'System Administrator',
      email: 'admin@microinsurance.com',
      phone: '9999999999',
      passwordHash: passwordHash,
      role: 'admin',
      permissions: ['manage_companies', 'manage_kyc', 'manage_users', 'manage_products', 'view_stats'],
      isActive: true,
    });

    console.log('✅ Admin created successfully');
    console.log('📧 Email: admin@microinsurance.com');
    console.log('🔑 Password: adminpassword123');
    console.log('⚠️  Please change the password after first login!');
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  }
}

// Run if called directly
if (require.main === module) {
  seedAdmin()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = seedAdmin;
