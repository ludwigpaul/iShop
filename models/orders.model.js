import {DataTypes} from 'sequelize';

export default (sequelize, DataTypes) => {
    return sequelize.define('Orders', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Products',
                key: 'id'
            },
            field: 'product_id'
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            },
            field: 'user_id'
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'COMPLETED', 'CANCELLED'),
            defaultValue: 'PENDING'
        },
        orderDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'order_date'
        },
        statusDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'status_date'
        },
        completedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'completed_at'
        },
        estimatedArrival: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'estimated_arrival'
        },
        workerId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Workers',
                key: 'id'
            },
            field: 'worker_id'
        }
    }, {
        tableName: 'Orders',
        timestamps: false
    })
}