module.exports = (sequelize, DataTypes) => {
    const PurchasedProduct = sequelize.define('PurchasedProduct', {
        purchaseId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        productId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Products',
                key: 'productId',
            },
        },
        productName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        companyId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Companies',
                key: 'companyId',
            },
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'userId',
            },
        },
        userWalletAddress: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        companyWalletAddress: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        transactionHash: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        purchaseDate: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
        },
        cost: {
            type: DataTypes.DECIMAL(20, 8),
            allowNull: true,
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        coverageAmount: {
            type: DataTypes.DECIMAL(20, 2),
            allowNull: true,
        },
        policyType: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        timestamps: true,
    });

    PurchasedProduct.associate = (models) => {
        PurchasedProduct.belongsTo(models.Product, {
            foreignKey: 'productId',
            as: 'product',
        });
        PurchasedProduct.belongsTo(models.Company, {
            foreignKey: 'companyId',
            as: 'company',
        });
        PurchasedProduct.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });
    };

    return PurchasedProduct;
};
