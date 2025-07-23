import {DataTypes} from 'sequelize';
export default (sequelize, DataTypes) => {
    return sequelize.define('Orders', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'COMPLETED'),
            defaultValue: 'PENDING'
        },
        order_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        status_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        completed_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        estimated_arrival: {
            type: DataTypes.DATE,
            allowNull: true
        },
        worker_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'Orders',
        timestamps: false
    });
};