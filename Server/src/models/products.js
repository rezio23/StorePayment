const { DataTypes } = require('sequelize');
const connection = require('../config/db');

const Products = connection.define(
    'Products',
    {
        ProID: {
            type: DataTypes.STRING(10),
            primaryKey: true,
            allowNull: false,
        },
        ProName: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        Qty: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0
            }
        },
        Price: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false,
            validate: {
                min: 0
            }
        },
        ImageURL: {
            type: DataTypes.STRING(500),
            allowNull: true,
            validate: {
                isUrl: true
            }
        },
        Description: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        tableName: 'p_products',
        timestamps: true,
        hooks: {
            beforeCreate: async (products) => {
                const lastProduct = await Products.findOne({
                    order: [["ProID", "DESC"]]
                });

                if (!lastProduct) {
                    products.ProID = "P001";
                } else {
                    const lastNumber = parseInt(lastProduct.ProID.slice(1), 10);
                    products.ProID = `P${String(lastNumber + 1).padStart(3, "0")}`;
                }
            }
        }
    }
);

module.exports = Products;