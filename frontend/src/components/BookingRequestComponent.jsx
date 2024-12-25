import {
  Box,
  Card,
  CardContent,
  CardMedia,
  FormControl,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from '@mui/material';
import axios from 'axios';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CheckIcon,
  EllipsisIcon,
  InfoIcon,
  ShieldCheckIcon,
  TypeIcon,
  UsersIcon,
  XCircleIcon,
  XIcon,
} from 'lucide-react';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../provider/AlertProvider';
import { useAuth } from '../provider/AuthenticationProvider';
import { getFormattedDay } from '../utils/DateFormatUtils';
import DialogComponent from './DialogComponent';

export const BookingRequestComponent = ({
  setBookingRequestExists, //is used to display this component only if a booking request exists, if a booking request returns something the sidebar will be shown
  trip,
  receiver,
  setOpenModal,
  sendMessage,
  setModalPaymentTrip,
  setModalPaymentBookingRequest,
}) => {
  const navigate = useNavigate();
  const [bookingRequest, setBookingRequest] = useState({});
  const { user } = useAuth();
  const { setAlert } = useAlert();
  //the different status values of a booking request
  const [status, setStatus] = useState([
    'pending', //the booking request is started but not answered yet
    'accepted', //the booking request is accepted by the organizer
    'declined', //the booking request is declined by the organizer
    'canceled', //the booking request is canceled by oe of the participants
    'accepted_and_authorized', //the booking request is accepted and the payment is authorized
  ]);
  const [picture, setPicture] = useState(''); //the picture of the trip
  const [answerMessage, setAnswerMessage] = useState(''); //the answer of the organizer to the booking request
  const [cancelMessage, setCancelMessage] = useState(''); //the cancel message
  const [answerMessageError, setAnswerMessageError] = useState([]); //used to display error on message inputs
  const [cancelMessageError, setCancelMessageError] = useState([]); //used to display error on message inputs

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const confirmDialogHandleClose = () => {
    setConfirmDialogOpen(false);
  };

  const getBookingRequest = useCallback(
    async (organizerId, inquirerId, tripId) => {
      await axios
        .get(`${import.meta.env.VITE_BACKEND_URL}/bookingRequest/byIds/`, {
          withCredentials: true,
          params: {
            organizerId: organizerId,
            inquirerId: inquirerId,
            tripId: tripId,
          },
        })
        .then((response) => {
          setBookingRequest(response.data);
          setBookingRequestExists(true);
          setModalPaymentBookingRequest(response.data);
        })
        .catch((error) => {
          console.error('Error getting Booking Request:', error);
          setBookingRequestExists(false);
        });
    },
    [setBookingRequestExists, setModalPaymentBookingRequest]
  );

  useEffect(() => {
    setModalPaymentTrip(trip);

    if (receiver && user && trip?.organizer) {
      if (trip.organizer == user._id) {
        getBookingRequest(user._id, receiver._id, trip._id);
      } else {
        getBookingRequest(receiver._id, user._id, trip._id);
      }
    }
  }, [receiver, user, trip, getBookingRequest, setModalPaymentTrip]);

  useEffect(() => {
    if (trip?.pictures) {
      getTripPicture(trip.pictures[0]);
    }
  }, [trip]);

  const updateBookingRequest = async (bookingRequest) => {
    await axios
      .post(
        `${import.meta.env.VITE_BACKEND_URL}/bookingRequest/update`,
        {
          bookingRequest: bookingRequest,
        },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        setBookingRequest(response.data);
        console.log('Booking Request updated:', response.data.status);
        setStatus(response.data.status);
        setModalPaymentBookingRequest(bookingRequest);
        console.log('Booking Request updated:', response.data);
        setAlert('info', 'Booking Request updated.');
      })
      .catch((error) => {
        console.log('Error getting booking request:', error);
      });
  };

  const getTripPicture = async (pictureId) => {
    await axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/file/getById/${pictureId}`, {
        withCredentials: true,
      })
      .then((response) => {
        setPicture(response.data);
      })
      .catch((error) => {
        console.log('Error getting trip image:', error);
      });
  };

  const handleMessageChange = (event) => {
    setAnswerMessage(event.target.value);
  };

  const handleStatusUpdate = async (id) => {
    let message;
    if (id == 3) {
      message = cancelMessage;
    } else {
      message = answerMessage;
    }
    const sentSuccessfull = await sendMessage(status[id], message);
    if (sentSuccessfull) {
      setCancelMessageError('');
      setAnswerMessageError('');
      bookingRequest.status = status[id];
      updateBookingRequest(bookingRequest);
    } else {
      setAlert('error', 'Message could not be sent.');
      if (id == 3) {
        setCancelMessageError('Please enter a valid message');
      } else {
        setAnswerMessageError('Please enter a valid message');
      }
    }
  };

  return (
    <Box className="flex h-full flex-col justify-between">
      {(bookingRequest.status == status[2] ||
        bookingRequest.status == status[3] ||
        (trip?.spots?.availableSpots == 0 && user?._id != trip?.organizer)) && (
        <>
          <Box className="hello absolute top-0 flex h-full w-full flex-col items-center justify-center bg-bright bg-opacity-90">
            <IconButton
              className="btn btn-white absolute left-4 top-4 h-fit w-fit px-6"
              onClick={() => navigate(`/trip/${trip._id}`)}
            >
              <ArrowRightIcon /> Go to Trip
            </IconButton>
            <div
              className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${trip.spots.availableSpots == 0 ? 'bg-blue-100' : 'bg-red-100'}`}
            >
              {trip.spots.availableSpots == 0 ? (
                <InfoIcon className="h-8 w-8 text-blue-600" />
              ) : (
                <XIcon className="h-8 w-8 text-red-600" />
              )}
            </div>
            <p className="mx-2 text-center text-xl">
              {trip.spots.availableSpots == 0
                ? `Sadly all ${trip.spots.totalSpots - trip.spots.availableSpots}/${trip.spots.totalSpots} spots are already booked.`
                : `The booking request got {bookingRequest.status}!`}
            </p>
          </Box>
        </>
      )}
      <Box>
        <p className="my-6 ml-5 text-2xl">Booking Request</p>
        <div className="grid grid-cols-6 gap-4 p-4">
          <div className="center col-span-1 row-span-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
              <p className="text-2xl">1</p>
            </div>
          </div>
          <div className="col-span-5 text-xl">
            {user && trip?.organizer && user._id == trip.organizer
              ? receiver.firstName
              : 'You'}{' '}
            sent a booking Request
          </div>
          <div className="col-span-5 mb-4">
            <Card
              className="btn flex w-full cursor-pointer shadow-md"
              onClick={() => navigate(`/trip/${trip._id}`)}
            >
              <CardMedia
                component="img"
                image={picture && picture.url}
                className="max-w-[30%] m-3 mr-0 rounded-lg"
              />
              {trip?.images && trip.images[0]}
              <CardContent className="py-4">
                <p className="min-w-32 text-lg">{trip && trip.shortTitle}</p>
                <p className="mb-2 text-sm">
                  {trip?.location && trip.location.city},{' '}
                  {trip?.location && trip.location.country}
                </p>

                <p
                  className={`${trip?.spots?.availableSpots <= 2 && 'text-red-600'}`}
                >
                  {trip?.spots?.totalSpots - trip?.spots?.availableSpots}/
                  {trip?.spots?.totalSpots}
                  <UsersIcon className="ml-1 inline h-5 w-5" />
                </p>
                <p className="mb-2 text-sm">
                  {trip?.dateRange && getFormattedDay(trip.dateRange.startDate)}{' '}
                  - {trip?.dateRange && getFormattedDay(trip.dateRange.endDate)}
                </p>
                <p className="font-bold ">
                  €{trip?.priceRange && trip.priceRange.minPrice} -{' '}
                  {trip?.priceRange && trip.priceRange.maxPrice}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="center col-span-1 row-span-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full bg-white`}
            >
              <p className="text-2xl">2</p>
            </div>
          </div>
          <div className="col-span-5 text-xl ">
            {user && trip?.organizer && user._id == trip.organizer ? (
              <>
                {bookingRequest.status == status[0] &&
                  `Reply to ${receiver && receiver.firstName}'s request`}
                {bookingRequest.status == status[1] ||
                  (bookingRequest.status == status[2] &&
                    `You ${bookingRequest.status} ${receiver && receiver.firstName}'s request`)}
              </>
            ) : (
              <>
                {bookingRequest.status != status[1] &&
                  bookingRequest.status != status[2] &&
                  `Wait for ${receiver && receiver.firstName}'s answer.`}
                {bookingRequest.status == status[1] &&
                  `${receiver && receiver.firstName} accepted your request.`}
                {bookingRequest.status == status[2] &&
                  `${receiver && receiver.firstName} declined your request.`}
              </>
            )}
          </div>
          <div className="col-span-5 mb-4 flex flex-wrap justify-between gap-3">
            {bookingRequest.status == status[0] && (
              <>
                {trip?.organizer && trip.organizer == user._id ? (
                  <>
                    <FormControl className="w-full">
                      <TextField
                        multiline
                        className="input-field w-full bg-white"
                        rows={2}
                        value={answerMessage}
                        onChange={handleMessageChange}
                        placeholder="Write an answer..."
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <TypeIcon className="dark-icon" />
                            </InputAdornment>
                          ),
                        }}
                      ></TextField>
                      <p className="ml-2 text-red-600">{answerMessageError}</p>
                    </FormControl>

                    <IconButton
                      className="btn w-fit bg-green-100 px-5 py-4 text-base text-dark shadow-lg"
                      onClick={() => handleStatusUpdate(1)}
                    >
                      <CheckCircleIcon className="text-green-600" /> Accept
                    </IconButton>
                    <IconButton
                      className="btn w-fit bg-red-100 px-5 py-4 text-base text-dark shadow-lg"
                      onClick={() => handleStatusUpdate(2)}
                    >
                      <XCircleIcon className="text-red-600" /> Decline
                    </IconButton>
                  </>
                ) : (
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 hover:animate-pulse">
                    <EllipsisIcon className="h-8 w-8 text-gray-600" />
                  </div>
                )}
              </>
            )}
            {bookingRequest.status == status[1] && (
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckIcon className="h-8 w-8 text-green-600" />
              </div>
            )}
            {bookingRequest.status == status[2] && (
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <XIcon className="h-8 w-8 text-red-600" />
              </div>
            )}
          </div>

          <div className="center col-span-1 row-span-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${bookingRequest.status == status[0] ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
            >
              <p className="text-2xl">3</p>
            </div>
          </div>
          <div
            className={`col-span-5 flex text-xl ${bookingRequest.status == status[0] && 'text-gray-500'}`}
          >
            Payment
            <Tooltip
              title={`Stride blocks the mmaximum price of €
          ${trip?.priceRange && trip.priceRange.maxPrice} on your Card. The actual
          Price will be determined when the canellation date has ended. The price depends the number of people traveling with you and only the needed amount will be charged the rest`}
            >
              <InfoIcon className="ml-1 h-4 w-4" />
            </Tooltip>
          </div>
          {bookingRequest.status === status[1] && (
            <div className="col-span-5">
              {trip?.organizer && trip.organizer == user._id ? (
                <div className="col-span-5">
                  <p className="mb-4">
                    Waiting for the payment of {receiver.firstName}{' '}
                    {receiver.lastName}.
                  </p>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 transition-transform hover:animate-pulse">
                    <EllipsisIcon className="h-8 w-8 text-gray-600" />
                  </div>
                </div>
              ) : (
                <>
                  <p className="mb-4">
                    Congrats your request was accepted! Finish the booking by
                    Payment via Stripe:
                  </p>
                  <IconButton
                    className="btn btn-primary w-full shadow-lg"
                    onClick={() => setOpenModal('stripePayment')}
                  >
                    <ShieldCheckIcon /> Payment
                  </IconButton>
                </>
              )}
            </div>
          )}
          {bookingRequest.status === status[4] && (
            <div className="col-span-5">
              {trip?.organizer && trip.organizer == user._id ? (
                <div className="col-span-5">
                  <p className="mb-4">
                    We received the payment authorization of{' '}
                    {receiver.firstName} {receiver.lastName}.
                  </p>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 transition-transform hover:animate-pulse">
                    <EllipsisIcon className="h-8 w-8 text-gray-600" />
                  </div>
                </div>
              ) : (
                <>
                  <p className="mb-4">
                    Thanks for the payment! If the hosts starts the trip the
                    final amount will be charged and the difference will be
                    refunded.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </Box>
      {trip?.organizer &&
        user &&
        ((trip.organizer == user._id && bookingRequest.status == status[0]) ||
          (trip.organizer != user._id &&
            (bookingRequest.status == status[0] ||
              bookingRequest.status == status[1]))) && (
          <div className="mt-4 w-full px-8 py-4">
            <IconButton
              className="btn w-full max-w-full px-5 py-4 text-base text-dark hover:bg-red-100"
              onClick={() => setConfirmDialogOpen(true)}
            >
              <XCircleIcon className="text-red-600" /> Cancel Request
            </IconButton>
            <DialogComponent
              open={confirmDialogOpen}
              handleClose={confirmDialogHandleClose}
              handleSubmit={() => handleStatusUpdate(3)}
              dialogText="This will delete the request and you will not be able to recover it."
              withInput={true}
              value={cancelMessage}
              setValue={setCancelMessage}
              errorMessage={cancelMessageError}
              setErrorMessage={setCancelMessageError}
            ></DialogComponent>
          </div>
        )}
    </Box>
  );
};

BookingRequestComponent.propTypes = {
  setBookingRequestExists: PropTypes.func.isRequired,
  trip: PropTypes.object.isRequired,
  receiver: PropTypes.object.isRequired,
  setOpenModal: PropTypes.func.isRequired,
  sendMessage: PropTypes.func.isRequired,
  //setModalTrip: PropTypes.func.isRequired,
};

export default BookingRequestComponent;
