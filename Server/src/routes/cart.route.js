const ValidateToken = require('../middleware/middleware');
const { AddCart, GetCart, UpdateCart, DeleteCart } = require('../controller/cart.controller');


const CartController = app => {
    app.post('/user/cart', ValidateToken(), AddCart);
    app.get('/user/cart', ValidateToken(), GetCart);
    app.put('/user/cart/update', ValidateToken(), UpdateCart);
    app.delete('/user/cart/delete', ValidateToken(), DeleteCart);
}

module.exports = CartController;