const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const Stripe = require('stripe');
const config = require('./config');

const app = express();
const httpServer = http.createServer(app);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

const stripe = Stripe(config.stripeSk);

app.post('/api/client-secret', async (req, res) => {
  try {
    const { currency, amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card'],
    });
  
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.log(error)
  }
});

app.post('/api/subscription', async (req, res) => {
  const { priceId } = req.body;

  // See https://stripe.com/docs/api/checkout/sessions/create
  // for additional parameters to pass.
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          // For metered billing, do not pass quantity
          quantity: 1,
        },
      ],
      // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
      // the actual Session ID is returned in the query parameter when your customer
      // is redirected to the success page.
      success_url: 'https://eat-beat.hopto.org/settings/billing/success',
      cancel_url: 'https://eat-beat.hopto.org//settings/billing/error',
    });

    res.send({
      sessionId: session.id,
    });
  } catch (e) {
    res.status(400);
    return res.send({
      error: {
        message: e.message,
      }
    });
  }
})

app.use('*', (req, res) => res.send('Not found'))

try {
  httpServer.listen(config.HTTP_PORT, async () => {
    console.log(`Listening on port ${config.HTTP_PORT}`);
  });
} catch (error) {
  console.log(error);
  httpServer.close();
}

