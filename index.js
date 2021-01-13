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

app.post('/sandbox/client-secret', async (req, res) => {
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

app.use('*', (req, res) => res.send('Not found'))

try {
  httpServer.listen(config.HTTP_PORT, async () => {
    console.log(`Listening on port ${config.HTTP_PORT}`);
  });
} catch (error) {
  console.error(`date: ${new Date()}\n`, error, '\n');
  httpServer.close();
}

