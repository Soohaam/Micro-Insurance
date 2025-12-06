const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const passwordHash = await bcrypt.hash('adminpassword123', 10);
    
    await queryInterface.bulkInsert('Admins', [
      {
        adminId: '00000000-0000-0000-0000-000000000001',
        fullName: 'System Administrator',
        email: 'admin@microinsurance.com',
        phone: '9999999999',
        passwordHash: passwordHash,
        role: 'admin',
        permissions: JSON.stringify(['manage_companies', 'manage_kyc', 'manage_users', 'manage_products', 'view_stats']),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Admins', {
      email: 'admin@microinsurance.com'
    }, {});
  }
};
