import { Box, Divider, Grid } from '@mui/material';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import CheckoutForm from '../components/CheckoutComponent.jsx';
import { useAlert } from '../provider/AlertProvider.jsx';
import { useAuth } from '../provider/AuthenticationProvider.jsx';
import BaseModal from './BaseModal';

// Load environment variables from a .env file into process.env

export default function StripePaymentModal({
  handleClose,
  open,
  trip,
  bookingRequest,
}) {
  //console.log('StripePaymentModal booking request:', bookingRequest);
  const { user } = useAuth();
  const { setAlert } = useAlert();
  const [clientSecret, setClientSecret] = useState('');
  const [stripePromise, setStripePromise] = useState(null);
  const [fees, setFees] = useState(0);
  // Booking request state is initialized with the booking request passed as prop and then updated if the booking request changes
  const [bookingRequest_state, setBookingRequest_state] =
    useState(bookingRequest);

  // function to create a PaymentIntent with axios to be called by a button
  const createPaymentIntent = async () => {
    console.log('Creating Payment Intent...');
    console.log('trip:', trip?._id);
    console.log('user:', user?._id);
    axios
      .post(
        import.meta.env.VITE_BACKEND_URL + '/payment/create-payment-intent',
        {
          // Pass information to backend, can be used to calculate the amount of the payment (e.g. trip_id)
          payment_params: {
            trip_id: trip?._id,
            user_id: user?._id,
            booking_request_id: bookingRequest?._id,
          },
        },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        setClientSecret(res.data.clientSecret);
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getFees = async (trip) => {
    try {
      console.log('Fetching fees for trip:', trip._id);
      axios
        .post(
          `${import.meta.env.VITE_BACKEND_URL}/payment//calculateFeesForAuthorization`,
          {
            tripId: trip._id,
          }
        )
        .then((response) => {
          setFees(response.data.fees);
          console.log('Fees:', response.data.fees);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    // Load Stripe and create the Stripe promise
    // get public key with vite env
    const stripe_public_key = import.meta.env.VITE_STRIPE_API_PUBLIC_KEY;
    const stripePromise_created = loadStripe(stripe_public_key);
    setStripePromise(stripePromise_created);
    if (open && trip) {
      getFees(trip);
      createPaymentIntent();
    }
  }, [open]);

  useEffect(() => {
    setBookingRequest_state(bookingRequest);
  }, [bookingRequest]);

  const appearance = {
    theme: 'flat',
    variables: {
      colorPrimary: '#15bac5',
      colorBackground: '#efe9f4',
      colorText: '#171d1c',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <BaseModal
      open={open}
      handleClose={handleClose}
      title="Stripe Payment"
      description="Stripe Payment Modal"
      content={
        <Box className="px-8 pb-4">
          {/* <Box alignItems="left">
            <Typography className="mb-4">
              Active user: {user?.firstName} {user?.lastName}
            </Typography>
            <Typography className="mb-4">
              Active user ID: {user?._id}
            </Typography>
            <Divider className="mb-4" />
            <Typography className="mb-4">Active trip: {trip?.title}</Typography>
            <Typography className="mb-4">
              Active trip ID: {trip?._id}
            </Typography>
            <Divider className="mb-4" />
            <Typography className="mb-4">
              Active booking request ID: {bookingRequest_state?._id}
            </Typography>
            <Typography className="mb-4">
              Underlying trip id of request: {bookingRequest_state?.trip}
            </Typography>
            <Typography className="mb-4">
              Active booking request status: {bookingRequest_state?.status}
            </Typography>
            <Divider className="mb-4" />
          </Box>*/}
          <p className="text-left text-2xl">Payment Summary</p>
          <Grid className="grid grid-cols-5 grid-rows-3 justify-items-start py-6">
            <p className="col-span-3 col-start-1 justify-start  ">
              Maximum trip price:
            </p>
            <p className="col-span-2 col-start-4 mb-4 justify-self-end">
              {trip?.priceRange?.maxPrice.toFixed(2)} €
            </p>

            <p className="col-span-3 col-start-1 mb-4">FullHouse Fees: </p>
            <p className="col-span-2 col-start-4 mb-4 justify-self-end">
              {fees.toFixed(2)} €
            </p>
            <Divider
              variant="middle"
              className="col-span-5 col-start-1 m-0 -mb-4 h-1 w-full p-0"
            />

            <p className="col-span-3 col-start-1 -mt-4 mb-4">
              Total authorization amount:
            </p>
            <p className="col-span-2 col-start-4 -mt-4 mb-4 justify-self-end">
              {(trip?.priceRange?.maxPrice + fees).toFixed(2)} €
            </p>
          </Grid>
          <p className="mb-6 mt-2 text-left text-2xl">Enter Payment Details</p>

          <div className="">
            {clientSecret && (
              <Elements stripe={stripePromise} options={options}>
                <CheckoutForm
                  bookingRequestID={bookingRequest_state?._id}
                  handleClose={handleClose}
                />
              </Elements>
            )}
          </div>
        </Box>
      }
    />
  );
}

StripePaymentModal.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};
