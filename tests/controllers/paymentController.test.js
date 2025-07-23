// javascript
import * as paymentController from '../../controllers/paymentController.js';
import { jest } from '@jest/globals';
import Stripe from 'stripe';

jest.mock('stripe');

describe('paymentController', () => {
    let req, res, stripeInstance;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };
        stripeInstance = {
            paymentIntents: {
                create: jest.fn()
            }
        };
        Stripe.mockImplementation(() => stripeInstance);
        jest.clearAllMocks();
    });

    describe('createPaymentIntent', () => {
        it('should create payment intent and return clientSecret', async () => {
            req.body = { amount: 1000, currency: 'usd' };
            const mockIntent = { client_secret: 'secret123' };
            stripeInstance.paymentIntents.create.mockResolvedValue(mockIntent);

            await paymentController.createPaymentIntent(req, res);

            expect(stripeInstance.paymentIntents.create).toHaveBeenCalledWith({
                amount: 1000,
                currency: 'usd',
                payment_method_types: ['card']
            });
            expect(res.send).toHaveBeenCalledWith({ clientSecret: 'secret123' });
        });

        it('should handle Stripe error', async () => {
            req.body = { amount: 1000, currency: 'usd' };
            const error = new Error('Stripe error');
            stripeInstance.paymentIntents.create.mockRejectedValue(error);

            await paymentController.createPaymentIntent(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: 'Stripe error' });
        });

        it('should handle missing amount or currency', async () => {
            req.body = { amount: 1000 }; // Missing currency
            await paymentController.createPaymentIntent(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ error: 'Amount and currency are required' });
        });

        it('should handle invalid amount', async () => {
            req.body = { amount: -1000, currency: 'usd' }; // Invalid amount
            await paymentController.createPaymentIntent(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ error: 'Invalid amount' });
        });

        it('should handle invalid currency', async () => {
            req.body = { amount: 1000, currency: 'invalid' }; // Invalid currency
            await paymentController.createPaymentIntent(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ error: 'Invalid currency' });
        });

        it('should handle non-number amount', async () => {
            req.body = { amount: "not-a-number", currency: 'usd' };
            await paymentController.createPaymentIntent(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ error: 'Invalid amount' });
        });

    });
});