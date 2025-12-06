module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
        productId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        companyId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Companies',
                key: 'companyId',
            },
            onDelete: 'CASCADE',
        },
        productName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        policyType: {
            type: DataTypes.ENUM('crop', 'livestock', 'fisherman', 'health', 'accident', 'weather'),
            allowNull: false,
        },
        coverageType: {
            type: DataTypes.ENUM('flood', 'drought', 'cyclone', 'hailstorm', 'temperature', 'windspeed'),
            allowNull: false,
        },
        sumInsuredMin: {
            type: DataTypes.DECIMAL(20, 2),
            allowNull: false,
            validate: {
                min: 0,
            },
        },
        sumInsuredMax: {
            type: DataTypes.DECIMAL(20, 2),
            allowNull: false,
            validate: {
                min: 0,
            },
        },
        premiumRateFormula: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'sumInsured * 0.05', // 5% of sum insured
        },
        baseRate: {
            type: DataTypes.DECIMAL(5, 2), // Percentage
            allowNull: false,
            defaultValue: 5.0,
        },
        duration: {
            type: DataTypes.INTEGER, // in days
            allowNull: false,
            validate: {
                min: 1,
            },
        },
        eligibilityCriteria: {
            type: DataTypes.JSONB,
            defaultValue: {},
        },
        oracleTriggerType: {
            type: DataTypes.ENUM('rainfall', 'temperature', 'windspeed', 'flood_level', 'drought_index'),
            allowNull: false,
        },
        triggerThreshold: {
            type: DataTypes.JSONB,
            allowNull: false,
            // Example: { "min": 100, "max": null, "unit": "mm" }
        },
        payoutFormula: {
            type: DataTypes.STRING,
            defaultValue: 'sumInsured * 1.0',
        },
        policyDocument: {
            type: DataTypes.STRING, // URL to PDF
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        maxPoliciesPerUser: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        regionsCovered: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            defaultValue: [],
        },
        // Approval workflow fields
        approvalStatus: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending',
            allowNull: false,
        },
        approvedBy: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Admins',
                key: 'adminId',
            },
        },
        approvedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        rejectionReason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        timestamps: true,
        indexes: [
            {
                fields: ['companyId'],
            },
            {
                fields: ['policyType'],
            },
            {
                fields: ['isActive'],
            },
        ],
    });

    Product.associate = (models) => {
        Product.belongsTo(models.Company, {
            foreignKey: 'companyId',
            as: 'company',
        });
        Product.hasMany(models.Policy, {
            foreignKey: 'productId',
            as: 'policies',
        });
    };

    return Product;
};
