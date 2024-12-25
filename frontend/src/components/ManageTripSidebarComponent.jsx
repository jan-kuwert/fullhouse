import {
  Box,
  Divider,
  IconButton,
  LinearProgress,
  Tooltip,
  Typography,
} from '@mui/material';
import axios from 'axios';
import {
  ArrowRightIcon,
  InfoIcon,
  PartyPopperIcon,
  RocketIcon,
  Trash2Icon,
  UsersIcon,
} from 'lucide-react';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../provider/AlertProvider.jsx';
import DialogComponent from './DialogComponent.jsx';
import ParticipantChipComponent from './ParticipantChipComponent.jsx';

export function ManageTripSidebarComponent({ trip }) {
  const [participants, setParticipants] = useState([]);
  const [filteredBookingRequests, setFilteredBookingRequests] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const { setAlert } = useAlert();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [requiredSpotsReached, setRequiredSpotsReached] = useState(false);

  // Starts capturing payments for the trip and sets the trip status to 'started' if successful
  const handleStartTrip = async () => {
    const participant_ids = participants.map((participant) => participant?._id);

    await axios
      .post(
        import.meta.env.VITE_BACKEND_URL + '/payment/capturePayments',
        { tripId: trip?._id, participantIds: participant_ids },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        if (res.status === 200) {
          axios
            .post(
              import.meta.env.VITE_BACKEND_URL + '/trip/startTrip',
              { tripId: trip?._id },
              {
                withCredentials: true,
              }
            )
            .then((res) => {
              if (res.status === 200) {
                setAlert('success', res.data.message);
              }
            });
        }
      })
      .catch((error) => {
        setAlert('error', error.response.data.message);
      });
    setStartDialogOpen(false);
  };

  const getParticipants = useCallback(async () => {
    if (!trip?._id) return;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/trip/getParticipants/${trip?._id}`,
        {
          withCredentials: true,
        }
      );
      setParticipants(response.data);
    } catch (error) {
      console.error('Failed to get trip participants:', error);
    }
  }, [trip]);

  const getBookingRequests = useCallback(async () => {
    if (!trip?._id) return;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/bookingRequest/byTripId/${trip?._id}`,
        {
          withCredentials: true,
        }
      );
      // if not found: empty array bookingRequests []
      // filters all inquirers that are not already participants to not show them under participants and bookingrequests again
      if (Array.isArray(response.data)) {
        const nonParticipantInquirers = response.data.filter(
          (request) =>
            request.status !== 'accepted_and_captured' &&
            request.status !== 'accepted_and_authorized'
        );
        setFilteredBookingRequests(nonParticipantInquirers);
      }
    } catch (error) {
      console.error('Failed to get booking requests:', error);
    }
  }, [trip]);

  const handleDeleteTrip = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/trip/delete/${trip?._id}`,
        {
          withCredentials: true,
        }
      );
      setAlert('success', 'Trip deleted successfully');
      navigate('/');
      window.location.reload();
    } catch (error) {
      setAlert('error', 'Failed to delete trip');
      console.error('Error deleting trip:', error);
    }
  };

  useEffect(() => {
    if (
      trip?.spots &&
      trip?.spots.totalSpots - trip?.spots.availableSpots >=
        trip?.spots.requiredSpots
    ) {
      setRequiredSpotsReached(true);
    }
  }, [trip]);

  useEffect(() => {
    getParticipants();
    getBookingRequests();
  }, [getParticipants, getBookingRequests]);

  return (
    <Box className="min-w-[250px] rounded-xl bg-bright px-4 py-6">
      <Box className="mb-6">
        <IconButton
          className="btn btn-white h-fit w-full self-end"
          onClick={() => navigate(`/trip/${trip?._id}`)}
        >
          <ArrowRightIcon /> View Trip
        </IconButton>
        <span className="mt-8 flex">
          {trip?.spots?.totalSpots - trip?.spots?.availableSpots}/
          {trip?.spots?.totalSpots}
          <UsersIcon className="mx-1" /> spots booked.{' '}
        </span>
        <LinearProgress
          className={`${
            requiredSpotsReached
              ? ' [&_span]:bg-gradient-to-l [&_span]:to-light'
              : 'max-w-[62%] [&_span]:bg-gray-500'
          } mb-2 mt-3 h-3 rounded-full bg-white [&_span]:rounded-full  [&_span]:from-primary`}
          variant="determinate"
          value={
            ((trip?.spots?.totalSpots - trip?.spots?.availableSpots) /
              trip?.spots?.totalSpots) *
            100
          }
        />{' '}
        {!requiredSpotsReached ? (
          <p>
            {trip?.spots?.requiredSpots -
              (trip?.spots?.totalSpots - trip?.spots?.availableSpots)}{' '}
            more to reach required spots.
          </p>
        ) : (
          <span className="">Required spots reached!</span>
        )}
        <div className="flex h-0 w-full justify-end">
          <Tooltip
            className="z-10 -mr-3 mt-3.5 h-6 w-6 rounded-full bg-bright"
            title={
              'After starting the Trip it cannot be deleted or canceled anymore. The Trip can bes started when the required spots are booked.'
            }
          >
            <InfoIcon className="ml-1 h-4 w-4" />
          </Tooltip>
        </div>
        <IconButton
          className="btn btn-primary mt-6 h-fit w-full self-end"
          onClick={() => setStartDialogOpen(true)}
          disabled={trip?.status === 'started' || !requiredSpotsReached}
        >
          {trip?.status === 'started' ? (
            <>
              Trip started! <PartyPopperIcon />{' '}
            </>
          ) : (
            <>
              <RocketIcon /> Start Trip
            </>
          )}
        </IconButton>
        <DialogComponent
          open={startDialogOpen}
          handleClose={() => setStartDialogOpen(false)}
          handleSubmit={handleStartTrip}
          dialogText="This will collect the reserved money from all participants and start the trip. The Trip cannot be deleted or canceled after starting."
          withInput={false}
          confirmButtonText="Start"
        ></DialogComponent>
        <div className="flex h-0 w-full justify-end">
          <Tooltip
            className="z-10 -mr-3 mt-3.5 h-6 w-6 rounded-full bg-bright "
            title={
              'Deleting the Trip will only be possible before a bookingrequest has been created for this trip. Deleting a Trip is not reversible.'
            }
          >
            <InfoIcon className="ml-1 h-4 w-4" />
          </Tooltip>
        </div>
        <IconButton
          className="btn btn-danger mt-6 h-fit w-full"
          onClick={() => setDeleteDialogOpen(true)}
          disabled={
            participants?.length > 0 ||
            filteredBookingRequests?.length > 0 ||
            trip?.status === 'started'
          }
        >
          <Trash2Icon /> Delete Trip
        </IconButton>
        <DialogComponent
          open={deleteDialogOpen}
          handleClose={() => setDeleteDialogOpen(false)}
          handleSubmit={handleDeleteTrip}
          dialogText="Your Account will be deleted permanently and cannot be recovered."
          withInput={false}
          confirmButtonText="Delete"
          color="red"
        ></DialogComponent>
        <></>
      </Box>
      <Divider />

      <Typography className="mb-4 mt-10 text-2xl">
        Confirmed Participants
      </Typography>
      <Box className="mb-8 max-w-[300px]">
        {trip?.participants?.length > 0 ? (
          trip.participants.map((participant, index) => (
            <ParticipantChipComponent
              key={index}
              participant={participants[index]}
            />
          ))
        ) : (
          <p>No confirmed participants yet</p>
        )}
      </Box>
      <Divider />
      <Typography className="mb-4 mt-10 text-2xl">
        Open Bookingrequests
      </Typography>
      <Box className="max-w-[300px]">
        {filteredBookingRequests?.length > 0 ? (
          filteredBookingRequests.map((bookingRequest, index) => (
            <ParticipantChipComponent
              key={index}
              participant={bookingRequest.inquirer}
              bookingRequest={bookingRequest}
            />
          ))
        ) : (
          <p>No open booking requests</p>
        )}
      </Box>
    </Box>
  );
}

ManageTripSidebarComponent.propTypes = {
  trip: PropTypes.object,
};
