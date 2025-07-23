import {DataTypes} from 'sequelize';

export default (sequelize, DataTypes) => {
    return sequelize.define('Products', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0
            }
        },
        stockQuantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0
            }
        },
        categoryId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Categories',
                key: 'id'
            },
            field: 'category_id'
        }
    }, {
        tableName: 'Products',
        timestamps: false
    });

}