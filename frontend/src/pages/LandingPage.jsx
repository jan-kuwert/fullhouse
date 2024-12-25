import {
  Box,
  Chip,
  Grid,
  IconButton,
  Pagination,
  Skeleton,
} from '@mui/material';
import axios from 'axios';
import {
  CalendarIcon,
  EuroIcon,
  FilterIcon,
  PlusIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import TripCard from '../components/TripCardComponent';
import FilterModal from '../modals/FilterModal';
import { useAuth } from '../provider/AuthenticationProvider.jsx';
import { useSearch } from '../provider/SearchProvider';

const LandingPage = ({ setOpenModal }) => {
  const {
    searchText,
    startDate,
    endDate,
    minPrice,
    maxPrice,
    minSpots,
    maxSpots,
    categories,
    categoryIcons,
    defaultPriceRange,
    defaultSpotsRange,
    handleStartDateChange,
    handleEndDateChange,
    handleMinPriceChange,
    handleMaxPriceChange,
    handleMinSpotsChange,
    handleMaxSpotsChange,
    handleCategoriesChange,
    setCategoryIcons,
  } = useSearch();

  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTrips, setTotalTrips] = useState(0);

  const [openFilterModal, setOpenFilterModal] = useState(false);
  const [categoryHovered, setCategoryHovered] = useState([]);
  const [priceHovered, setPriceHovered] = useState(false);
  const [spotsHovered, setSpotsHovered] = useState(false);
  const [datesHovered, setDatesHovered] = useState(false);
  const { user } = useAuth();

  const [isBottom, setIsBottom] = useState(false);

  const handleScroll = () => {
    const isAtTop =
      window.innerHeight + document.documentElement.scrollTop ===
      document.documentElement.offsetHeight;
    setIsBottom(!isAtTop);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCloseFilterModal = () => {
    setOpenFilterModal(false);
  };

  const handleOpenFilterModal = () => {
    setOpenFilterModal(true);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const fetchTrips = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        import.meta.env.VITE_BACKEND_URL + '/search/search_trips',
        {
          params: {
            searchText,
            startDate,
            endDate,
            minPrice,
            maxPrice,
            minSpots,
            maxSpots,
            categories,
            page,
            limit: 24,
          },
        }
      );
      const futureTrips = response.data.trips.filter(
        (trip) => new Date(trip.dateRange.startDate) > new Date()
      );
      setTrips(futureTrips);
      setTotalPages(response.data.totalPages);
      setTotalTrips(response.data.totalTrips);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setIsLoading(false);
    }
  }, [
    searchText,
    startDate,
    endDate,
    minPrice,
    maxPrice,
    minSpots,
    maxSpots,
    categories,
    page,
  ]);

  useEffect(() => {
    fetchTrips();
  }, [
    searchText,
    startDate,
    endDate,
    minPrice,
    maxPrice,
    minSpots,
    maxSpots,
    categories,
    page,
    fetchTrips,
  ]);

  const handleHovered = (id, value, i = '') => {
    const hoveredTemp = [];
    switch (id) {
      case 'categories':
        hoveredTemp[i] = value;
        setCategoryHovered(hoveredTemp);
        break;
      case 'price':
        setPriceHovered(value);
        break;
      case 'spots':
        setSpotsHovered(value);
        break;
      case 'dates':
        setDatesHovered(value);
        break;
    }
  };

  return (
    <Box className="flex min-h-[calc(100vh-160px)] w-full flex-col items-center">
      {/* Top area with filter button and active filters */}
      <Box className="flex w-full px-12 py-2">
        <Box className="flex flex-wrap">
          {(startDate !== '' || endDate !== '') && (
            <Chip
              icon={datesHovered ? <XIcon /> : <CalendarIcon />}
              label={`${startDate && 'from'} ${startDate} ${endDate && 'to'} ${endDate}`}
              onClick={() => {
                handleStartDateChange({
                  target: { value: '' },
                });
                handleEndDateChange({
                  target: { value: '' },
                });
              }}
              onMouseEnter={() => handleHovered('dates', true)}
              onMouseLeave={() => handleHovered('dates', false)}
              className="category-chip mb-4 cursor-pointer"
            />
          )}
          {(minPrice != defaultPriceRange[0] ||
            maxPrice != defaultPriceRange[1]) && (
            <Chip
              icon={priceHovered ? <XIcon /> : <EuroIcon />}
              label={`${minPrice} - ${maxPrice}`}
              onClick={() => {
                handleMinPriceChange({
                  target: { value: defaultPriceRange[0] },
                });
                handleMaxPriceChange({
                  target: { value: defaultPriceRange[1] },
                });
              }}
              onMouseEnter={() => handleHovered('price', true)}
              onMouseLeave={() => handleHovered('price', false)}
              className="category-chip mb-4 cursor-pointer"
            />
          )}
          {(minSpots !== defaultSpotsRange[0] ||
            maxSpots !== defaultSpotsRange[1]) && (
            <Chip
              icon={spotsHovered ? <XIcon /> : <UsersIcon />}
              label={`${minSpots} - ${maxSpots}`}
              onClick={() => {
                handleMinSpotsChange({
                  target: { value: defaultSpotsRange[0] },
                });
                handleMaxSpotsChange({
                  target: { value: defaultSpotsRange[1] },
                });
              }}
              onMouseEnter={() => handleHovered('spots', true)}
              onMouseLeave={() => handleHovered('spots', false)}
              className="category-chip mb-4 cursor-pointer"
            />
          )}
          {categoryIcons &&
            categoryIcons.map((icon, index) => (
              <Chip
                key={index}
                icon={categoryHovered[index] ? <XIcon /> : icon}
                label={categories[index]}
                onClick={() => {
                  setCategoryIcons(categoryIcons.filter((_, i) => i !== index));
                  handleCategoriesChange(
                    categories.filter((_, i) => i !== index)
                  );
                }}
                onMouseEnter={() => handleHovered('categories', true, index)}
                onMouseLeave={() => handleHovered('categories', false, index)}
                className="category-chip mb-4 cursor-pointer"
              />
            ))}
        </Box>
        <IconButton
          className="btn btn-bright ml-auto h-fit w-40 text-base shadow-none"
          onClick={handleOpenFilterModal}
        >
          <FilterIcon /> Filter
        </IconButton>
        <FilterModal
          open={openFilterModal}
          handleClose={handleCloseFilterModal}
        />
      </Box>

      {/* Grid of trips */}
      <Grid
        container
        spacing={3}
        className="-ml-[24px] mb-12 w-[calc(100%+24px)] px-12"
      >
        {trips.map((trip) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={trip._id}>
            <TripCard trip={trip} />
          </Grid>
        ))}
        {isLoading &&
          Array.from({ length: 12 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Skeleton
                variant="rectangular"
                className="h-[325px] w-full rounded-xl bg-bright"
              />
            </Grid>
          ))}
      </Grid>

      {/* Pagination */}
      <Box mt={3}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          className="[&_button]:bg-bright"
          size="large" // Set the size of the pagination
          sx={{
            '& .MuiPaginationItem-root': {
              fontSize: '1.5rem',
              padding: '10px 20px',
            },
          }}
        />
      </Box>

      {/* Button for creating new trips */}
      {user && (
        <IconButton
  className={`btn btn-primary fixed ${isBottom ? 'bottom-24' : 'bottom-3'} right-12 w-48 text-lg`}
          onClick={() => setOpenModal('createTrip')}
        >
          <PlusIcon />
          Create Trip
        </IconButton>
      )}
    </Box>
  );
};

LandingPage.propTypes = {
  setOpenModal: PropTypes.func.isRequired,
};

export default LandingPage;
