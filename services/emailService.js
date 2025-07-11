import nodemailer from "nodemailer";
import dotenv from 'dotenv';

dotenv.config();
import logger from "../logger/logger.js";


// Create transporter once at startup
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100
});

logger.info(`Created transporter for email service with host: ${process.env.EMAIL_HOST}, port: ${process.env.EMAIL_PORT}`);

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        logger.error('SMTP connection error:', error);
    } else {
        logger.info('Server is ready to take our messages');
    }
});


export const sendEmail = async (email, verificationToken) => {

    try {
        // Send email

        const link = `http://localhost:3000/api/v1/users/verify-email?token=${verificationToken}`;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify your email',
            html: `<a href="${link}">Click to verify your email</a>`
        });
        logger.info(`Email sent successfully to ${email}. This is inside the sendEmail function.`);
    } catch (error) {
        logger.error(`Error sending email to ${email}: ${error.message}`);
        throw new Error(`Failed to send email: ${error.message}`);
    }
}