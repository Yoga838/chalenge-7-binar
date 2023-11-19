const { users } = require('./model');
const utils = require('./utils');
const nodemailer = require('nodemailer');

module.exports = {
    register: async (req, res) => {
        try {
            if(!req.body.email||!req.body.password){
                throw new Error('body Request is not found')
            }
            const data = await users.create({
                data: {
                    email: req.body.email,
                    password: await utils.cryptPassword(req.body.password),
                }
            })
            if(data){
                return res.status(201).json({
                    data
                });
            }
            throw new Error('error when make a new account')
            
        } catch (error) {
            throw error
            return res.status(500).json({
                error
            });
        }
    },
    resetPassword: async (req, res) => {
        try {
            if(!req.body.email){
                throw new Error('body Request is not found')
            }
            const findUser = await users.findFirst({
                where: {
                    email: req.body.email
                }
            });

            if(!findUser) {
                throw new Error('Account not registered')
                return res.render('error');
            }

            const encrypt = await utils.cryptPassword(req.body.email);

            await users.update({
                data: {
                    resetPasswordToken: encrypt,
                },
                where: {
                    id: findUser.id
                }
            });

            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });

            const mailOptions = {
                from: 'system@gmail.com',
                to : req.body.email,
                subject: "Reset Password",
                text: "Klik tombol dibawah untuk mengganti password anda   localhost:3000/set-password/${encrypt}",
                html: ` <button><a href="http://localhost:3000/set-password/${encrypt}"> Set New Password </a></button> `
                
            }

            transporter.sendMail(mailOptions, (err) => {
                if(err) {
                    console.log(err)
                    throw new Error(err)
                    return res.render('error');
                }

                return res.render('success');
            })
 
            
            
        } catch (error) {
            console.log(error)
            throw error
            return res.status(500).json({
                error
            });
        }
    },
    setPassword: async (req, res) => {
        try {
            if(!req.body.key||!req.body.password){
                throw new Error('body Request is not found')
            }
            const findUser = await users.findFirst({
                where: {
                    resetPasswordToken: req.body.key
                }
            });

            if(!findUser) {
                throw new Error('user not found')
                return res.render('error');
            }

            await users.update({
                data: {
                    password: await utils.cryptPassword(req.body.password),
                    resetPasswordToken: null
                },
                where: {
                    id: findUser.id
                }
            });

            return res.render('success');
            
        } catch (error) {
            console.log(error)
            throw error
            return res.status(500).json({
                error
            });
        }
    },
}