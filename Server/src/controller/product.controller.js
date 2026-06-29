const connection = require('../config/db');
const Products = require('../models/products');

// Display All Product
const GetAllProduct = async (req, res) => {
    try {
        const AllProducts = await Products.findAll();
    
        res.status(200).json({
            message: 'Products Retrieved!',
            data: AllProducts
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        })
    }
}

// Select Product
const SelectProduct = async (req, res) => {
    const { ProductName } = req.body;

    try {

        if(!ProductName) return res.status(404).json({ message: 'Product not found!'});

        const SelectedProduct = await Products.findOne({
            where: { ProName: ProductName }
        })

        res.status(200).json({
            message: 'Products Retrieved!',
            data: {
                ProductName: SelectedProduct.ProductName,
                Qty: SelectedProduct.Qty,
                Price: SelectedProduct.Price
            }
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        })
    }
}

module.exports = {
    GetAllProduct, SelectProduct
}