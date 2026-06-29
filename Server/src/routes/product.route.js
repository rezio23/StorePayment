const { GetAllProduct, SelectProduct } = require('../controller/product.controller');
const ValidateToken = require('../middleware/middleware');

const ProductController = (app) => {
    app.get('/product/data', ValidateToken(), GetAllProduct);
    app.get('/product/data/name', ValidateToken(), SelectProduct);
}

module.exports = ProductController;