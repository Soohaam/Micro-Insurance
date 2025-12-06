module.exports = (sequelize, DataTypes) => {
    const Claim = sequelize.define('Claim', {
        claimId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        policyId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Policies',
                key: 'policyId',
            },
            onDelete: 'CASCADE',
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
        eventType: {
            type: DataTypes.ENUM('drought', 'flood', 'cyclone', 'hailstorm', 'temperature', 'windspeed'),
            allowNull: false,
        },
        oracleData: {
            type: DataTypes.JSONB,
            allowNull: false,
            // Raw oracle response data for audit
        },
        triggerCondition: {
            type: DataTypes.STRING,
            allowNull: false,
            // e.g., "rainfall < 100mm"
        },
        claimAmount: {
            type: DataTypes.DECIMAL(20, 2),
            allowNull: false,
            validate: {
                min: 0,
            },
        },
        claimStatus: {
            type: DataTypes.ENUM('initiated', 'approved', 'rejected', 'paid', 'failed'),
            defaultValue: 'initiated',
        },
        transactionHash: {
            type: DataTypes.STRING,
            allowNull: true, // Set when payout is made
        },
        payoutDate: {
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
                fields: ['policyId'],
            },
            {
                fields: ['userId'],
            },
            {
                fields: ['claimStatus'],
            },
        ],
    });

    Claim.associate = (models) => {
        Claim.belongsTo(models.Policy, {
            foreignKey: 'policyId',
            as: 'policy',
        });
        Claim.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });
    };

    return Claim;
};
