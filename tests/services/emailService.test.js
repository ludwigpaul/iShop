import { jest } from '@jest/globals';

const mockSendMail = jest.fn();
const mockVerify = jest.fn();

jest.mock('nodemailer', () => ({
    createTransport: jest.fn(() => ({
        sendMail: mockSendMail,
        verify: mockVerify
    }))
}));

jest.mock('../../logger/logger.js', () => ({
    info: jest.fn(),
    error: jest.fn()
}));

const originalEnv = { ...process.env };

beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    mockSendMail.mockReset();
    mockVerify.mockReset();
    const logger = require('../../logger/logger.js');
    logger.info.mockReset();
    logger.error.mockReset();
});

describe('emailService', () => {
    let emailService;
    let logger;
    let nodemailer;

    // Helper to set env and reload module
    async function setupEnvAndImport(env = {}) {
        process.env.EMAIL_HOST = env.EMAIL_HOST || 'smtp.example.com';
        process.env.EMAIL_PORT = env.EMAIL_PORT || '587';
        process.env.EMAIL_USER = env.EMAIL_USER || 'testuser@example.com';
        process.env.EMAIL_PASS = env.EMAIL_PASS || 'pass';
        jest.resetModules();
        // Always set verify to call callback with success
        mockVerify.mockImplementation((cb) => cb(null, true));
        emailService = await import('../../services/emailService.js');
        logger = await import('../../logger/logger.js');
        nodemailer = await import('nodemailer');
    }

    it('should create transporter with correct config and log info', async () => {
        await setupEnvAndImport();
        expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({
            host: 'smtp.example.com',
            port: '587',
            auth: {
                user: 'testuser@example.com',
                pass: 'pass'
            },
            pool: true,
            maxConnections: 5,
            maxMessages: 100
        }));
        expect(logger.info).toHaveBeenCalledWith(
            expect.stringContaining('Created transporter for email service with host: smtp.example.com, port: 587')
        );
    });

    it('should log info when transporter.verify succeeds', async () => {
        await setupEnvAndImport();
        expect(logger.info).toHaveBeenCalledWith(
            expect.stringContaining('Server is ready to take our messages')
        );
    });

    it('should log error when transporter.verify fails', async () => {
        mockVerify.mockImplementationOnce((cb) => cb(new Error('verify fail')));
        await setupEnvAndImport();
        expect(logger.error).toHaveBeenCalledWith(
            'SMTP connection error:',
            expect.any(Error)
        );
    });

    describe('sendEmail', () => {
        it('should send email and log success', async () => {
            await setupEnvAndImport();
            mockSendMail.mockResolvedValueOnce({});
            await emailService.sendEmail('recipient@example.com', 'token123');
            expect(mockSendMail).toHaveBeenCalledWith({
                from: 'testuser@example.com',
                to: 'recipient@example.com',
                subject: 'Verify your email',
                html: expect.stringContaining('token123')
            });
            expect(logger.info).toHaveBeenCalledWith(
                expect.stringContaining('Email sent successfully to recipient@example.com')
            );
        });

        it('should log error and throw when sendMail fails', async () => {
            await setupEnvAndImport();
            mockSendMail.mockRejectedValueOnce(new Error('SMTP failed'));
            await expect(emailService.sendEmail('recipient@example.com', 'token123'))
                .rejects.toThrow('Failed to send email: SMTP failed');
            expect(logger.error).toHaveBeenCalledWith(
                expect.stringContaining('Error sending email to recipient@example.com')
            );
        });
    });
});