const { DataTypes } = require('sequelize');
const connection = require('../config/db');

const Cart = connection.define(
    'Cart',
    {
        CartID: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            allowNull: true
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
            defaultValue: 1,
            validate: {
                min: 1
            }
        },
        Total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    },
    {
        tableName: 'p_cart',
        timestamps: true,
        hooks: {
            beforeCreate: async (cart) => {
                const lastCart = await Cart.findOne({
                    order: [['CartID', 'DESC']]
                });

                if (!lastCart) {
                    cart.CartID = 'C001';
                } else {
                    const lastNumber = parseInt(lastCart.CartID.slice(1), 10);
                    cart.CartID = `C${String(lastNumber + 1).padStart(3, '0')}`;
                }
            }
        }
    }
);

module.exports = Cart;