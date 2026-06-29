const Stripe = require('stripe');
require('dotenv').config();
const Cart = require('../models/carts');
const Users = require('../models/users')
const Products = require('../models/products');
const {TelegramBot} = require('node-telegram-bot-api');
const { where } = require('sequelize');

// KEY
const BotToken = process.env.TELEGRAM_BOT_TOKEN;
const ChatID = process.env.TELEGRAM_CHAT_ID;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const CheckOutSession = async (req, res) => {
    try {
        const { UserID } = req.body;

        // Validate user input
        if (!UserID) {
            return res.status(400).json({ message: 'UserID is required!' });
        }

        // Find user's cart with product details
        const UserCart = await Cart.findAll({
            where: { UserID },
            include: [Products]
        });

        // Check if cart is empty
        if (!UserCart.length) {
            return res.status(400).json({ message: 'Cart is empty!' });
        }

        // Build Stripe line items from cart
        const line_items = UserCart.map(item => {
            const product = item.Product;
            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.ProName
                    },
                    unit_amount: Math.round(Number(product.Price) * 100) // USC to USD
                },
                quantity: item.Qty
            };
        });

        // Total
        const TotalPrice = UserCart.reduce((sum, item) => {
            return sum + Number(item.Total);
        }, 0);

        // Stripe Checkout
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items,
            success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: process.env.STRIPE_CANCEL_URL
        });

        const User = await Users.findOne({ where: { UserID}})

        // Telegram Alert Message
        const message = `
        A new order has been paid!
        UserName: ${User.UserName}
        Email: ${User.Email}
        ProductName: ${product.ProName}
        Quantity: ${item.Qty}
        `;
        
        try {
            await bot.sendMessage(ChatID, message);
        } catch (error) {
            console.error(error);
        }

        res.status(200).json({
            success: true,
            message: 'Checkout session created!',
            sessionID: session.id,
            url: session.url,
            GrandPrice: TotalPrice
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error!',
            error: error.message
        });
    }
}

const SuccessPayment = async (req, res) => {
    try {
        const { session_id } = req.query;

        if (!session_id) {
            return res.status(400).json({ message: 'Session ID is required!' });
        }

        // Retrieve session
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status !== 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Payment is not completed yet!',
                status: session.payment_status
            });
        }

        res.status(200).json({
            success: true,
            message: 'Payment successful!',
            sessionID: session.id,
            GrandPrice: session.amount_total / 100,
            customer_email: session.customer_email,
            payment_status: session.payment_status
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error!',
            error: error.message
        });
    }
}

const CancelPayment = async (req, res) => {
    try {
        res.status(200).json({
            success: false,
            message: 'Payment was cancelled by user.'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error!',
            error: error.message
        });
    }
}

module.exports = { CheckOutSession, SuccessPayment, CancelPayment };
