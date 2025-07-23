import {DataTypes} from 'sequelize';

export default (sequelize, DataTypes) => {
    return sequelize.define('Workers', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
    }, {
        tableName: 'Workers',
        timestamps: false
    });
}