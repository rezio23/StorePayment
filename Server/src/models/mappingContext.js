const Users = require('./users');
const Products = require('./products');
const Cart = require('./carts');
const Orders = require('./orders');
const Payments = require('./payments');

// User -> Cart
Users.hasMany(Cart, {
    foreignKey: 'UserID'
});

Cart.belongsTo(Users, {
    foreignKey: 'UserID'
});

// Product -> Cart
Products.hasMany(Cart, {
    foreignKey: 'ProID'
});

Cart.belongsTo(Products, {
    foreignKey: 'ProID'
});

// User -> Orders
Users.hasMany(Orders, {
    foreignKey: 'UserID'
});

Orders.belongsTo(Users, {
    foreignKey: 'UserID'
});

// Product -> Orders
Products.hasMany(Orders, {
    foreignKey: 'ProID'
});

Orders.belongsTo(Products, {
    foreignKey: 'ProID'
});

// Order -> Payments
Orders.hasMany(Payments, {
    foreignKey: 'OrdID'
});

Payments.belongsTo(Orders, {
    foreignKey: 'OrdID'
});

module.exports = {
    Users,
    Products,
    Cart,
    Orders,
    Payments
};