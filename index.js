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

const endpoint = await stripe.webhookEndpoints.create({
  url: 'https://stripe-example.hopto.org/api/webhook',
  enabled_events: [
    'customer.created', // event is sent, indicating that a customer record was successfully created.
    'customer.subscription.created', // event is sent, indicating the subscription was created.
    'invoice.created', // events are sent, indicating that this invoice was issued for the first billing period
    'invoice.finalized', // events are sent, indicating that this invoice was issued for the first billing period
    'payment_intent.created', //events are sent, indicating that the customer’s payment method was successfully charged.
    'payment_intent.succeeded', // events are sent, indicating that the customer’s payment method was successfully charged.
    'invoice.payment_action_required', // event is sent, indicating the invoice requires customer authentication
    'customer.subscription.updated', // event is sent with the subscription status set to active, indicating the subscription was successfully started after the payment was confirmed
    'invoice.upcoming', // A few days prior to renewal
    'invoice.created', // When the subscription period elapses
    'invoice.finalized', // About an hour after the invoice is created, it is finalized (changes are no longer permitted)
    'charge.failed',
    'charge.succeeded',
    'payment_method.attached',
  ],
});

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
      success_url: 'https://eat-beat.hopto.org',
      cancel_url: 'https://eat-beat.hopto.org',
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

app.post('api/webhook', bodyParser.raw({type: 'application/json'}), (request, response) => {
  const event = request.body;

  // Handle the event
  switch (event.type) {
    case 'customer.created':
      console.log(event, 'customer.created');
      const paymentIntent = event.data.object;
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'customer.subscription.created':
      console.log(event, 'customer.subscription.created');
      const paymentIntent = event.data.object;
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'invoice.created':
      console.log(event, 'invoice.created');
      const paymentIntent = event.data.object;
    // Then define and call a method to handle the successful payment intent.
    // handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'invoice.finalized':
        console.log(event, 'invoice.finalized');
        const paymentIntent = event.data.object;
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
        break;
    case 'payment_intent.created':
      console.log(event, 'payment_intent.created');
      const paymentIntent = event.data.object;
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'payment_intent.succeeded':
      console.log(event, 'payment_intent.succeeded');
      const paymentIntent = event.data.object;
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'invoice.payment_action_required':
      console.log(event, 'invoice.payment_action_required');
      const paymentIntent = event.data.object;
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'customer.subscription.updated':
      console.log(event, 'customer.subscription.updated');
      const paymentIntent = event.data.object;
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'invoice.upcoming':
      console.log(event, 'invoice.upcoming');
      const paymentIntent = event.data.object;
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'invoice.created':
      console.log(event, 'invoice.created');
      const paymentIntent = event.data.object;
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'invoice.finalized':
      console.log(event, 'invoice.finalized');
      const paymentIntent = event.data.object;
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'charge.failed':
      console.log(event, 'charge.failed');
      const paymentIntent = event.data.object;
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'payment_method.attached':
      console.log(event, 'payment_method.attached');
      const paymentMethod = event.data.object;
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      break;
    // ... handle other event types
    case 'charge.succeeded': 
      console.log(event, 'charge.succeeded');
      break;
  
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
});

app.use('*', (req, res) => res.send('Not found'))

try {
  httpServer.listen(config.HTTP_PORT, async () => {
    console.log(`Listening on port ${config.HTTP_PORT}`);
  });
} catch (error) {
  console.log(error);
  httpServer.close();
}

