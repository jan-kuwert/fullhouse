import {
  Building2Icon,
  CarIcon,
  HandMetalIcon,
  MountainSnowIcon,
  PartyPopperIcon,
  SmilePlusIcon,
  SnowflakeIcon,
  TreesIcon,
  VenetianMaskIcon,
  WavesIcon,
} from 'lucide-react';
import PropTypes from 'prop-types';
import { createContext, useContext, useState } from 'react';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  //default values for search fields when filter modal is opened
  const defaultPriceRange = [0, 5000]; //price slider can be between 0 and 5000 (number input can handle more)
  const defaultSpotsRange = [0, 30];

  //search data fields
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minPrice, setMinPrice] = useState(defaultPriceRange[0]);
  const [maxPrice, setMaxPrice] = useState(defaultPriceRange[1]);
  const [minSpots, setMinSpots] = useState(defaultSpotsRange[0]);
  const [maxSpots, setMaxSpots] = useState(defaultSpotsRange[1]);
  const [categories, setCategories] = useState([]);

  //array of icons and category names to render the filters
  const tripCategoriesArray = [
    [<TreesIcon key="" />, 'Nature & Wildlife'],
    [<MountainSnowIcon key="" />, 'Adventure & Thrill'],
    [<SnowflakeIcon key="" />, 'Ski & Snow Activities'],
    [<WavesIcon key="" />, 'Beach & Water Activities'],
    [<PartyPopperIcon key="" />, 'Party & Nightlife'],
    [<HandMetalIcon key="" />, 'Special Interest'],
    [<SmilePlusIcon key="" />, 'Wellness'],
    [<CarIcon key="" />, 'Road Trip'],
    [<Building2Icon key="" />, 'Urban Exploration'],
    [<VenetianMaskIcon key="" />, 'Events'],
  ];

  //data to render used filters on landingpage
  const [categoryIcons, setCategoryIcons] = useState([]); //icons of selected categories

  const handleTextChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const handleMinPriceChange = (event) => {
    setMinPrice(event.target.value);
  };

  const handleMaxPriceChange = (event) => {
    setMaxPrice(event.target.value);
  };

  const handleMinSpotsChange = (event) => {
    setMinSpots(event.target.value);
  };

  const handleMaxSpotsChange = (event) => {
    setMaxSpots(event.target.value);
  };

  const handleCategoriesChange = (value) => {
    setCategories(value);
  };

  return (
    <SearchContext.Provider
      value={{
        searchText,
        startDate,
        endDate,
        minPrice,
        maxPrice,
        minSpots,
        maxSpots,
        categories,
        categoryIcons,
        handleTextChange,
        handleStartDateChange,
        handleEndDateChange,
        handleMinPriceChange,
        handleMaxPriceChange,
        handleMinSpotsChange,
        handleMaxSpotsChange,
        handleCategoriesChange,
        setCategoryIcons,
        defaultPriceRange,
        defaultSpotsRange,
        tripCategoriesArray,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  return useContext(SearchContext);
};

SearchProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
