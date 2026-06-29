const Stripe = require('stripe');
require('dotenv').config();
const connection = require('../config/db');
const Cart = require('../models/carts');
const Users = require('../models/users');
const Products = require('../models/products');
const Orders = require('../models/orders');
const Payments = require('../models/payments');
const { TelegramBot } = require('node-telegram-bot-api');
const { where } = require('sequelize');

// Telegram config
const BotToken = process.env.TELEGRAM_BOT_TOKEN;
const ChatID = process.env.TELEGRAM_CHAT_ID;
const bot = BotToken ? new TelegramBot(BotToken, { polling: false }) : null;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const CheckOutSession = async (req, res) => {
    const transaction = await connection.transaction();

    try {
        const UserID = req.user.ID;

        if (!UserID) {
            await transaction.rollback();
            return res.status(400).json({ message: 'UserID is required!' });
        }

        // Find user's cart with product details
        const UserCart = await Cart.findAll({
            where: { UserID },
            include: [Products],
            transaction
        });

        if (!UserCart.length) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Cart is empty!' });
        }

        let GrandTotal = 0;

        // Validate stock and build Stripe line items
        const line_items = UserCart.map(item => {
            const product = item.Product;
            const price = Number(product.Price);
            const qty = Number(item.Qty);
            const total = price * qty;

            if (qty > product.Qty) {
                throw new Error(`Not enough stock for ${product.ProName}. Available: ${product.Qty}, requested: ${qty}`);
            }

            GrandTotal += total;

            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.ProName,
                        images: product.ImageURL ? [product.ImageURL] : []
                    },
                    unit_amount: Math.round(price * 100)
                },
                quantity: qty
            };
        });

        // Create order rows from cart
        const orderRows = [];
        for (const item of UserCart) {
            const product = item.Product;
            const order = await Orders.create({
                UserID,
                ProID: product.ProID,
                Qty: item.Qty,
                Total: Number(product.Price) * Number(item.Qty),
                Status: 'Pending'
            }, { transaction });

            orderRows.push(order);
        }

        const primaryOrderID = orderRows[0].id;

        // Create a pending payment record
        const payment = await Payments.create({
            OrdID: primaryOrderID,
            Amount: GrandTotal,
            Method: 'Visa',
            Status: 'Pending'
        }, { transaction });

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items,
            success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.STRIPE_CANCEL_URL}?order_id=${primaryOrderID}`,
            metadata: {
                user_id: UserID,
                order_id: primaryOrderID,
                payment_id: payment.id
            }
        });

        // Save the Stripe session ID on the payment record
        payment.TransactionID = session.id;
        await payment.save({ transaction });

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Checkout session created!',
            sessionID: session.id,
            url: session.url,
            orderID: primaryOrderID,
            paymentID: payment.id,
            GrandPrice: GrandTotal
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Checkout error:', error);

        res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error!',
            error: error.message
        });
    }
};

const SuccessPayment = async (req, res) => {
    const transaction = await connection.transaction();

    try {
        const { session_id } = req.query;

        if (!session_id) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Session ID is required!' });
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status !== 'paid') {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Payment is not completed yet!',
                status: session.payment_status
            });
        }

        const { order_id, payment_id, user_id } = session.metadata || {};

        if (order_id && payment_id) {
            const payment = await Payments.findByPk(payment_id, { transaction });
            const alreadyPaid = payment?.Status === 'Paid';

            if (payment) {
                payment.Status = 'Paid';
                payment.TransactionID = session.id;
                await payment.save({ transaction });
            }

            // Update all orders that share this order group
            await Orders.update(
                { Status: 'Paid' },
                { where: { id: order_id }, transaction }
            );

            // Decrement stock for each product in the order
            const orders = await Orders.findAll({
                where: { id: order_id },
                transaction
            });

            for (const order of orders) {
                const product = await Products.findByPk(order.ProID, { transaction });
                if (product) {
                    product.Qty = Math.max(0, product.Qty - order.Qty);
                    await product.save({ transaction });
                }
            }

            // Clear the user's cart
            if (user_id) {
                await Cart.destroy({ where: { UserID: user_id }, transaction });
            }

            // Telegram Alert - only after first confirmed payment
            if (bot && ChatID && !alreadyPaid) {
                try {
                    const user = await Users.findByPk(user_id, { transaction });
                    const productLines = orders.map(order =>
                        `• ${order.ProID} × ${order.Qty} = $${Number(order.Total).toFixed(2)}`
                    ).join('\n');

                    const message = `
A new order has been paid!
Order ID: ${order_id}
User: ${user?.UserName || 'Unknown'} (${user?.Email || 'no email'})
Total: $${(session.amount_total / 100).toFixed(2)}
Items:
${productLines}
                    `.trim();

                    await bot.sendMessage(ChatID, message);
                } catch (err) {
                    console.error('Telegram alert failed:', err.message);
                }
            }
        }

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Payment successful!',
            sessionID: session.id,
            GrandPrice: session.amount_total / 100,
            customer_email: session.customer_email,
            payment_status: session.payment_status,
            orderID: order_id
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Success payment error:', error);

        res.status(500).json({
            success: false,
            message: 'Internal Server Error!',
            error: error.message
        });
    }
};

const CancelPayment = async (req, res) => {
    try {
        const { order_id } = req.query;

        if (order_id) {
            await Orders.update(
                { Status: 'Cancelled' },
                { where: { id: order_id } }
            );

            await Payments.update(
                { Status: 'Failed' },
                { where: { OrdID: order_id } }
            );
        }

        res.status(200).json({
            success: false,
            message: 'Payment was cancelled by user.'
        });
    } catch (error) {
        console.error('Cancel payment error:', error);

        res.status(500).json({
            message: 'Internal Server Error!',
            error: error.message
        });
    }
};

module.exports = { CheckOutSession, SuccessPayment, CancelPayment };
