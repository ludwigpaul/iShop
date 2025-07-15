import {DataTypes} from 'sequelize';

export default (sequelize, DataTypes) => {
    return sequelize.define('Categories', {
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
    }, {
        tableName: 'Categories',
        timestamps: false
    })
}