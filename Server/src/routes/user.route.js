const { CreateUser, LoginUser, SelectUser, UpdateUser, DeleteUser } = require('../controller/user.controller');
const ValidateToken = require('../middleware/middleware');

const UserController = app => {
    app.post('/user/create', CreateUser);
    app.get('/user/data', ValidateToken(), SelectUser);
    app.post('/user/login', LoginUser);
    app.put('/user/update', ValidateToken(), UpdateUser);
    app.delete('/user/delete', ValidateToken(), DeleteUser);
}

module.exports = UserController;