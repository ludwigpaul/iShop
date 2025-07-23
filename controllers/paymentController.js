import Stripe from 'stripe';

const VALID_CURRENCIES = ['usd', 'eur', 'gbp', "cad"]; // Add more as needed

export async function createPaymentIntent(req, res) {
    const { amount, currency } = req.body;
    if (!amount || !currency) {
        return res.status(400).send({ error: 'Amount and currency are required' });
    }
    if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).send({ error: 'Invalid amount' });
    }
    if (!VALID_CURRENCIES.includes(currency)) {
        return res.status(400).send({ error: 'Invalid currency' });
    }
    try {
        // Move Stripe instance creation here for testability
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            payment_method_types: ['card'],
        });
        res.send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).send({ error: error.message || 'Stripe error' });
    }
}