const Products = require('../models/products')
const Cart = require('../models/carts');
const Users = require('../models/users');


// GET CART
const GetCart = async (req, res) => {
    try {
        const { UserID } = req.body;

        const SelectedCart = await Cart.findAll({
            where: { UserID },
            include: [Users, Products]
        })

        res.status(200).json({
            success: true,
            data: SelectedCart
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error!',
            error: error.message
        })
    }
}

// CREATE
const AddCart = async (req, res) => {
    try {
        const { UserID, ProID, Qty } = req.body;

        if(!UserID || !ProID || !Qty) return res.status(400).json({ message: 'All field required!'});

        // Check if existed
        const SelectedUser = await Users.findByPk(UserID);
        const SelectedProduct = await Products.findByPk(ProID);

        // Validate
        if(!SelectedUser) return res.status(404).json({ message: 'User not found!'});
        if(!SelectedProduct) return res.status(404).json({ message: 'Product not found!'});
        if(Qty > SelectedProduct.Qty) return res.status(400).json({ message: 'Stock is not enough for this quantity!'});

        // Check if the cart was existed
        const ExistedCart = await Cart.findOne({
            where: {
                UserID,
                ProID
            }
        })

        // Update if existed
        if(ExistedCart){
            const UpdateQty = ExistedCart.Qty + Qty;

            if(UpdateQty > SelectedProduct.Qty) return res.status(400).json({ message: 'Stock is not enough for this quantity!'});

            ExistedCart.Qty = UpdateQty;
            await ExistedCart.save();

            return res.status(200).json({
                success: true,
                message: 'Updated cart successfully!',
                data: ExistedCart
            })
        }

        // Add new
        const AddNewCart = await Cart.create({
            UserID,
            ProID,
            Qty,
            Total: SelectedProduct.Price * Qty,
        })

        res.status(201).json({
            success: true,
            message: 'Product added to cart!',
            data: AddNewCart
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error!',
            error: error.message
        })
    }
}

// Update
const UpdateCart = async (req, res) => {
    try {
        const { CartID, Qty } = req.body;
        const SelectedCart = await Cart.findByPk(CartID);

        if(!SelectedCart) return res.status(404).json({ message: 'Cart not found!'})

        const SelectedProduct = await Products.findByPk(SelectedCart.ProID);

        if(Qty > SelectedProduct.Qty) return res.status(400).json({ message: 'Stock not enough!'});

        SelectedCart.Qty = Qty;
        SelectedCart.Total = SelectedProduct.Price * Qty;
        await SelectedCart.save();

        res.status(200).json({ 
            success: true,
            message: 'Updated cart successfully!',
            data: SelectedCart
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error!',
            error: error.message
        })
    }
}

// Delete
const DeleteCart = async (req, res) => {
    try {
        const { CartID } = req.body;

        const SelectedCart = await Cart.findByPk(CartID);

        if(!SelectedCart) return res.status(404).json({ message: 'Cart not found!'})

        await SelectedCart.destroy();

        res.status(200).json({
            success: true,
            message: 'Cart removed!',
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error!',
            error: error.message
        })
    }
}



module.exports = { AddCart, GetCart, UpdateCart, DeleteCart }