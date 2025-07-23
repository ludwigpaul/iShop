import {DataTypes} from 'sequelize';

export default (sequelize, DataTypes) => {
    return sequelize.define('Users', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'updated_at'
        },
        role: {
            type: DataTypes.ENUM('ADMIN', 'USER', 'WORKER'),
            defaultValue: 'USER'
        },
        verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        verificationToken: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'verificationToken'
        },
        verificationExpiry: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'verification_expiry'
        },
        verificationDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'verification_date'
        }
    }, {
        tableName: 'Users',
        timestamps: true
    });
}