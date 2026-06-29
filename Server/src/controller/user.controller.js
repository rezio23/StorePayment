const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('dotenv').config();
const scheduler = require('node-schedule');
const connection = require('../config/db');
const Users = require('../models/users');
const {TelegramBot} = require('node-telegram-bot-api');

// KEY
const BotToken = process.env.TELEGRAM_BOT_TOKEN;
const ChatID = process.env.TELEGRAM_CHAT_ID;

// Telegram Bot
const bot = new TelegramBot(BotToken, { polling: false });

// CREATE
const CreateUser = async (req, res) => {
    try {
        const { UserName, Email, Password } = req.body;

        // Validation
        if(!UserName || !Email || !Password ) return res.status(400).json({ message: 'All Field Required!'});

        // Check if email existed
        // const existedUser = await Users.findOne({ where: Email });
        // if(existedUser) return res.status(400).json({ message: 'This email is already existed!'})

        // Hash password
        const HashedPassword = await bcrypt.hash(Password, 10);

        // Push to database
        const NewUser = await Users.create({ UserName, Email, Password: HashedPassword });

        // Telegram alert message
        const message = `
        A new user has been created!
        UserName: ${NewUser.UserName}
        Email: ${NewUser.Email}
        `;
        
        try {
            await bot.sendMessage(ChatID, message);
        } catch (error) {
            console.error(error);
        }

        res.status(201).json({ 
            success: true, 
            data: {
                UserName,
                Email
            }
        });


    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error!',
            error: error.message
        })
    }
}

// LOGIN
const LoginUser = async (req, res) => {
    try {
        const { Email, Password } = req.body;

        const SelectedUser = await Users.findOne({
            where: { Email }
        });

        // Check if existed
        if(!SelectedUser) return res.status(400).json({ message: 'User Not Found!'});

        // Compare password
        const IsCorrectPassword = await bcrypt.compare(Password, SelectedUser.Password);
        if(!IsCorrectPassword) return res.status(401).json({ message: 'Invalid Credential!'});

        // JWT
        const Token = jwt.sign(
            {
                ID: SelectedUser.UserID,
                Email: SelectedUser.Email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        )

        res.status(200).json({
            success: true,
            message: 'Login Successfully!',
            Token,
            SelectedUser: {
                UserName: SelectedUser.UserName,
                Email: SelectedUser.Email
            }
        })

    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error!',
            error: error.message
        })
    }
}

// SELECT
const SelectUser = async (req, res) => {
    try {
        const id = req.user.ID;
        
        const SelectedUser = await Users.findOne({ 
            where: { UserID: id }
        });

        // Selected Result
        const { UserName, Email, Password }= SelectedUser;
        
        res.status(201).json({
            success: true,
            data: {
                UserName,
                Email,
                Password,
            }
        })

    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error!',
            error: error.message
        })
    }
}

// UPDATE
const UpdateUser = async (req, res) => {
    try {
        const { UserID, UserName, Email, Password } = req.body;

        // Check If Existed
        const SelectedUser = await Users.findOne({
            where: { UserID }
        })

        // Find User
        if(!UserID) return res.status(404).json({ message: 'User Not Found!'});

        // Update Provided Field
        if(UserName) SelectedUser.UserName = UserName;
        if(Email) SelectedUser.Email = Email;
        if(Password) SelectedUser.Password = await bcrypt.hash(Password, 10);

        // Update DB
        await SelectedUser.save();

        res.status(200).json({
            success: true,
            message: 'Updated User!',
            data: {
                UserName: SelectedUser.UserName,
                Email: SelectedUser.Email,
            }
        })

    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error!',
            error: error.message
        })
    }
}

// DELETE
const DeleteUser = async (req, res) => {
    try {
        const { UserID } = req.body;
        
        const SelectedUser = await Users.findOne({
            where: { UserID }
        })

        if(!SelectedUser) return res.status(404).json({ message: 'User Not Found!' });

        // Remove
        await SelectedUser.destroy();

        res.status(200).json({
            success: true,
            message: 'User Deleted!'
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error!',
            error: error.message
        })
    }
}

module.exports = {
    CreateUser, LoginUser, SelectUser, UpdateUser, DeleteUser
}