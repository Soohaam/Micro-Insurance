module.exports = (sequelize, DataTypes) => {
    const Policy = sequelize.define('Policy', {
        policyId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'userId',
            },
            onDelete: 'CASCADE',
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
        productId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Products',
                key: 'productId',
            },
            onDelete: 'CASCADE',
        },
        policyNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        policyType: {
            type: DataTypes.ENUM('drought', 'flood', 'hailstorm', 'cyclone', 'livestock', 'health'),
            allowNull: false,
        },
        sumInsured: {
            type: DataTypes.DECIMAL(20, 2),
            allowNull: false,
            validate: {
                min: 0,
            },
        },
        premiumAmount: {
            type: DataTypes.DECIMAL(20, 2),
            allowNull: false,
            validate: {
                min: 0,
            },
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        location: {
            type: DataTypes.JSONB,
            allowNull: false,
            // { lat: number, lng: number, district: string }
        },
        oracleJobId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        oracleStatus: {
            type: DataTypes.ENUM('pending', 'triggered', 'no-event', 'expired'),
            defaultValue: 'pending',
        },
        claimStatus: {
            type: DataTypes.ENUM('none', 'eligible', 'processing', 'paid', 'failed'),
            defaultValue: 'none',
        },
        contractAddress: {
            type: DataTypes.STRING,
            allowNull: true, // Will be set after blockchain deployment
        },
        transactionHash: {
            type: DataTypes.STRING,
            allowNull: true, // Will be set after purchase transaction
        },
        nftTokenId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('active', 'expired', 'claimed', 'cancelled'),
            defaultValue: 'active',
        },
    }, {
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['policyNumber'],
            },
            {
                fields: ['userId'],
            },
            {
                fields: ['companyId'],
            },
            {
                fields: ['productId'],
            },
            {
                fields: ['status'],
            },
        ],
    });

    Policy.associate = (models) => {
        Policy.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });
        Policy.belongsTo(models.Company, {
            foreignKey: 'companyId',
            as: 'company',
        });
        Policy.belongsTo(models.Product, {
            foreignKey: 'productId',
            as: 'product',
        });
        Policy.hasMany(models.Claim, {
            foreignKey: 'policyId',
            as: 'claims',
        });
    };

    return Policy;
};
