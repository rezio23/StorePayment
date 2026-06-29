const { DataTypes } = require('sequelize');
const connection = require('../config/db');

const Payments = connection.define(
    'Payments',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        OrdID: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        Amount: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false
        },
        Method: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'Visa'
        },
        Status: {
            type: DataTypes.ENUM('Pending', 'Paid', 'Failed'),
            allowNull: false,
            defaultValue: 'Pending'
        },
        TransactionID: {
            type: DataTypes.STRING(100),
            allowNull: true
        }
    },
    {
        tableName: 'p_payments',
        timestamps: true
    }
);

module.exports = Payments;
