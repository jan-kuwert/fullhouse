import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Popover,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import {
  Building2Icon,
  CalendarIcon,
  EarthIcon,
  EuroIcon,
  ImagePlusIcon,
  LinkIcon,
  MapPinIcon,
  PenIcon,
  PlusIcon,
  SaveIcon,
  TypeIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CategoriesComponent from '../components/CategoriesComponent';
import DialogComponent from '../components/DialogComponent.jsx';
import HeaderComponent from '../components/HeaderComponent.jsx';
import { ManageTripSidebarComponent } from '../components/ManageTripSidebarComponent.jsx';
import UploadFileComponent from '../components/UploadFileComponent.jsx';
import { useAlert } from '../provider/AlertProvider.jsx';
import { useSearch } from '../provider/SearchProvider';

export default function ManageTripPage() {
  const { setAlert } = useAlert();
  const [editMode, setEditMode] = useState(false);
  const [formError, setFormError] = useState({});
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [title, setTitle] = useState('');
  const [shortTitle, setShortTitle] = useState('');
  const [description, setDescription] = useState('');
  const [trip_pictures, setPictures] = useState([]);
  const [newPictures, setNewPictures] = useState([]);
  const [removedPictures, setRemovedPictures] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalSpots, setTotalSpots] = useState(0);
  const [availableSpots, setAvailableSpots] = useState(0);
  const [requiredSpots, setRequiredSpots] = useState(0);
  const [price, setPrice] = useState(0);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [listingLink, setListingLink] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [mapsLink, setMapsLink] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryIcons, setCategoryIcons] = useState([]);
  const [categoryHovered, setCategoryHovered] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const opencategoriesPopover = Boolean(anchorEl);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const { tripCategoriesArray } = useSearch();

  const addFormError = (id, errorMessage) => {
    setFormError((formError) => ({
      ...formError,
      [id]: {
        message: errorMessage,
      },
    }));
  };

  const removeFormError = (id) => {
    var temp = { ...formError };
    delete temp[id];
    setFormError({ ...temp });
  };

  //functions for form
  //validate form fields, can check only single field, a page, or all
  //if value is passed it checks the value instead of the state (since setState is async and value is the current value of the input field)
  const validateForm = (id, value) => {
    const titleRegex = /^[A-Za-zäöüÄÖÜß\s\d!\-&,.:]{2,120}$/;
    const shortTitleRegex = /^[A-Za-zäöüÄÖÜß\s\d!\-&.,:]{2,30}$/;
    const descriptionRegex = /^[A-Za-zäöüÄÖÜß\s\d!\-&.,:]{150,1200}$/;
    const googleMapsLink =
      /^https:\/\/www.google.[A-Za-z]{2,3}\/maps\/place\/[A-Za-zäöüÄÖÜß\d.,:+!_&%=\-/@?]{10,}$/;
    const linkRegex =
      /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    const spotsRegex = /^(1[0-9]{0,2}|200|[2-9][0-9]?)$/; //number between 1-200
    const numberRegex = /^\d+(?:[.,]\d{1,2})?$/; //only numbers allowed with 2 decimal places at most

    var hasErrors = false; //if true form has errors (since error setter async need something to check against instantly)
    switch (id) {
      case 'title':
        // check input against regex and add or remove errors from the formError object
        if (
          (!value && !titleRegex.test(title)) ||
          (value && !titleRegex.test(value))
        ) {
          addFormError('title', 'Title must be between 2 and 120 characters');
          hasErrors = true;
        } else {
          if (formError.title) removeFormError('title');
        }
        if (id === 'title') break;
      // falls through
      case 'shorttitle':
        if (
          (!value && !shortTitleRegex.test(shortTitle)) ||
          (value && !shortTitleRegex.test(value))
        ) {
          addFormError(
            'shorttitle',
            'Short Title must be between 2 and 30 characters'
          );
          hasErrors = true;
        } else {
          if (formError.shorttitle) removeFormError('shorttitle');
        }
        if (id === 'shorttitle') break;
      //falls through
      case 'description':
        if (
          (!value && !descriptionRegex.test(description)) ||
          (value && !descriptionRegex.test(value))
        ) {
          addFormError(
            'description',
            'Description must be between 150 and 1200 characters including . , :'
          );
          hasErrors = true;
        } else {
          if (formError.description) removeFormError('description');
        }
        if (id === 'description') break;
      //falls through
      case 'categories':
        if (
          (!value && categories.length <= 0) ||
          (value && value.length <= 0)
        ) {
          addFormError(
            'categories',
            'Please add at least one category to your trip.'
          );
          hasErrors = true;
        } else {
          if (formError.categories) removeFormError('categories');
        }
        if (id === 'categories') break;
        if (id === 0) break;
      // falls through
      case 'pictures':
        if (trip_pictures?.length === 0) {
          addFormError('pictures', 'Please upload trip pictures');
          hasErrors = true;
        } else {
          if (formError.pictures) removeFormError('pictures');
        }
        if (id === 'pictures') break;
        if (id === 1) break;
      //falls through
      case 'listinglink':
        if (
          (!value && !linkRegex.test(listingLink)) ||
          (value && !linkRegex.test(value))
        ) {
          addFormError('listinglink', 'Invalid Link');
          hasErrors = true;
        } else {
          if (formError.listinglink) removeFormError('listinglink');
        }
        if (id === 'listinglink') break;
      //falls through
      case 'city':
        if (
          (!value && !titleRegex.test(city)) ||
          (value && !titleRegex.test(value))
        ) {
          addFormError('city', 'City must be between 2 and 120 characters');
          hasErrors = true;
        } else {
          if (formError.city) removeFormError('city');
        }
        if (id === 'city') break;
      //falls through
      case 'country':
        if (
          (!value && !titleRegex.test(country)) ||
          (value && !titleRegex.test(value))
        ) {
          addFormError(
            'country',
            'Country must be between 2 and 120 characters'
          );
          hasErrors = true;
        } else {
          if (formError.country) removeFormError('country');
        }
        if (id === 'country') break;
      //falls through
      case 'mapslink':
        if (
          (!value && !googleMapsLink.test(mapsLink)) ||
          (value && !googleMapsLink.test(value))
        ) {
          addFormError('mapslink', 'Invalid Link');
          hasErrors = true;
        } else {
          if (formError.mapslink) removeFormError('mapslink');
        }
        if (id === 'mapslink') break;
        if (id === 1) break;
      //falls through
      case 'totalspots':
        if (
          (!value && !spotsRegex.test(totalSpots)) ||
          (value && !spotsRegex.test(value))
        ) {
          addFormError(
            'totalspots',
            'Total Spots must be a number between 1 and 200'
          );
          hasErrors = true;
        } else {
          if (formError.totalspots) removeFormError('totalspots');
        }
        if (id === 'totalspots') break;
      //falls through
      case 'availablespots':
        if (
          (!value && parseInt(availableSpots) >= totalSpots) ||
          (value && parseInt(value) >= totalSpots) ||
          (!value && !spotsRegex.test(availableSpots)) ||
          (value && !spotsRegex.test(value))
        ) {
          addFormError(
            'availablespots',
            'Available Spots must be a number less than Total Spots'
          );
          hasErrors = true;
        } else {
          if (formError.availablespots) removeFormError('availablespots');
        }
        if (id === 'availablespots') break;
      //falls through
      case 'requiredspots':
        if (
          (!value && parseInt(requiredSpots) > availableSpots) ||
          (value && parseInt(value) > availableSpots) ||
          (!value && !spotsRegex.test(requiredSpots)) ||
          (value && !spotsRegex.test(value))
        ) {
          addFormError(
            'requiredspots',
            'Required Spots must be a number less or equal than Available Spots'
          );
          hasErrors = true;
        } else {
          if (formError.requiredspots) removeFormError('requiredspots');
        }
        if (id === 'requiredspots') break;
      //falls through
      case 'price':
        if (
          (!value && !numberRegex.test(price)) ||
          (value && !numberRegex.test(value))
        ) {
          addFormError(
            'price',
            'Price must be a number with max 2 decimal places'
          );
          hasErrors = true;
        } else {
          if (formError.price) removeFormError('price');
        }
        if (id === 'price') break;
      //falls through
      case 'startdate':
        if (
          (!value && startDate === '') ||
          (value && value === '') ||
          (!value && new Date() > new Date(startDate)) ||
          (value && new Date() > new Date(value))
        ) {
          addFormError('startdate', 'Start Date must be in the future.');
          hasErrors = true;
        } else {
          if (formError.startdate) removeFormError('startdate');
        }
        if (id === 'startdate') break;
      // falls through
      case 'enddate':
        if (
          (!value && endDate === '') ||
          (value && value === '') ||
          (!value && new Date(endDate) < new Date(startDate)) ||
          (value && new Date(value) < new Date(startDate))
        ) {
          addFormError('enddate', 'End Date muster be later than Start Date.');
          hasErrors = true;
        } else {
          if (formError.enddate) removeFormError('enddate');
        }
        if (id === 'enddate') break;
    }
    return !hasErrors; //returns true if no errors are present
  };

  const handleChange = (event) => {
    const { id, value } = event.target;
    switch (id) {
      case 'title':
        setTitle(value);
        break;
      case 'shorttitle':
        setShortTitle(value);
        break;
      case 'description':
        setDescription(value);
        break;
      case 'pictures':
        setPictures(value);
        break;
      case 'startdate':
        setStartDate(value);
        break;
      case 'enddate':
        setEndDate(value);
        break;
      case 'totalspots':
        setTotalSpots(value);
        break;
      case 'availablespots':
        setAvailableSpots(value);
        break;
      case 'requiredspots':
        setRequiredSpots(value);
        break;
      case 'price':
        setPrice(value);
        break;
      case 'minprice':
        setMinPrice(value);
        break;
      case 'maxprice':
        setMaxPrice(value);
        break;
      case 'listinglink':
        setListingLink(value);
        break;
      case 'city':
        setCity(value);
        break;
      case 'country':
        setCountry(value);
        break;
      case 'mapslink':
        setMapsLink(value);
        break;
      case 'categories':
        setCategories(value);
        break;
    }
    validateForm(id, value);
  };

  // Update pictures if exist
  const updateNewPictures = (newPictures) => {
    setNewPictures(newPictures);
  };

  const setInitCategoryIcons = useCallback(
    (categories) => {
      let tempIcons = [];
      categories.map((category) => {
        const icon = tripCategoriesArray.find(
          (element) => element[1] === category
        )[0];
        if (icon) tempIcons.push(icon);
      });
      setCategoryIcons(tempIcons);
    },
    [tripCategoriesArray]
  );

  // TODO: Get trip data from backend: Pictures is populated, has url to display directly
  const getTrip = useCallback(async () => {
    setLoading(true);
    axios.defaults.withCredentials = true;
    if (!tripId) return;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/trip/getTrips/${tripId}`
      );
      setTitle(response.data.title);
      setShortTitle(response.data.shortTitle);
      setDescription(response.data.description);
      setPictures(response.data.pictures);
      setStartDate(response.data.dateRange.startDate);
      setEndDate(response.data.dateRange.endDate);
      setTotalSpots(response.data.spots.totalSpots);
      setAvailableSpots(response.data.spots.availableSpots);
      setRequiredSpots(response.data.spots.requiredSpots);
      setPrice(response.data.priceRange.price);
      setMinPrice(response.data.priceRange.minPrice);
      setMaxPrice(response.data.priceRange.maxPrice);
      setListingLink(response.data.listingLink);
      setCity(response.data.location.city);
      setCountry(response.data.location.country);
      setMapsLink(response.data.location.mapsLink);
      setCategories(response.data.categories);
      setTrip(response.data); // additionally, set trip as a whole
      setInitCategoryIcons(response.data.categories);
    } catch (error) {
      console.error('Failed to get trip data:', error);
      setAlert('error', 'Failed to get Trip');
    } finally {
      setLoading(false);
    }
  }, [tripId, setAlert, setInitCategoryIcons]);

  // This effect will run once when the component mounts, fetching the trip data.
  useEffect(() => {
    getTrip();
  }, [tripId, getTrip]);

  // This function will save the trip data to the backend.
  const handleSave = async () => {
    setLoading(true);
    axios.defaults.withCredentials = true;
    const pictures = [
          ...trip_pictures.map((trip_picture) => trip_picture?._id),
          ...newPictures.flat(),
        ]
    if (validateForm()) {
      const editedTrip = {
        title,
        shortTitle,
        description,
        pictures,
        startDate,
        endDate,
        totalSpots,
        availableSpots,
        requiredSpots,
        price,
        minPrice,
        maxPrice,
        listingLink,
        city,
        country,
        mapsLink,
        categories,
      };
      try {
        const response = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/trip/update/${tripId}`,
          editedTrip,
          {
            withCredentials: true,
          }
        );
        setTrip(response.data);
        setTitle(response.data.title);
        setShortTitle(response.data.shortTitle);
        setDescription(response.data.description);
        setPictures(response.data.pictures);
        setStartDate(response.data.dateRange.startDate);
        setEndDate(response.data.dateRange.endDate);
        setTotalSpots(response.data.spots.totalSpots);
        setAvailableSpots(response.data.spots.availableSpots);
        setRequiredSpots(response.data.spots.requiredSpots);
        setPrice(response.data.priceRange.price);
        setMinPrice(response.data.priceRange.minPrice);
        setMaxPrice(response.data.priceRange.maxPrice);
        setListingLink(response.data.listingLink);
        setCity(response.data.location.city);
        setCountry(response.data.location.country);
        setMapsLink(response.data.location.mapsLink);
        setCategories(response.data.categories);
        setAlert('success', 'Trip updated successfully');
        setEditMode(false);
      } catch (error) {
        console.error('Failed to update trip data:', error);
        setAlert('error', 'Failed to update Trip');
      }
      setLoading(false);
    }
  };

  const removePicture = (index) => {
    let tempPictures = [...trip_pictures];
    let tempRemovedPictures = [...removedPictures];

    tempRemovedPictures.push(tempPictures.splice(index, 1));

    setPictures(tempPictures);
    setRemovedPictures(tempRemovedPictures);
  };

  // Set the edit mode
  const handleEdit = () => {
    setEditMode(true);
  };

  // This function cancels edit mode, resets form inputs to original values, and clears form errors.
  const handleCancel = () => {
    setEditMode(false);
    setCancelDialogOpen(false);
    setFormError({});
  };

  //function to handle the change of categories and validate
  const handleSetCategories = (selectedCategories) => {
    setCategories(selectedCategories);
    validateForm('categories', selectedCategories); //validate categories with value from handle since setter is async
  };

  // These functions handle opening and closing a popover
  const handleOpenPopover = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  // handles category hover state, ensuring it updates correctly even with rapid changes.
  const handleHoveredCategory = (value, i) => {
    const hoveredTemp = []; //dont get the values from categoryHovered otherwise on fast hovers they stay true since react cant udpate fast enough
    hoveredTemp[i] = value;
    setCategoryHovered(hoveredTemp);
  };

  return (
    <>
      <Box className="container mx-auto flex justify-center">
        <Box className="min-w-[400px] max-w-[600px] md:w-full lg:w-1/2">
          <HeaderComponent title="Manage Trip"></HeaderComponent>
        </Box>
      </Box>
      <Box className="container mx-auto flex justify-center space-x-8">
        <Box className="md:w-0 lg:w-1/4"></Box>
        <Box
          component="form"
          onChange={handleChange}
          className="flex w-1/2 min-w-[400px] max-w-[600px] flex-col"
        >
          <Typography className="mb-4 mt-6 text-2xl">Edit Trip</Typography>
          <p className="mb-6 pl-3 text-xl">Basic Information</p>

          <FormControl fullWidth className="text-left">
            <TextField
              className="input-field"
              label="Title"
              fullWidth
              disabled={!editMode}
              id="title"
              value={title}
              error={formError.title}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <TypeIcon />
                  </InputAdornment>
                ),
              }}
            />
            <p className="mb-3 mt-1 text-sm text-red-600">
              {formError.title ? formError.title.message : ''}
            </p>
          </FormControl>

          <FormControl fullWidth className="text-left">
            <TextField
              className="input-field"
              label="Short Title"
              fullWidth
              disabled={!editMode}
              id="shorttitle"
              value={shortTitle}
              error={formError.shorttitle}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <TypeIcon />
                  </InputAdornment>
                ),
              }}
            />
            <p className="mb-3 mt-1 text-sm text-red-600">
              {formError.shorttitle ? formError.shorttitle.message : ''}
            </p>
          </FormControl>

          <FormControl fullWidth className="text-left">
            <TextField
              className="input-field"
              label="Description"
              fullWidth
              disabled={!editMode}
              id="description"
              value={description}
              error={formError.description}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <TypeIcon />
                  </InputAdornment>
                ),
              }}
              multiline
              rows={4}
            />
            <p className="mb-3 mt-1 text-sm text-red-600">
              {formError.description ? formError.description.message : ''}
            </p>
          </FormControl>
          {/* Add categories */}
          <FormControl className="input-field" fullWidth disabled={!editMode}>
            <InputLabel
              id="categories-label"
              error={!!formError.categories}
              className="-mt-6 text-xs"
            >
              Categories
            </InputLabel>
            <Box
              className={`grid grid-cols-5 rounded-xl bg-bright p-4 pb-2 ${!editMode ? 'pointer-events-none opacity-50' : ''}`}
            >
              <div
                className={` ${!editMode ? 'col-span-5' : 'col-span-3'} flex flex-wrap`}
              >
                {categories.map((category, index) => (
                  <Chip
                    key={index}
                    icon={
                      categoryHovered[index] ? <XIcon /> : categoryIcons[index]
                    }
                    label={categories[index]}
                    onClick={() => {
                      setCategoryIcons(
                        categoryIcons.filter((_, i) => i !== index)
                      );
                      setCategories(categories.filter((_, i) => i !== index));
                    }}
                    onMouseEnter={() => handleHoveredCategory(true, index)}
                    onMouseLeave={() => handleHoveredCategory(false, index)}
                    className="category-chip white mb-4 cursor-pointer"
                  />
                ))}
              </div>
              {editMode && (
                <IconButton
                  onClick={handleOpenPopover}
                  className="btn btn-white col-span-2 mb-2 h-12 w-full rounded-full text-lg"
                >
                  <PlusIcon /> Edit Categories
                </IconButton>
              )}
            </Box>
            <Popover
              id="categoriespopover"
              open={opencategoriesPopover}
              anchorEl={anchorEl}
              onClose={handleClosePopover}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              className="[&_.MuiPopover-paper]:rounded-xl"
            >
              <p className="p-4 pb-2">Choose Categories that fit your Trip:</p>
              <CategoriesComponent
                selectedCategories={categories}
                setSelectedCategories={handleSetCategories}
                selectedIcons={categoryIcons}
                setSelectedIcons={setCategoryIcons}
              />
            </Popover>
            <p className="mb-3 mt-1 text-sm text-red-600">
              {formError.categories ? formError.categories.message : ''}
            </p>
          </FormControl>

          <Divider className="mx-3 mb-4 mt-8" />
          <p className="mb-6 pl-3 text-xl">Accomodation Details</p>

          <FormControl fullWidth autoFocus className="">
            <div className="rounded-xl bg-bright p-4">
              <InputLabel
                id="pictures-label"
                error={!!formError.pictures}
                className="-mt-6 text-xs text-dark"
              >
                Pictures
              </InputLabel>
              <div className="mb-4 flex flex-wrap">
                {trip_pictures.map((picture, index) => (
                  <Box key={index} className="relative w-1/3">
                    <img src={picture.url} className=" rounded-xl" />
                    {editMode && (
                      <IconButton
                        className="2 absolute right-1 top-1 h-8 w-8 rounded-full bg-white p-1 opacity-95"
                        onClick={() => removePicture(index)}
                      >
                        <XIcon className="h-6 w-6 text-dark" />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </div>
              {editMode && (
                <UploadFileComponent
                  id="pictures"
                  maxFiles={5}
                  maxFileSize={5242880}
                  setParentFiles={updateNewPictures}
                  icon={<ImagePlusIcon className="mb-4 h-12 w-12" />}
                />
              )}
            </div>
            <p className="mb-3 mt-1 text-sm text-red-600">
              {formError.pictures ? formError.pictures.message : ''}
            </p>
          </FormControl>

          <FormControl fullWidth className="text-left">
            <TextField
              className="input-field"
              label="Listing Link"
              fullWidth
              disabled={!editMode}
              id="listinglink"
              value={listingLink}
              error={formError.listinglink}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <LinkIcon />
                  </InputAdornment>
                ),
              }}
            />
            <p className="mb-3 mt-1 text-sm text-red-600">
              {formError.listinglink ? formError.listinglink.message : ''}
            </p>
          </FormControl>
          <Box className="flex space-x-4">
            <FormControl fullWidth className="text-left">
              <TextField
                className="input-field"
                label="City"
                fullWidth
                disabled={!editMode}
                id="city"
                value={city}
                error={formError.city}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Building2Icon />
                    </InputAdornment>
                  ),
                }}
              />
              <p className="mb-3 mt-1 text-sm text-red-600">
                {formError.city ? formError.city.message : ''}
              </p>
            </FormControl>

            <FormControl fullWidth className="text-left">
              <TextField
                className="input-field"
                label="Country"
                fullWidth
                disabled={!editMode}
                id="country"
                value={country}
                error={formError.country}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <EarthIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <p className="mb-3 mt-1 text-sm text-red-600">
                {formError.country ? formError.country.message : ''}
              </p>
            </FormControl>
          </Box>

          <FormControl fullWidth className="text-left">
            <TextField
              className="input-field"
              label="Maps Link"
              fullWidth
              disabled={!editMode}
              id="mapslink"
              value={mapsLink}
              error={formError.mapslink}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <MapPinIcon />
                  </InputAdornment>
                ),
              }}
            />
            <p className="mb-3 mt-1 text-sm text-red-600">
              {formError.mapslink ? formError.mapslink.message : ''}
            </p>
          </FormControl>

          <Divider className="mx-3 my-4" />
          <p className="mb-6 pl-3 text-xl">Price and Spots</p>

          <Box className="flex space-x-4">
            <FormControl fullWidth className="text-left">
              <TextField
                className="input-field"
                label="Start Date"
                fullWidth
                disabled={!editMode}
                id="startdate"
                type="date"
                value={startDate}
                error={formError.startdate}
                InputProps={{
                  endAdornment: !editMode && (
                    <InputAdornment position="end">
                      <CalendarIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <p className="mb-3 mt-1 text-sm text-red-600">
                {formError.startdate ? formError.startdate.message : ''}
              </p>
            </FormControl>

            <FormControl fullWidth className="text-left">
              <TextField
                className="input-field"
                label="End Date"
                fullWidth
                disabled={!editMode}
                id="enddate"
                type="date"
                value={endDate}
                error={formError.enddate}
                InputProps={{
                  endAdornment: !editMode && (
                    <InputAdornment position="end">
                      <CalendarIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <p className="mb-3 mt-1 text-sm text-red-600">
                {formError.enddate ? formError.enddate.message : ''}
              </p>
            </FormControl>
          </Box>

          <Box className="flex space-x-4">
            <FormControl fullWidth className="text-left">
              <TextField
                className="input-field"
                label="Total Spots"
                fullWidth
                disabled={!editMode}
                id="totalspots"
                value={totalSpots}
                error={formError.totalspots}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <UsersIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <p className="mb-3 mt-1 text-sm text-red-600">
                {formError.totalspots ? formError.totalspots.message : ''}
              </p>
            </FormControl>
            <FormControl fullWidth className="text-left">
              <TextField
                className="input-field"
                label="Price"
                fullWidth
                disabled={!editMode}
                id="price"
                value={price}
                error={formError.price}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <EuroIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <p className="mb-3 mt-1 text-sm text-red-600">
                {formError.price ? formError.price.message : ''}
              </p>
            </FormControl>
          </Box>
          <Box className="flex space-x-4">
            <FormControl fullWidth className="w-2/3 text-left">
              <TextField
                className="input-field"
                label="Available Spots"
                fullWidth
                disabled={!editMode}
                id="availablespots"
                value={availableSpots}
                error={formError.availablespots}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <UsersIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <p className="mb-3 mt-1 text-sm text-red-600">
                {formError.availablespots
                  ? formError.availablespots.message
                  : ''}
              </p>
            </FormControl>
            <FormControl fullWidth className="w-1/3 text-left">
              <TextField
                className="input-field"
                label="Max Price"
                fullWidth
                disabled={!editMode}
                id="maxprice"
                value={maxPrice}
                error={formError.maxprice}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <EuroIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <p className="mb-3 mt-1 text-sm text-red-600">
                {formError.maxprice ? formError.maxprice.message : ''}
              </p>
            </FormControl>
          </Box>
          <Box className="flex space-x-4">
            <FormControl fullWidth className="w-2/3 text-left">
              <TextField
                className="input-field"
                label="Required Spots"
                fullWidth
                disabled={!editMode}
                id="requiredspots"
                value={requiredSpots}
                error={formError.requiredspots}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <UsersIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <p className="mb-3 mt-1 text-sm text-red-600">
                {formError.requiredspots ? formError.requiredspots.message : ''}
              </p>
            </FormControl>
            <FormControl fullWidth className="w-1/3 text-left">
              <TextField
                className="input-field"
                label="Min Price"
                fullWidth
                disabled={!editMode}
                id="minprice"
                value={minPrice}
                error={formError.minprice}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <EuroIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <p className="mb-3 mt-1 text-sm text-red-600">
                {formError.minprice ? formError.minprice.message : ''}
              </p>
            </FormControl>
          </Box>
          {/* Cancel and co */}
          <Box className="mt-3">
            {editMode ? (
              <Box className="flex justify-between">
                <IconButton
                  onClick={() => setCancelDialogOpen(true)}
                  className="btn w-1/3 min-w-44"
                >
                  Cancel
                </IconButton>
                <DialogComponent
                  open={cancelDialogOpen}
                  handleClose={() => setCancelDialogOpen(false)}
                  handleSubmit={handleCancel}
                  dialogText="Your Changes will be lost."
                  withInput={false}
                ></DialogComponent>
                <IconButton
                  onClick={handleSave}
                  className="btn btn-primary w-1/3 min-w-44"
                  disabled={loading}
                >
                  {loading && (
                    <CircularProgress className="absolute h-8 w-8 text-white [&_svg]:mr-0" />
                  )}
                  <SaveIcon />
                  Save
                </IconButton>
              </Box>
            ) : (
              <Box className="flex justify-end">
                <IconButton
                  onClick={handleEdit}
                  className="btn btn-primary w-1/3 min-w-44"
                >
                  <PenIcon /> Edit
                </IconButton>
              </Box>
            )}
          </Box>
        </Box>

        <Box className="w-1/4">
          <Typography className="mb-4 mt-6 text-2xl">
            Actions and Info
          </Typography>
          {/* {trip !== null && <ManageTripSidebarComponent trip={trip} />} */}
          <ManageTripSidebarComponent trip={trip} />
        </Box>
      </Box>
    </>
  );
}
