module.exports = (sequelize, DataTypes) => {
    const Company = sequelize.define('Company', {
        companyId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        companyName: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        companyEmail: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        companyPhone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        registrationNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        walletAddress: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'blocked', 'suspended'),
            defaultValue: 'pending',
        },
        documents: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true, // Can be uploaded later or during registration
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: 'company',
        },
        poolBalance: {
            type: DataTypes.DECIMAL(20, 2), // Precision for financial data
            defaultValue: 0,
        },
        totalPremiumsCollected: {
            type: DataTypes.DECIMAL(20, 2),
            defaultValue: 0,
        },
        totalPayoutsMade: {
            type: DataTypes.DECIMAL(20, 2),
            defaultValue: 0,
        },
    }, {
        timestamps: true,
    });

    Company.associate = (models) => {
        Company.hasMany(models.Product, {
            foreignKey: 'companyId',
            as: 'products',
        });
        Company.hasMany(models.Policy, {
            foreignKey: 'companyId',
            as: 'policies',
        });
    };

    return Company;
};

