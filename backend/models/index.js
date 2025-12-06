const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./user')(sequelize, Sequelize);
db.Company = require('./company')(sequelize, Sequelize);
db.Admin = require('./admin')(sequelize, Sequelize);
db.KYC = require('./kyc')(sequelize, Sequelize);
db.Product = require('./product')(sequelize, Sequelize);
db.Policy = require('./policy')(sequelize, Sequelize);
db.Claim = require('./claim')(sequelize, Sequelize);

// Set up associations
Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

module.exports = db;
