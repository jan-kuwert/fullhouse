// Checkout component for the application for Stripe payment

import { Box, IconButton } from '@mui/material';
import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { ShieldCheckIcon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export default function CheckoutForm({ bookingRequestID, handleClose }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );
    console.log('stripe clientSecret:', clientSecret);

    if (!clientSecret) {
      return;
    }

    console.log('Retrieving PaymentIntent from client secret');
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      console.log('PaymentIntent status retrieved:', paymentIntent.status);
      switch (paymentIntent.status) {
        case 'succeeded':
          setMessage('Payment succeeded!');
          console.log('Payment succeeded:', paymentIntent);
          break;
        case 'processing':
          setMessage('Your payment is processing.');
          break;
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.');
          break;
        default:
          setMessage('Something went wrong.');
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e) => {
    console.log('stripe handleSubmit');
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      console.log('stripe not loaded');
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url:
          'http://localhost:3000/paymentConfirmation/' + bookingRequestID,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === 'card_error' || error.type === 'validation_error') {
      setMessage(error.message);
    } else {
      setMessage('An unexpected error occurred.');
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: 'tabs',
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      <Box className="flex justify-between">
        <IconButton className="btn h-fit w-fit px-4" onClick={handleClose}>
          <XIcon /> Cancel
        </IconButton>
        <IconButton
          disabled={isLoading || !stripe || !elements}
          id="submit"
          className="btn btn-primary mb-4 h-fit place-self-end justify-self-end"
          type="submit"
        >
          <ShieldCheckIcon />
          <span id="button-text">
            {isLoading ? (
              <div className="spinner" id="spinner"></div>
            ) : (
              'Authorize payment'
            )}
          </span>
        </IconButton>
      </Box>
      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
}

CheckoutForm.prpTypes = {
  handleClose: PropTypes.func.isRequired,
};
