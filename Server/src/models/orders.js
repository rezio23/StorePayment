const { DataTypes } = require('sequelize');
const connection = require('../config/db');

const Orders = connection.define(
    'Orders',
    {
        OrdID: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            allowNull: false
        },
        UserID: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        ProID: {
            type: DataTypes.STRING(10),
            allowNull: false
        }
    },
    {
        tableName: 'p_orders',
        timestamps: true
    }
);

module.exports = Orders;