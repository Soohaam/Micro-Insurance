module.exports = (sequelize, DataTypes) => {
    const KYC = sequelize.define('KYC', {
        kycId: {
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
        aadhaarNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                len: [12, 12], // Aadhaar is 12 digits
            },
        },
        aadhaarName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        aadhaarImage: {
            type: DataTypes.STRING, // Cloudinary URL
            allowNull: false,
        },
        documentType: {
            type: DataTypes.ENUM('aadhaar', 'pan', 'license', 'voter_id'),
            defaultValue: 'aadhaar',
        },
        status: {
            type: DataTypes.ENUM('pending', 'verified', 'rejected'),
            defaultValue: 'pending',
        },
        rejectionReason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        verifiedBy: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Admins',
                key: 'adminId',
            },
        },
        verifiedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        metadata: {
            type: DataTypes.JSONB, // Store OCR extracted data
            defaultValue: {},
        },
    }, {
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['aadhaarNumber'],
            },
            {
                fields: ['userId'],
            },
            {
                fields: ['status'],
            },
        ],
    });

    KYC.associate = (models) => {
        KYC.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });
        KYC.belongsTo(models.Admin, {
            foreignKey: 'verifiedBy',
            as: 'verifier',
        });
    };

    return KYC;
};
