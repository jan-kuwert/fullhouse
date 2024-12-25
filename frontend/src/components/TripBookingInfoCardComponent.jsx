import {
  Box,
  Divider,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import axios from 'axios';
import {
  ArrowRight,
  ArrowRightIcon,
  CheckIcon,
  Info,
  InfoIcon,
  MessageSquare,
  UsersRound,
} from 'lucide-react';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../provider/AlertProvider';
import { useAuth } from '../provider/AuthenticationProvider';
import { getFormattedDate } from '../utils/DateFormatUtils';

export default function TripBookingInfoCard({ setOpenModal, trip }) {
  const { user } = useAuth();

  const { setAlert } = useAlert();
  const navigate = useNavigate();

  const isTripActive = new Date() < new Date(trip.dateRange.endDate);
  const [isOrganizer, setIsOrganizer] = useState();
  const [fees, setFees] = useState(0);

  const computeBookingThresholdText = () => {
    let message = '';
    const booked_spots = trip.spots.totalSpots - trip.spots.availableSpots;
    const remaining_spots = trip.spots.requiredSpots - booked_spots;

    if (booked_spots >= trip.spots.requiredSpots) {
      message = (
        <Typography className="text-ml mt-3" variant="body1">
          Bookings reached, trip takes place
        </Typography>
      );
    } else {
      message = (
        <Typography className="text-ml mt-3" variant="body1">
          <Box component="span" fontWeight="fontWeightBold">
            {remaining_spots}
          </Box>{' '}
          more booking and trip takes place
        </Typography>
      );
    }
    return message;
  };

  const handleCreateChat = async (fromRequest = false) => {
    if (user && trip?.organizer?._id && user._id !== trip.organizer._id) {
      const payload = {
        users: [user._id, trip.organizer._id],
        trip: trip._id,
      };
      await axios
        .post(import.meta.env.VITE_BACKEND_URL + '/chat/create', payload, {
          withCredentials: true,
        })
        .then(() => {
          if (fromRequest) {
            setAlert('success', 'Chat created successfully');
            return true;
          } else {
            navigate('/chat');
          }
        })
        .catch((error) => {
          setAlert('error', 'Failed to create new Chat');
          console.error('Error creating Booking Request:', error);
          if (fromRequest) {
            return false;
          }
        });
    }
  };

  const handleCreateBookingRequest = async () => {
    const chatAvailable = await handleCreateChat();
    if (!chatAvailable) {
      const payload = {
        organizer: trip.organizer._id,
        inquirer: user._id,
        trip: trip._id,
      };
      await axios
        .post(
          import.meta.env.VITE_BACKEND_URL + '/bookingRequest/create',
          payload,
          { withCredentials: true }
        )
        .then(() => {
          setAlert('success', 'Booking Request created successfully');
          navigate('/chat');
        })
        .catch((error) => {
          setAlert('error', 'Failed to create Booking Request');
          console.error('Error creating Booking Request:', error);
        });
    } else {
      setAlert('error', 'Error creating booking request');
      console.error(
        "Error creating Booking Request: Couldn't create chat first"
      );
    }
  };

  // Get the fees from backend and set state
  const getFees = useCallback(
    async (trip_id) => {
      axios
        .post(
          import.meta.env.VITE_BACKEND_URL +
            `/payment/calculateFeesForAuthorization`,
          { tripId: trip_id }
        )
        .then((response) => {
          setFees(response.data.fees);
        })
        .catch((error) => {
          setAlert('error', error.response.data.message);
        });
    },
    [setFees, setAlert]
  );

  useEffect(() => {
    setIsOrganizer(user && user._id === trip.organizer._id);
  }, [user, setIsOrganizer, trip?.organizer?._id]);

  useEffect(() => {
    getFees(trip._id);
  }, [getFees, trip._id]);

  return (
    <Box className="big-white-box sticky m-0 h-fit w-full rounded-xl bg-bright p-6 py-8 text-black md:w-1/3">
      {isTripActive ? (
        <Stack direction={'column'}>
          <Box display="flex" alignItems="center">
            <Typography className="relative text-2xl font-bold">
              {Math.round(trip?.priceRange && trip.priceRange.minPrice)}€ -{' '}
              {Math.round(trip?.priceRange && trip.priceRange.maxPrice)}€
            </Typography>
          </Box>
          <Box display="flex " alignItems="center">
            <Typography
              variant="subtitle"
              className="relative mt-2 text-gray-500"
            >
              + up to {Math.round(fees)}€ Fullhouse fees
              <Tooltip
                title={
                  'The final price will depend on the resulting number of bookings. The total price of the accommodation is divided between the confirmed bookers. As there is always a minimum number of bookings required, this results in a price range. The minimum price of this range corresponds to a fully booked accommodation and the maximum price corresponds to a minimally booked accommodation.'
                }
              >
                <IconButton className="absolute -top-2 p-0.5">
                  <Info className="h-4 w-4" />
                </IconButton>
              </Tooltip>
            </Typography>
          </Box>
        </Stack>
      ) : (
        <Typography
          className="mt-2 text-xl"
          align="center"
          color="textSecondary"
        >
          Trip is in the past
        </Typography>
      )}
      <Divider className="my-4" />

      {/* Data information */}

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mt={2}
      >
        <Box textAlign="left">
          <Typography
            className="text-xl"
            variant="body2"
            color="textSecondary"
            align={'center'}
          >
            Start
          </Typography>
          <Typography className="text-xl" variant="body1" align={'center'}>
            {getFormattedDate(trip.dateRange.startDate)}
          </Typography>
        </Box>
        <Typography className="text-xl" variant="body1">
          -
        </Typography>
        <Box textAlign="right">
          <Typography
            className="text-xl"
            variant="body2"
            color="textSecondary"
            align={'center'}
          >
            End
          </Typography>
          <Typography className="text-xl" variant="body1" align={'center'}>
            {getFormattedDate(trip.dateRange.endDate)}
          </Typography>
        </Box>
      </Stack>

      <Divider className="my-4" />

      {/* Capacity information */}
      {isTripActive && (
        <>
          <Box mt={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <UsersRound />
              <Typography variant="body1">
                <Box component="span" fontWeight="fontWeightBold">
                  {trip.spots.totalSpots - trip.spots.availableSpots}/
                  {trip.spots.totalSpots}
                </Box>{' '}
                places already taken
              </Typography>
            </Stack>
            <LinearProgress
              className="mt-3 h-3 rounded-full bg-white [&_span]:rounded-full [&_span]:bg-gradient-to-l [&_span]:from-primary [&_span]:to-light"
              variant="determinate"
              value={
                ((trip.spots.totalSpots - trip.spots.availableSpots) /
                  trip.spots.totalSpots) *
                100
              }
            />
            {computeBookingThresholdText(trip.spots)}
          </Box>
          <Divider className="my-4" />
        </>
      )}

      {/* Participant information */}
      {isTripActive && (
        <Box>
          {isOrganizer && (
            <div>
              <IconButton
                className="btn btn-white mt-6 w-full"
                onClick={() => {
                  navigate(`/manageTrip/${trip._id}`);
                  window.scrollTo(0, 0);
                }}
              >
                <ArrowRightIcon /> Manage Trip
              </IconButton>
            </div>
          )}
        </Box>
      )}

      {/* Buttons for message and request */}
      {isTripActive ? (
        <>
          {!isOrganizer && (
            <Stack className="mt-6" direction="column" spacing={2} mt={2}>
              <>
                <IconButton
                  className="btn btn-white w-full text-lg"
                  onClick={() => handleCreateChat()}
                  disabled={!user}
                >
                  <MessageSquare />
                  Send Message
                </IconButton>
                {trip.status !== 'started' && (
                  <IconButton
                    className=" btn btn-primary w-full text-lg"
                    onClick={handleCreateBookingRequest}
                    disabled={!user}
                  >
                    <ArrowRight />
                    Write Request
                  </IconButton>
                )}
              </>
              {!user && (
                <Box className="flex space-x-2">
                  <InfoIcon />
                  <p>Log in to chat or send a booking request</p>
                </Box>
              )}
            </Stack>
          )}
        </>
      ) : (
        <IconButton
          className="btn btn-primary w-full text-lg"
          onClick={() => setOpenModal('createReview')}
        >
          <ArrowRight />
          Write Review
        </IconButton>
      )}

      {isTripActive && trip.status == 'started' && (
        <>
          <Divider className="my-6" />
          <Box className="flex items-center justify-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xl">Trip takes place!</p>
          </Box>
        </>
      )}
    </Box>
  );
}

TripBookingInfoCard.propTypes = {
  setOpenModal: PropTypes.func.isRequired,
  trip: PropTypes.object.isRequired,
};
