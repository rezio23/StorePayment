const jwt = require('jsonwebtoken');
const env = require('dotenv').config();

const BEARER_TOKEN = process.env.JWT_SECRET;

const ValidateToken = () => {
    return (req, res, next) => {
        const authorization = req.header('Authorization');
        let logged_token = null; // This is changeable

        if(authorization != null && authorization != ''){
            logged_token = authorization.split(' '); // Split by space
            logged_token = logged_token[1];
        }

        if(logged_token == null){
            return res.status(401).send({
                message: 'Unauthorized!'
            })
        }else{
            jwt.verify(logged_token, BEARER_TOKEN, (err, result) => {
                if(err){
                    return res.status(401).send({
                        message: 'Unauthorized!',
                        error: err
                    })
                }else{
                    req.user = result; // We can put whatever for user
                    next();
                }
            })
        }
    }
}

module.exports = ValidateToken;