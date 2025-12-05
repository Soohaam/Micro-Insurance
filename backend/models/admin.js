module.exports = (sequelize, DataTypes) => {
    const Admin = sequelize.define('Admin', {
        adminId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        fullName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: 'admin',
        },
        permissions: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
        },
        lastLogin: {
            type: DataTypes.DATE,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }, {
        timestamps: true,
    });

    return Admin;
};
