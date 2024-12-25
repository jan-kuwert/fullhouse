import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Divider, Grid, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';
import TripCard from '../components/TripCardComponent';

// Payment Confirmation Page

export default function PaymentConfirmationPage() {
  const query = useQuery();
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [redirectStatus, setRedirectStatus] = useState(null);
  const [paymentEntry, setPaymentEntry] = useState(null);
  const [tripEntry, setTripEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paid_fees, setPaidFees] = useState(0);

  // read bookingRequestId from URL
  const { bookingRequestId } = useParams();

  useEffect(() => {
    setLoading(true);
    // Get the query parameters from the URL
    const paymentIntentId = query.get('payment_intent');
    const clientSecretValue = query.get('payment_intent_client_secret');
    const redirectStatusValue = query.get('redirect_status');
    setLoading(false);

    setPaymentIntent(paymentIntentId);
    setClientSecret(clientSecretValue);
    setRedirectStatus(redirectStatusValue);
  }, []);

  // We need to access the query parameters that are passed to this page in the URL by Stripe
  // We receive from Stripe 3 query parameters: payment_intent, payment_intent_client_secret, and redirect_status
  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }

  const getFees = async () => {
    // Fetch the payment object to show paid fees

    const paid_fees_res = await axios.get(
      import.meta.env.VITE_BACKEND_URL +
        `/payment/byPaymentIntentID/${paymentIntent}`,
      {
        withCredentials: true,
      }
    );
    const fees_result = paid_fees_res.data[0].fees;
    setPaidFees(fees_result);
  };

  useEffect(() => {
    setLoading(true);
    // Trigger API to update the payment status in the database
    if (paymentIntent) {
      // Update the payment entry in the database
      axios
        .post(
          import.meta.env.VITE_BACKEND_URL + '/payment/confirmPayment',
          {
            paymentIntentId: paymentIntent,
            bookingRequestId: bookingRequestId,
          },
          {
            withCredentials: true,
          }
        )
        .then((res) => {
          setPaymentEntry(res.data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err);
          setLoading(false);
        });

      // Get the fees for the payment and set the state
      getFees(paymentIntent);
    }
  }, [paymentIntent]);

  useEffect(() => {
    setLoading(true);
    // Get the trip entry from the database
    // If payment entry is not null, get the trip entry
    if (paymentEntry) {
      axios
        .get(
          import.meta.env.VITE_BACKEND_URL +
            `/trip/getTrips/${paymentEntry.trip}`
        )
        .then((response) => {
          setTripEntry(response.data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err);
          setLoading(false);
        });
    }
  }, [paymentEntry]);

  return (
    <Box className="ml-8 mr-8 mt-4 flex w-1/2 flex-col justify-center">
      <Typography variant="h4" className="mb-4">
        Payment Confirmation
      </Typography>

      {/*Insert MUI spinner of loading*/}
      {loading && <CircularProgress></CircularProgress>}
      {/*If loading false, payment entry and trip entry available show then*/}

      {paymentEntry && tripEntry && !loading ? (
        <Box>
          <TripCard trip={tripEntry} />{' '}
          <Box>
            <p className="mb-2 mt-6 text-left text-2xl">Payment Summary</p>
            <p>
              Thank you for your the payment. We have received authorization and
              will notify the host. Stripe will block the amount on your credit
              card.
            </p>
            <p className="mt-2">
              We will only capture it at the start of the trip. If other
              participants join and the price decreases, we will of course only
              charge the new reduced amount and refund the rest.
            </p>
            <Grid className="grid grid-cols-5 grid-rows-3 justify-items-start py-6">
              <p className="col-span-3 col-start-1 justify-start text-lg ">
                Maximum trip price:
              </p>
              <p className="col-span-2 col-start-4 mb-4 justify-self-end text-lg">
                {tripEntry?.priceRange?.maxPrice.toFixed(2)} €
              </p>

              <p className="col-span-3 col-start-1 mb-4 text-lg">
                FullHouse fees:{' '}
              </p>
              <p className="col-span-2 col-start-4 mb-4 justify-self-end text-lg">
                {paid_fees.toFixed(2)} €
              </p>
              <Divider
                variant="middle"
                className="col-span-5 col-start-1 m-0 -mb-4 h-1 w-full p-0"
              />

              <p className="col-span-3 col-start-1 -mt-4 mb-4 text-lg font-bold">
                Total authorization amount:
              </p>
              <p className="col-span-2 col-start-4 -mt-4 mb-4 justify-self-end text-lg font-bold">
                {(tripEntry?.priceRange?.maxPrice + paid_fees).toFixed(2)} €
              </p>
            </Grid>
          </Box>
        </Box>
      ) : (
        <CircularProgress></CircularProgress>
      )}
    </Box>
  );
}
