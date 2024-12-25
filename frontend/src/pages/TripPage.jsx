import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import HeaderComponent from '../components/HeaderComponent.jsx';
import MapComponent from '../components/MapComponent.jsx';
import TripBookingInfoCard from '../components/TripBookingInfoCardComponent.jsx';
import TripDescriptionCard from '../components/TripDescriptionCardComponent.jsx';
import TripImageGallery from '../components/TripImageGalleryComponent.jsx';
import TripReviewCard from '../components/TripReviewCardComponent.jsx';

//Function to compute the age of the organizer
function getAge(user_birthdate) {
  // convert birthdate to date object
  const dateOfBirth = new Date(user_birthdate);
  // get current date
  const currentDate = new Date();

  // calculate age
  let age = currentDate.getFullYear() - dateOfBirth.getFullYear();
  const monthDifference = currentDate.getMonth() - dateOfBirth.getMonth();
  const dayDifference = currentDate.getDate() - dateOfBirth.getDate();

  // Adjust the age if the birthday hasn't occurred yet this year
  if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
    age--;
  }

  return age;
}

// Extract the coordinates from the Google Maps LInk
// Syntax of Google Maps Link : https://www.google.de/maps/place/Grand+Hotel+Kitzbühel/@47.4435809,12.3901084,17z/data=blablabla
// After the @ symbol, the latitude and longitude are separated by a comma, the rest is not needed
const extractCoordinates = (mapsLink) => {
  const coordinates = mapsLink.split('@')[1].split(',');
  return {
    latitude: parseFloat(coordinates[0]),
    longitude: parseFloat(coordinates[1]),
  };
};

export default function TripPage({ setOpenModal, setModalTrip }) {
  // Use the useState hook to store the trip data
  const [trip, setTrip] = useState(null);
  const [organizer, setOrganizer] = useState(null);
  // read param trip_id from URL
  const { trip_id } = useParams();
  const [coordinates, setCoordinates] = useState({ latitude: 0, longitude: 0 });

  // Use the useEffect hook to fetch the trip data from the backend
  useEffect(() => {
    axios
      .get(import.meta.env.VITE_BACKEND_URL + `/trip/getTrips/${trip_id}`)
      .then((response) => {
        setTrip(response.data);
        setModalTrip(response.data);
        setOrganizer(response.data.organizer);
        setCoordinates(extractCoordinates(response.data.location.mapsLink));
      })
      .catch((error) => console.error('Error:', error));
  }, []);

  if (!trip) {  
    return (
      <div>
        <Box className='flex'>
          <CircularProgress />
        </Box>
      </div>
    );
  }

  return (
    //  App Bar at the top of the page with a back button, a title, and a button to navigate to the Accomodation Details page
    <div>
      {/*Header component for the trip page*/}
      <HeaderComponent
        title={trip.title}
        showButton={true}
        link={trip.listingLink}
      />

      {/* Image Gallery with a large image on the left and a grid of smaller images on the right */}
      <TripImageGallery trip_id={trip_id} />

      {/* Description div of the trip, includes the location, description, organizer info, and price */}
      <div className="container mx-auto mt-4 flex">
        {/* Header icons for location and type */}
        <div className="mr-16 w-full md:w-2/3">
          {/* Left part: Information trip */}
          <TripDescriptionCard
            tripDescription={trip.description}
            tripLocation={trip.location}
            tripCategories={trip.categories}
            organizerName={organizer.firstName}
            organizerAge={getAge(organizer.birthday)}
            organizerLocation={organizer.location}
            organizerImage={organizer.profilePicture.url}
            organizerBio={organizer.profileDescription}
            organizerRating={organizer.rating}
          />

          {/* Review cards for the reviews of the organizer */}
          {/*TODO: Create .map with fetched results when routes ready*/}
          <h2 className="mb-2 mt-4 text-2xl">Reviews</h2>
          <TripReviewCard organizer={trip.organizer} />
        </div>

        {/*Right side: Price and time information*/}
        <TripBookingInfoCard setOpenModal={setOpenModal} trip={trip} />
      </div>

      <div className="container mx-auto mb-28">
        <MapComponent
          latitude={coordinates.latitude}
          longitude={coordinates.longitude}
          mapsLink={trip.location.mapsLink}
        />
      </div>
    </div>
  );
}

TripPage.propTypes = {
  setOpenModal: PropTypes.func,
  setModalTrip: PropTypes.func,
};
