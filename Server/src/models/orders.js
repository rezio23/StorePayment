const { DataTypes } = require('sequelize');
const connection = require('../config/db');

const Orders = connection.define(
    'Orders',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        UserID: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        ProID: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        Qty: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1
            }
        },
        Total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0
            }
        },
        Status: {
            type: DataTypes.ENUM('Pending', 'Paid', 'Cancelled'),
            allowNull: false,
            defaultValue: 'Pending'
        }
    },
    {
        tableName: 'p_orders',
        timestamps: true
    }
);

module.exports = Orders;
