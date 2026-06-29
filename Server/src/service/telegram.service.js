const { TelegramBot } = require('node-telegram-bot-api');

const registerBotToken = process.env.TELEGRAM_REGISTERED_MESSAGE;
const paymentBotToken = process.env.TELEGRAM_PAID_MESSAGE;
const chatId = process.env.TELEGRAM_CHAT_ID;

const registerBot = registerBotToken ? new TelegramBot(registerBotToken, { polling: false }) : null;
const paymentBot = paymentBotToken ? new TelegramBot(paymentBotToken, { polling: false }) : null;

async function sendMessage(bot, text) {
    if (!bot || !chatId) return;

    try {
        await bot.sendMessage(chatId, text);
    } catch (err) {
        console.error('Telegram alert failed:', err.message);
    }
}

async function sendNewUserAlert(user) {
    const message = `
A new user has been created!
UserName: ${user.UserName}
Email: ${user.Email}
    `.trim();

    await sendMessage(registerBot, message);
}

async function sendPaymentAlert({ order_id, user, orders, amount_total }) {
    const productLines = orders.map(order =>
        `• ${order.ProID} × ${order.Qty} = $${Number(order.Total).toFixed(2)}`
    ).join('\n');

    const message = `
A new order has been paid!
Order ID: ${order_id}
User: ${user?.UserName || 'Unknown'} (${user?.Email || 'no email'})
Total: $${(amount_total / 100).toFixed(2)}
Items:
${productLines}
    `.trim();

    await sendMessage(paymentBot, message);
}

module.exports = {
    sendNewUserAlert,
    sendPaymentAlert
};
