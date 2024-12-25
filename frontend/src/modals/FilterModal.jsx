import {
  Box,
  Divider,
  IconButton,
  InputAdornment,
  Slider,
  TextField,
  Typography,
} from '@mui/material';
import {
  EuroIcon,
  FilterIcon,
  MinusIcon,
  Undo2Icon,
  UsersIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import CategoriesComponent from '../components/CategoriesComponent';
import { useSearch } from '../provider/SearchProvider';
import BaseModal from './BaseModal';

export default function FilterModal({ handleClose, open }) {
  // Get searchQuery, handleSearch and clearSearch from SearchProvider
  const {
    startDate,
    endDate,
    minPrice,
    maxPrice,
    minSpots,
    maxSpots,
    categories,
    categoryIcons,
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
  } = useSearch();

  // saves form errors for each field if field is present it has an error and message is within
  const [formError, setFormError] = useState({});

  // Slicers for price and spots
  const [priceSlider, setPriceSlider] = useState([
    defaultPriceRange[0],
    defaultPriceRange[1],
  ]);
  const handlePriceSliderChange = (event, value) => {
    setPriceSlider(value);
    handleMinPriceChange({ target: { value: value[0] } });
    handleMaxPriceChange({ target: { value: value[1] } });
  };

  const [guestsSlider, setGuestsSlider] = useState([
    defaultSpotsRange[0],
    defaultSpotsRange[1],
  ]);
  const handleGuestsSliderChange = (event, value) => {
    setGuestsSlider(value);
    handleMinSpotsChange({ target: { value: value[0] } });
    handleMaxSpotsChange({ target: { value: value[1] } });
  };

  useEffect(() => {
    setPriceSlider([minPrice, maxPrice]);
    setGuestsSlider([minSpots, maxSpots]);
  }, [minPrice, maxPrice, minSpots, maxSpots]);

  useEffect(() => {}, []);

  //function to add and remove errors from the formError object
  const addFormError = (id, errorMessage) => {
    setFormError((formError) => ({
      ...formError,
      [id]: {
        message: errorMessage,
      },
    }));
  };
  const removeFormError = (id) => {
    setFormError((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[id];
      return newErrors;
    });
  };

  //functions for form
  //validate form fields, can check only single field, a page, or all
  //if value is passed it checks the value instead of the state (since setState is async and value is the current value of the input field)
  const validateForm = (id, value) => {
    const numberRegex = /^\d+(?:[.,]\d{1,2})?$/; //only numbers allowed with 2 decimal places at most

    let hasErrors = false;

    switch (id) {
      case 'startDate':
        if (!value || new Date(value) > new Date(endDate)) {
          addFormError(id, 'Start date cannot be later than end date');
          hasErrors = true;
        } else {
          if (formError.startDate) removeFormError(id);
        }
        break;

      case 'endDate':
        if (!value || new Date(value) < new Date(startDate)) {
          addFormError(id, 'End date cannot be earlier than start date');
          hasErrors = true;
        } else {
          if (formError.endDate) removeFormError(id);
        }
        break;

      case 'minPrice':
        if (
          !value ||
          !numberRegex.test(value) ||
          isNaN(parseFloat(value)) ||
          parseFloat(value) > parseFloat(maxPrice)
        ) {
          addFormError(
            id,
            'Min price (number) cannot be greater than max price'
          );
          hasErrors = true;
        } else {
          if (formError.minPrice) removeFormError(id);
        }
        break;

      case 'maxPrice':
        if (
          !value ||
          !numberRegex.test(value) ||
          isNaN(parseFloat(value)) ||
          parseFloat(value) < parseFloat(minPrice)
        ) {
          addFormError(id, 'Max price (number) cannot be less than min price');
          hasErrors = true;
        } else {
          if (formError.maxPrice) removeFormError(id);
        }
        break;

      case 'minSpots':
        if (
          !value ||
          !numberRegex.test(value) ||
          !Number.isInteger(parseInt(value)) ||
          parseInt(value) > parseInt(maxSpots)
        ) {
          addFormError(
            id,
            'Min spots (number) cannot be greater than max spots'
          );
          hasErrors = true;
        } else {
          if (formError.minSpots) removeFormError(id);
        }
        break;

      case 'maxSpots':
        if (
          !value ||
          !numberRegex.test(value) ||
          !Number.isInteger(parseInt(value)) ||
          parseInt(value) < parseInt(minSpots)
        ) {
          addFormError(id, 'Max spots (number) cannot be less than min spots');
          hasErrors = true;
        } else {
          if (formError.maxSpots) removeFormError(id);
        }
        break;

      case 'categories':
        if (
          (!value && categories.length <= 0) ||
          (value && value.length <= 0)
        ) {
          addFormError(id, 'Please select at least one category.');
          hasErrors = true;
        } else {
          if (formError.categories) removeFormError(id);
        }
        break;

      default:
        break;
    }

    return !hasErrors;
  };

  const handleChange = (event) => {
    const { id, value } = event.target;
    switch (id) {
      case 'startDate':
        handleStartDateChange({ target: { value } });
        break;
      case 'endDate':
        handleEndDateChange({ target: { value } });
        break;
      case 'minPrice':
        handleMinPriceChange({ target: { value } });
        break;
      case 'maxPrice':
        handleMaxPriceChange({ target: { value } });
        break;
      case 'minSpots':
        handleMinSpotsChange({ target: { value } });
        break;
      case 'maxSpots':
        handleMaxSpotsChange({ target: { value } });
        break;
      case 'categories':
        handleCategoriesChange(value);
        break;
    }
    validateForm(id, value);
  };

  //function to handle filter button click
  const handleFilterClick = () => {
    handleClose();
  };

  const handleResetFilter = () => {
    handleStartDateChange({ target: { value: '' } });
    handleEndDateChange({ target: { value: '' } });
    handleMinPriceChange({ target: { value: defaultPriceRange[0] } });
    handleMaxPriceChange({ target: { value: defaultPriceRange[1] } });
    handleMinSpotsChange({ target: { value: defaultSpotsRange[0] } });
    handleMaxSpotsChange({ target: { value: defaultSpotsRange[1] } });
    handleCategoriesChange([]);
    setPriceSlider([defaultPriceRange[0], defaultPriceRange[1]]);
    setGuestsSlider([0, 30]);
    setCategoryIcons([]);
  };

  return (
    <BaseModal
      title="Filters"
      open={open}
      handleClose={handleClose}
      description="Modal to filter search results"
      width="w-[750px]"
      content={
        <Box
          component="form"
          className="flex w-full flex-col"
          onChange={handleChange}
        >
          <Box className="mb-4 flex flex-col items-center gap-4">
            <Divider className="w-full" />
            <Typography className="self-start text-xl ">Date</Typography>
            <div className="flex w-1/2 min-w-[350px] items-center">
              <TextField
                type="date"
                label="Start Date"
                id="startDate"
                className={`input-field [&_input:focus]:text-dark ${startDate == '' ? '[&_input]:text-transparent' : '[&_input]:text-dark'} [&_svg]:text-blue-500`}
                value={startDate}
                error={!!formError.startDate}
              />

              <p className="mx-2">
                <MinusIcon className="w-3" />
              </p>
              <TextField
                type="date"
                label="End Date"
                id="endDate"
                className={`input-field [&_input:focus]:text-dark ${endDate == '' ? '[&_input]:text-transparent' : '[&_input]:text-dark'} `}
                value={endDate}
                error={!!formError.endDate}
              />
            </div>
            {formError.startDate && (
              <p className="helper-text ">{formError.startDate.message}</p>
            )}
            {formError.endDate && (
              <p className="helper-text">{formError.endDate.message}</p>
            )}
          </Box>
          <Box className="mb-4 flex flex-col items-center gap-4">
            <Divider className="w-full" />
            <Typography className="self-start text-xl">Price</Typography>
            <Slider
              className="slider w-[80%]"
              getAriaLabel={() => 'Price range'}
              min={defaultPriceRange[0]}
              step={10}
              max={defaultPriceRange[1]}
              value={priceSlider}
              onChange={handlePriceSliderChange}
            />
            <div className="flex w-1/2 min-w-[350px] items-center">
              <TextField
                label="Min. Price"
                id="minPrice"
                className="input-field"
                value={minPrice}
                error={!!formError.minPrice}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <EuroIcon className="dark-icon" />
                    </InputAdornment>
                  ),
                }}
              />
              <p className="mx-2">
                <MinusIcon className="w-3" />
              </p>
              <TextField
                label="Max. Price"
                id="maxPrice"
                className="input-field"
                value={maxPrice}
                error={!!formError.maxPrice}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <EuroIcon className="dark-icon" />
                    </InputAdornment>
                  ),
                }}
              />
            </div>
            {formError.minPrice && (
              <p className="helper-text">{formError.minPrice.message}</p>
            )}
            {formError.maxPrice && (
              <p className="helper-text">{formError.maxPrice.message}</p>
            )}
          </Box>
          <Box className="mb-4 flex flex-col items-center gap-4">
            <Divider className="w-full" />
            <Typography className="self-start text-xl">
              Number of Guests
            </Typography>
            <Slider
              className="slider w-[80%]"
              getAriaLabel={() => 'Guest range'}
              min={defaultSpotsRange[0]}
              max={defaultSpotsRange[1]}
              value={guestsSlider}
              onChange={handleGuestsSliderChange}
            />
            <div className="flex w-1/2 min-w-[350px] items-center">
              <TextField
                label="Min Spots"
                id="minSpots"
                className="input-field"
                required
                value={minSpots}
                error={!!formError.minSpots}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <UsersIcon className="dark-icon" />
                    </InputAdornment>
                  ),
                }}
              />

              <p className="mx-2">
                <MinusIcon className="w-3" />
              </p>
              <TextField
                label="Max Spots"
                id="maxSpots"
                className="input-field"
                required
                value={maxSpots}
                error={!!formError.maxSpots}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <UsersIcon className="dark-icon" />
                    </InputAdornment>
                  ),
                }}
              />
            </div>
            {formError.maxSpots && (
              <p className="helper-text">{formError.maxSpots.message}</p>
            )}
            {formError.minSpots && (
              <p className="helper-text">{formError.minSpots.message}</p>
            )}
          </Box>

          <Box className="flex flex-col items-center gap-4">
            <Divider className="w-full" />
            <Typography className="self-start text-xl ">Categories</Typography>
            <CategoriesComponent
              selectedCategories={categories}
              setSelectedCategories={handleCategoriesChange}
              selectedIcons={categoryIcons}
              setSelectedIcons={setCategoryIcons}
            />
            <p className="helper-text">
              {formError.categories ? formError.categories.message : ''}
            </p>
          </Box>
          <Box className="flex justify-between">
            <IconButton
              className="btn my-3 w-fit self-start px-4 text-dark"
              onClick={handleResetFilter}
            >
              <Undo2Icon className="h-6 w-6" /> Reset Filter
            </IconButton>
            <IconButton
              className="btn btn-primary my-3"
              onClick={handleFilterClick}
            >
              <FilterIcon className="h-6 w-6" /> Filter Results
            </IconButton>
          </Box>
        </Box>
      }
    />
  );
}
