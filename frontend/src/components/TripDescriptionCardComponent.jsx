import { Box, Chip } from '@mui/material';
import { MapPin, StarIcon } from 'lucide-react';
import PropTypes from 'prop-types';
import { useSearch } from '../provider/SearchProvider';

export default function TripDescriptionCard({
  tripDescription,
  tripLocation,
  tripCategories,
  organizerName,
  organizerAge,
  organizerLocation,
  organizerImage,
  organizerBio,
  organizerRating,
}) {
  const { tripCategoriesArray } = useSearch();

  const getIconByName = (categoryName) => {
    const row = tripCategoriesArray.find(
      ([icon, name]) => name === categoryName
    );
    return row[0];
  };
  
  return (
    // div for the trip description card
    <div>
      {/* Left part: Trip location and category icons */}
      <div className="flex items-center space-x-2">
        <MapPin />
        <span className="text-lg">
          {tripLocation.city}, {tripLocation.country}{' '}
        </span>
      </div>
      <div className="relative flex items-center">
        <div className="flex items-center overflow-scroll pr-10">
          {tripCategories.map((category) => (
            <Chip
              key={category}
              icon={getIconByName(category)}
              label={category}
              className="category-chip scroll my-4 hover:scale-100"
            ></Chip>
          ))}
        </div>
        <Box className="absolute bottom-0 right-0 top-0 w-10 bg-gradient-to-r from-transparent to-white"></Box>
      </div>
      {/* Left part: Description + text */}
      <h2 className="mt-4 text-2xl">Description</h2>
      <p className="mb-10 mt-2">{tripDescription}</p>

      {/* Left part: Organizer Info */}
      <h2 className="mt-4 text-2xl">Meet the organizer</h2>
      <div className="mt-4 flex items-center space-x-4">
        <img
          src={organizerImage} // Replace with actual organizer image URL
          alt="Organizer"
          className="h-16 w-16 rounded-full object-cover"
        />
        <div className="flex-grow">
          <h3 className="text-xl">
            {organizerName} ({organizerAge})
          </h3>
          <p className="text-gray-600">
            {organizerLocation.city}, {organizerLocation.country}
          </p>
        </div>
        { organizerRating && (
          <div className="flex items-center">
            <StarIcon className="fill-yellow-500 text-yellow-500" />
            <span className="ml-1 text-lg">{organizerRating}</span>
          </div>
        )}
      </div>
      <p className="mt-4">{organizerBio}</p>
    </div>
  );
}

// Prop types for the TripDescriptionCard component
TripDescriptionCard.propTypes = {
  tripDescription: PropTypes.string.isRequired,
  tripLocation: PropTypes.shape({
    city: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
  }).isRequired,
  organizerName: PropTypes.string.isRequired,
  organizerAge: PropTypes.number.isRequired,
  organizerLocation: PropTypes.shape({
    city: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
  }).isRequired,
  organizerImage: PropTypes.string.isRequired, //unsure about this
  organizerBio: PropTypes.string.isRequired,
  organizerRating: PropTypes.number, // organizerRating is not required
  tripCategories: PropTypes.array.isRequired,
};
