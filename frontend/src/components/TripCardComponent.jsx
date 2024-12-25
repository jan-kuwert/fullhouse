import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  LinearProgress,
} from '@mui/material';
import axios from 'axios';
import {
  ArrowRightIcon,
  CalendarIcon,
  MapPinIcon,
  Star,
  User,
  UserIcon,
  UsersIcon,
} from 'lucide-react';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../provider/AuthenticationProvider';
import { getFormattedDate, getFormattedDay } from '../utils/DateFormatUtils';

export default function TripCard({ trip, large = false }) {
  const { user } = useAuth();
  const [organizer, setOrganizer] = useState({});
  const [image, setImage] = useState('');
  const navigate = useNavigate();

  const [requiredSpotsReached, setRequiredSpotsReached] = useState(false); //used to check if required spots are reached

  const getOrganizer = useCallback(async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_BACKEND_URL + `/trip/getTrips/${trip?._id}`
      );
      setOrganizer(response.data.organizer);
    } catch (error) {
      console.error('Error fetching organizer:', error);
    }
  }, [trip]);

  const getImages = useCallback(async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_BACKEND_URL + `/file/gettrippics/${trip?._id}`
      );
      if (response.data && response.data.length > 0) {
        setImage(response.data[0]); // Assuming the response.data contains array of image URLs
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  }, [trip]);

  useEffect(() => {
    if (
      trip?.spots &&
      trip.spots.totalSpots - trip.spots.availableSpots >=
        trip.spots.requiredSpots
    ) {
      setRequiredSpotsReached(true);
    }
  }, [trip]);

  useEffect(() => {
    if (trip?.organizer) {
      getOrganizer();
    }
    if (trip?._id) {
      getImages();
    }
  }, [trip, getOrganizer, getImages]);

  const handleCardClick = (event) => {
    if (event.target.id === 'manageButton' || event.target.id === 'startButton')
      return;
    navigate(`/trip/${trip._id}`);
  };

  return (
    <>
      <Card
        onClick={handleCardClick}
        className={`${!large && 'max-w-lg flex-col '} relative flex rounded-lg bg-bright shadow-none transition-all hover:scale-105 hover:cursor-pointer hover:shadow-md`}
      >
        <CardMedia
          component="img"
          image={image}
          alt="Trip Image"
          className={`object-cover ${large ? 'h-60 max-h-60 max-w-[30%]' : 'h-40 max-h-40'} `}
        />
        {large ? (
          <CardContent className="flex w-full flex-1 flex-col justify-between p-4">
            <Box className="flex justify-between">
              <Box className="flex flex-col">
                <span className="col-span-3 text-xl font-bold">
                  {trip?.shortTitle}
                </span>
                <p className="mt-2 flex">
                  <MapPinIcon className="mr-1" />
                  {trip?.location.city}, {trip?.location.country}
                </p>
                <p className="mt-2 flex">
                  <CalendarIcon className="mr-1" />
                  {getFormattedDate(trip?.dateRange.startDate)} -{' '}
                  {getFormattedDate(trip?.dateRange.endDate)}
                </p>
              </Box>
              {organizer?._id === user?._id && large && (
                <IconButton
                  id="manageButton"
                  className="btn btn-white h-fit w-fit px-8 text-lg"
                  onClick={() => {
                    navigate(`/manageTrip/${trip?._id}`);
                    window.scrollTo(0, 0);
                  }}
                >
                  <ArrowRightIcon /> Manage
                </IconButton>
              )}
            </Box>
            <Box className="flex items-end justify-between space-x-6">
              <Box className="flex flex-1 flex-col">
                <span className="flex">
                  {trip?.spots?.totalSpots - trip?.spots?.availableSpots}/
                  {trip?.spots?.totalSpots}
                  <UsersIcon className="mx-1" /> spots booked.{' '}
                </span>
                <LinearProgress
                  className={`${requiredSpotsReached ? ' [&_span]:bg-gradient-to-l [&_span]:to-light' : ' [&_span]:bg-gray-500'} mb-2 mt-3 h-3 max-w-[300px] rounded-full bg-white [&_span]:rounded-full  [&_span]:from-primary`}
                  variant="determinate"
                  value={
                    ((trip?.spots?.totalSpots - trip?.spots?.availableSpots) /
                      trip?.spots?.totalSpots) *
                    100
                  }
                />
                {!requiredSpotsReached ? (
                  <p>
                    {trip?.spots?.requiredSpots -
                      (trip?.spots?.totalSpots -
                        trip?.spots?.availableSpots)}{' '}
                    more to reach required spots.
                  </p>
                ) : (
                  <span className="">Required spots reached!</span>
                )}
              </Box>
              {organizer?._id !== user._id && (
                <div>
                  <p className="mb-2">Trip organizer:</p>
                  <div className="flex flex-row items-center justify-end self-end">
                    <Avatar
                      src={organizer?.profilePicture?.url}
                      alt="avatar"
                      className="mr-3 h-12 w-12 bg-white [&_svg]:mr-0"
                    >
                      {organizer?.firstName ? (
                        <>{organizer?.firstName[0]}</>
                      ) : (
                        <UserIcon className="dark-icon" />
                      )}
                    </Avatar>
                    <div className="mr-3 flex flex-col">
                      <p className="capitalize">
                        {organizer?.firstName} {organizer?.lastName?.charAt(0)}.
                      </p>
                      <div className="flex flex-row items-center">
                        <p>{organizer?.rating || 'N/A'}</p>
                        <Star className="h-6 w-6 fill-yellow-400 text-yellow-600" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Box>
          </CardContent>
        ) : (
          <CardContent className={`grid grid-cols-4 gap-y-2`}>
            <span className="cut-text col-span-3 text-xl font-bold">
              {trip?.shortTitle}
            </span>
            <span className="flex flex-row items-center justify-end text-lg">
              <User className="h-6 w-6" />
              {trip?.spots?.totalSpots - trip?.spots?.availableSpots}/
              {trip?.spots.totalSpots}
            </span>
            <p className="cut-text col-span-3 row-start-2">
              {trip?.location.city}, {trip?.location.country}
            </p>

            <p className="cut-text col-span-2 row-start-3">
              {getFormattedDay(trip?.dateRange.startDate)} -{' '}
              {getFormattedDay(trip?.dateRange.endDate)}
            </p>
            <p className="cut-text col-span-2 row-start-4 font-bold">
              € {Math.round(trip?.priceRange.minPrice)} -{' '}
              {Math.round(trip?.priceRange.maxPrice)}
            </p>
            <div className="cut-text col-span-2 row-span-2 row-start-3 flex flex-row items-center justify-end self-end">
              <div className="mr-3 flex max-w-[60%] flex-col items-end">
                <p className="cut-text max-w-full capitalize">
                  {organizer.firstName}
                </p>
                <div className="flex flex-row items-center">
                  <Star className="h-6 w-6 fill-yellow-400 text-yellow-600" />
                  <p>{organizer.rating || 'N/A'}</p>
                </div>
              </div>
              {organizer.profilePicture && (
                <Avatar
                  src={organizer.profilePicture.url}
                  alt={`Profile of ${organizer.firstName}`}
                />
              )}{' '}
            </div>
          </CardContent>
        )}
      </Card>
    </>
  );
}

TripCard.propTypes = {
  trip: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    shortTitle: PropTypes.string.isRequired,
    organizer: PropTypes.object.isRequired,
    spots: PropTypes.shape({
      availableSpots: PropTypes.number.isRequired,
      totalSpots: PropTypes.number.isRequired,
      requiredSpots: PropTypes.number.isRequired,
    }).isRequired,
    location: PropTypes.shape({
      city: PropTypes.string.isRequired,
      country: PropTypes.string.isRequired,
    }).isRequired,
    dateRange: PropTypes.shape({
      startDate: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
    }).isRequired,
    priceRange: PropTypes.shape({
      minPrice: PropTypes.number.isRequired,
      maxPrice: PropTypes.number.isRequired,
    }).isRequired,
    categories: PropTypes.arrayOf(PropTypes.array).isRequired,
  }).isRequired,
  large: PropTypes.bool,
};
