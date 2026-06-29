const { CheckOutSession, SuccessPayment, CancelPayment } = require('../controller/payment.controller');
const ValidateToken = require('../middleware/middleware');

const PaymentController = app => {
    app.post('/user/payment/checkout', ValidateToken(), CheckOutSession);
    app.get('/user/payment/success', SuccessPayment);
    app.get('/user/payment/cancel', CancelPayment);
}

module.exports = PaymentController;