const { DataTypes } = require('sequelize');
const connection = require('../config/db');

const Payments = connection.define(
    'Payments',
    {
        PayID: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            allowNull: false
        },
        OrdID: {
            type: DataTypes.STRING(20),
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
        timestamps: true,
        hooks: {
            beforeCreate: async (payment) => {
                const lastPayment = await Payments.findOne({
                    order: [['PayID', 'DESC']]
                });

                if (!lastPayment) {
                    payment.PayID = 'PAY001';
                } else {
                    const lastNumber = parseInt(lastPayment.PayID.slice(3), 10);
                    payment.PayID = `PAY${String(lastNumber + 1).padStart(3, '0')}`;
                }
            }
        }
    }
);

module.exports = Payments;