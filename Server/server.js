const express = require('express');
const cors = require('cors');

const UserController = require('./src/routes/user.route');
const ProductController = require('./src/routes/product.route');
const CartController = require('./src/routes/cart.route');
const PaymentController = require('./src/routes/payment.route');

// Dependencies
const sequelize = require('./src/config/db');
const { Users, Products, Orders, Payments, Cart } = require('./src/models/mappingContext');

sequelize.sync({ alter: true }).then(console.log('Database Updated!'));

const app = express();
app.use(cors());
app.use(express.json());

UserController(app);
ProductController(app);
CartController(app);
PaymentController(app);


app.listen(3000, () => console.log('Server is listening on port 3000!'));