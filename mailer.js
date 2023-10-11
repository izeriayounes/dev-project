import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'younesizeria@gmail.com',
        pass: 'bwbefalqokziflyd'
    }
});

export const mailOptions = (token, email) => ({
    from: 'younesizeria@gmail.com',
    to: email,
    subject: 'Password Reset',
    text: `Click the following link to reset your password: localhost:3000/reset-password/${token}`
});
