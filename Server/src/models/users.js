const { DataTypes } = require('sequelize');
const connection = require('../config/db');

const Users = connection.define(
    'Users',
    {
        UserID: {
            type: DataTypes.STRING(10),
            primaryKey: true,
            allowNull: true
        },
        UserName: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        Email: {
            type: DataTypes.STRING(200),
            unique: true,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        Password: {
            type: DataTypes.STRING(150),
            allowNull: false
        }
    },
    {
        tableName: 'p_users',
        timestamps: true,
        hooks: {
            beforeCreate: async (user) => {
                const lastUser = await Users.findOne({
                    order: [["UserID", "DESC"]]
                });

                if (!lastUser) {
                    user.UserID = "U001";
                } else {
                    const lastNumber = parseInt(lastUser.UserID.slice(1), 10);
                    user.UserID = `U${String(lastNumber + 1).padStart(3, "0")}`;
                }
            }
        }
    }
);

module.exports = Users;