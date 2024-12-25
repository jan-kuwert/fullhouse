import { Box, Grid, Typography } from '@mui/material';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import HeaderComponent from '../components/HeaderComponent';
import TripCard from '../components/TripCardComponent';
import { useAuth } from '../provider/AuthenticationProvider';

export default function MyTripsPage() {
  const { user } = useAuth();
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [pastTrips, setPastTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrips = useCallback(async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_BACKEND_URL +
          `/trip/getAllTripsUserInvolvement/${user._id}`
      );
      const trips = response.data;
      const upcoming = trips.filter(
        (trip) => new Date(trip.dateRange.endDate) >= new Date()
      );
      const past = trips.filter(
        (trip) => new Date(trip.dateRange.endDate) < new Date()
      );
      setUpcomingTrips(upcoming);
      setPastTrips(past);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user._id) {
      fetchTrips();
    }
  }, [user, fetchTrips]);

  return (
    <Box className='min-h-[calc(100vh-272px)]'>
      <HeaderComponent title="My Trips"></HeaderComponent>
      <Box className="container mx-auto ">
        {/* Upcoming Trips */}
        <Typography className="mb-4 mt-6 text-2xl">Upcoming Trips</Typography>
        <Grid container spacing={3} className="w-full">
          {upcomingTrips.map((trip) => (
            <Grid item key={trip._id} md={12} lg={6} className="w-full">
              <TripCard trip={trip} large="true" />
            </Grid>
          ))}
        </Grid>
        {upcomingTrips.length === 0 && !isLoading && (
          <Typography className='mt-12 w-full text-center text-xl'>No upcoming trips.</Typography>
        )}
        {/* Past Trips */}
        <Typography className="mb-4 mt-12 text-2xl">Past Trips</Typography>
        <Grid container spacing={3}>
          {pastTrips.map((trip) => (
            <Grid item key={trip._id} sm={12} md={6} lg={3}>
              <TripCard trip={trip} />
            </Grid>
          ))}
        </Grid>
        {pastTrips.length === 0 && !isLoading && (
          <Typography className='mt-12 w-full text-center text-xl'> No past trips</Typography>
        )}
      </Box>{' '}
    </Box>
  );
}
