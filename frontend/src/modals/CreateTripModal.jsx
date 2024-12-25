import {
  Box,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Popover,
  TextField,
  Tooltip,
} from '@mui/material';
import axios from 'axios';
import {
  Building2Icon,
  EarthIcon,
  EuroIcon,
  HandCoinsIcon,
  HomeIcon,
  ImagePlusIcon,
  InfoIcon,
  LinkIcon,
  MapPinIcon,
  PlusIcon,
  TextIcon,
  TypeIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import CategoriesComponent from '../components/CategoriesComponent';
import StepperComponent from '../components/StepperComponent';
import UploadFileComponent from '../components/UploadFileComponent';
import { useAuth } from '../provider/AuthenticationProvider.jsx';
import BaseModal from './BaseModal';

export default function CreateTripModal({ handleClose, open }) {
  const { user } = useAuth(); //get user data from context
  //data for form
  const [formError, setFormError] = useState({}); //saves form errors for each field if field is present it has an error and message is within

  //data for stepper (see stepper for more info)
  const steps = [
    'Trip Information',
    'Accommodation Details',
    'Price and Spots',
  ];
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState({});
  const [stepHasError, setStepHasError] = useState([null, null, null]);

  //data for step 1
  let [title, setTitle] = useState('');
  let [shortTitle, setShortTitle] = useState('');
  let [description, setDescription] = useState('');
  let [categories, setCategories] = useState([]);
  const [categoryIcons, setCategoryIcons] = useState([]);
  const [categoryHovered, setCategoryHovered] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const opencategoriesPopover = Boolean(anchorEl);

  //data step 2
  const [tempFileIds, setTempFileIds] = useState([]);
  let [listingLink, setListingLink] = useState('');
  let [city, setCity] = useState('');
  let [country, setCountry] = useState('');
  let [mapsLink, setMapsLink] = useState('');

  //data step 3
  let [totalSpots, setTotalSpots] = useState('');
  let [availableSpots, setAvailableSpots] = useState('');
  let [requiredSpots, setRequiredSpots] = useState('');
  let [price, setPrice] = useState('');
  let [minPrice, setMinPrice] = useState('');
  let [maxPrice, setMaxPrice] = useState('');
  let [startDate, setStartDate] = useState('');
  let [endDate, setEndDate] = useState('');

  const [response, setResponse] = useState([true, null]); //saves the response of the create trip request

  // Handle uploaded Files
  const handleFiles = (fileIds) => {
    setTempFileIds(fileIds);
  };

  useEffect(() => {
    validateForm('tempFileIds');
  }, [tempFileIds]);

  const handleStep = (step) => () => {
    if (step === -1) {
      step = 0;
      setCompleted({});
      setFormError({});
    } else {
      for (let i = 0; i <= step; i++) {
        if (!validateForm(i)) {
          return;
        }
      }
    }
    setActiveStep(step);
  };

  const handleClose_ = () => {
    handleClose();
    resetState();
    setActiveStep(0);
  };

  const resetState = () => {
    setCompleted({});
    setStepHasError([null, null, null]);

    setTitle('');
    setShortTitle('');
    setDescription('');
    setCategories([]);
    setCategoryIcons([]);
    setCategoryHovered([]);
    setAnchorEl(null);

    setTempFileIds([]);
    setListingLink('');
    setCity('');
    setCountry('');
    setMapsLink('');

    setTotalSpots('');
    setAvailableSpots('');
    setRequiredSpots('');
    setPrice('');
    setMinPrice('');
    setMaxPrice('');
    setStartDate('');
    setEndDate('');
  };

  const handleStepValidated = () => {
    trimAllTextFields();
    if (!validateForm(activeStep)) {
      const newStepHasError = stepHasError;
      stepHasError[activeStep] = true;
      setStepHasError(newStepHasError);
      return false;
    } else {
      const newStepHasError = stepHasError;
      stepHasError[activeStep] = false;
      setStepHasError(newStepHasError);
      return true;
    }
  };

  const trimAllTextFields = () => {
    title = title.trim();
    shortTitle = shortTitle.trim();
    description = description.trim();
    listingLink = listingLink.trim();
    city = city.trim();
    country = country.trim();
    mapsLink = mapsLink.trim();
    price = price.replace(',', '.').trim();
    minPrice = minPrice.trim();
    maxPrice = maxPrice.trim();
    totalSpots = totalSpots.trim();
    availableSpots = availableSpots.trim();
    requiredSpots = requiredSpots.trim();
  };

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
    const descriptionRegex = /^[A-Za-zäöüÄÖÜß\s\d!\-&.,:'!?’']{150,1200}$/;
    const googleMapsLink =
      /^https:\/\/www.google.[A-Za-z]{2,3}\/maps\/place\/[A-Za-zäöüÄÖÜß\d.,:+!_&%=\-/@?]{10,}$/;
    const linkRegex =
      /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    const spotsRegex = /^(1[0-9]{0,2}|200|[2-9][0-9]?)$/; //number between 1-200
    const spotsRegex_available = /^(0|1[0-9]{0,2}|200|[2-9][0-9]?)$/; //number between 0-200
    const numberRegex = /^\d+(?:[.,]\d{1,2})?$/; //only numbers allowed with 2 decimal places at most

    var hasErrors = false; //if true form has errors (since error setter async need something to check against instantly)
    switch (id) {
      case 0: //first page, fall through for all fields on first page
      case 1: //second page, fall through for all fields on first and second page
      case 2: //third page
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
      case 'tempFileIds':
        if (tempFileIds.length === 0) {
          addFormError('trippicture', 'Please upload trip pictures');
          hasErrors = true;
        } else {
          if (formError.trippicture) removeFormError('trippicture');
        }
        if (id === 'tempFileIds') break;
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
          (!value && parseInt(requiredSpots) > totalSpots) ||
          (value && parseInt(value) > totalSpots) ||
          (!value && !spotsRegex_available.test(requiredSpots)) ||
          (value && !spotsRegex_available.test(value))
        ) {
          addFormError(
            'requiredspots',
            'Required Spots must be a number less or equal than Total Spots'
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

  const handleChange = () => {
    var { id, value } = event.target;

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
      case 'startdate':
        setStartDate(value);
        break;
      case 'enddate':
        setEndDate(value);
        break;
    }

    validateForm(id, value);
  };

  //update min and max prices
  useEffect(() => {
    if (parseInt(availableSpots) > 0 && parseInt(price) > 0)
      setMinPrice((parseInt(price) / parseInt(totalSpots)).toFixed(2));
    if (parseInt(requiredSpots) > 0 && parseInt(price) > 0)
      setMaxPrice((parseInt(price) / parseInt(requiredSpots)).toFixed(2));
  }, [availableSpots, requiredSpots, price]);

  //function to handle the change of categories and validate
  const handleSetCategories = (selectedCategories) => {
    setCategories(selectedCategories);
    validateForm('categories', selectedCategories); //validate categories with value from handle since setter is async
  };

  const uploadTripData = async () => {
    try {
      const trip = {
        title: title,
        shortTitle: shortTitle,
        description: description,
        pictures: tempFileIds.flat(), // flatten the array of arrays
        dateRange: {
          startDate: startDate,
          endDate: endDate,
        },
        spots: {
          totalSpots: totalSpots,
          availableSpots: availableSpots,
          requiredSpots: requiredSpots,
        },
        priceRange: {
          price: price,
          minPrice: minPrice,
          maxPrice: maxPrice,
        },
        listingLink: listingLink,
        location: {
          city: city,
          country: country,
          mapsLink: mapsLink,
        },
        categories: categories,
        organizer: user._id,
        participants: [],
      };
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + '/trip/create',
        trip
      );
      setResponse([true, response.data]);
    } catch (error) {
      const displayError = error;
      delete displayError.stack;
      setResponse([false, displayError.message]);
      console.error(displayError);
    }
  };

  const handleOpenPopover = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleRemoveCategory = (i) => {
    setCategories(categories.filter((element, index) => index !== i));
    setCategoryIcons(categoryIcons.filter((element, index) => index !== i));
  };

  const handleHoveredCategory = (value, i) => {
    const hoveredTemp = []; //dont get the values from categoryHovered otherwise on fast hovers they stay true since react cant udpate fast enough
    hoveredTemp[i] = value;
    setCategoryHovered(hoveredTemp);
  };

  return (
    <>
      <BaseModal
        open={open}
        handleClose={handleClose}
        title="Create Trip"
        description="Create Trip"
        content={
          <StepperComponent
            stepIcons={[
              <TextIcon key="" />,
              <HomeIcon key="" />,
              <HandCoinsIcon key="" />,
            ]}
            stepTitles={steps}
            completed={completed}
            setCompleted={setCompleted}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            handleStep={handleStep}
            handleStepValidated={handleStepValidated}
            handleChange={handleChange}
            submit={uploadTripData}
            handleClose={handleClose_}
            submitButtonTitle="Create Trip"
            submitResponse={response}
            successErrorMessages={[
              'Your Trip has been created',
              'There was an error creating your Trip:',
            ]}
            stepContent={[
              <>
                <FormControl fullWidth className="formcontrol">
                  <TextField
                    label="Title"
                    id="title"
                    className="input-field"
                    required
                    autoFocus
                    value={title}
                    error={!!formError.title}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <TypeIcon className="dark-icon" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <p className="helper-text">
                    {formError.title ? formError.title.message : ''}
                  </p>
                </FormControl>
                <FormControl fullWidth className="formcontrol">
                  <TextField
                    label="Short Title"
                    id="shorttitle"
                    className="input-field"
                    required
                    value={shortTitle}
                    error={!!formError.shorttitle}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <TypeIcon className="dark-icon" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <p className="helper-text">
                    {formError.shorttitle ? formError.shorttitle.message : ''}
                  </p>
                </FormControl>
                <FormControl fullWidth className="formcontrol mb-8">
                  <TextField
                    error={!!formError.description}
                    multiline
                    label="Description"
                    aria-label="trip description"
                    id="description"
                    name="description"
                    value={description}
                    required
                    minRows={4}
                    placeholder="Tell others what this Trip is about..."
                    className="input-field mt-0 max-h-60"
                    onChange={handleChange}
                  />
                  <p className="absolute bottom-6 right-2 rounded-lg bg-bright">
                    {description.length}/1200
                  </p>
                  <p className="helper-text">
                    {formError.description ? formError.description.message : ''}
                  </p>
                  <TypeIcon className="dark-icon absolute right-2 top-2" />
                </FormControl>
                <InputLabel
                  id="categories-label"
                  error={!!formError.categories}
                  className="mb-2 ml-3"
                >
                  Categories *
                </InputLabel>
                <Box className="grid grid-cols-5 rounded-xl bg-bright p-4 pb-2">
                  <div className="col-span-3">
                    {categoryIcons.map((selectedIcon, index) => (
                      <IconButton
                        className="mb-2 mr-2 h-fit rounded-full bg-gradient-to-br from-primary to-light p-3 text-white shadow-md"
                        key={'icon' + index}
                        onClick={() => {
                          handleRemoveCategory(index);
                          handleHoveredCategory(false, index);
                        }}
                        onMouseEnter={() => handleHoveredCategory(true, index)}
                        onMouseLeave={() => handleHoveredCategory(false, index)}
                      >
                        {categoryHovered[index] ? <XIcon /> : selectedIcon}
                      </IconButton>
                    ))}
                  </div>
                  <IconButton
                    onClick={handleOpenPopover}
                    className="btn btn-white col-span-2 mb-2 h-12 w-[12.5rem] rounded-full text-lg"
                  >
                    <PlusIcon /> Add Category
                  </IconButton>
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
                  <p className="p-4 pb-2">
                    Choose Categories that fit your Trip:
                  </p>
                  <CategoriesComponent
                    selectedCategories={categories}
                    setSelectedCategories={handleSetCategories}
                    selectedIcons={categoryIcons}
                    setSelectedIcons={setCategoryIcons}
                  />
                </Popover>
                <p className="helper-text">
                  {formError.categories ? formError.categories.message : ''}
                </p>
              </>,
              <>
                <FormControl fullWidth autoFocus className="formcontrol">
                  <div className="rounded-xl bg-bright">
                    <InputLabel
                      id="pictures-label"
                      error={!!formError.trippicture}
                      className="-mt-12"
                    >
                      Pictures
                    </InputLabel>

                    <UploadFileComponent
                      id="trippicture"
                      maxFiles={10}
                      maxFileSize={5242880}
                      setParentFiles={handleFiles}
                      icon={<ImagePlusIcon className="mb-4 h-12 w-12" />}
                    />
                  </div>
                  <p className="helper-text">
                    {formError.trippicture ? formError.trippicture.message : ''}
                  </p>
                </FormControl>
                <FormControl fullWidth className="formcontrol">
                  <div className="flex h-0 w-full justify-end">
                    <Tooltip
                      className="z-50 -mr-3 -mt-2 h-6 w-6 rounded-full bg-white"
                      title={
                        'Please provide the original Listing Link from AirBnb, booking.com, etc.'
                      }
                    >
                      <InfoIcon className="ml-1 h-4 w-4" />
                    </Tooltip>
                  </div>
                  <TextField
                    label="Link to Listing"
                    id="listinglink"
                    className="input-field"
                    required
                    value={listingLink}
                    error={!!formError.listinglink}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <LinkIcon className="dark-icon" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <p className="helper-text">
                    {formError.listinglink ? formError.listinglink.message : ''}
                  </p>
                </FormControl>
                <Box className="flex space-x-4">
                  <FormControl fullWidth className="formcontrol">
                    <TextField
                      label="City"
                      id="city"
                      className="input-field"
                      required
                      value={city}
                      error={!!formError.city}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Building2Icon className="dark-icon" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <p className="helper-text">
                      {formError.city ? formError.city.message : ''}
                    </p>
                  </FormControl>
                  <FormControl fullWidth className="formcontrol">
                    <TextField
                      label="Country"
                      id="country"
                      className="input-field"
                      required
                      value={country}
                      error={!!formError.country}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <EarthIcon className="dark-icon" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <p className="helper-text">
                      {formError.country ? formError.country.message : ''}
                    </p>
                  </FormControl>
                </Box>
                <FormControl fullWidth className="formcontrol">
                  <div className="flex h-0 w-full justify-end">
                    <Tooltip
                      className="z-50 -mr-3 -mt-2 h-6 w-6 rounded-full bg-white"
                      title={
                        'Please provide a link from Google Maps adress bar in your Browser. The link looks something like: https://www.google.com/maps/place/...'
                      }
                    >
                      <InfoIcon className="ml-1 h-4 w-4" />
                    </Tooltip>
                  </div>
                  <TextField
                    label="Maps Link of Location"
                    id="mapslink"
                    className="input-field"
                    required
                    value={mapsLink}
                    error={!!formError.mapslink}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <MapPinIcon className="dark-icon" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <p className="helper-text">
                    {formError.mapslink ? formError.mapslink.message : ''}
                  </p>
                </FormControl>
              </>,
              <>
                <Box className="flex space-x-4">
                  <FormControl fullWidth className="formcontrol">
                    <TextField
                      label="Total Spots"
                      id="totalspots"
                      className="input-field"
                      required
                      autoFocus
                      value={totalSpots}
                      error={!!formError.totalspots}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <UsersIcon className="dark-icon" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <p className="helper-text">
                      {formError.totalspots ? formError.totalspots.message : ''}
                    </p>
                  </FormControl>
                  <FormControl fullWidth className="formcontrol">
                    <div className="flex h-0 w-full justify-end">
                      <Tooltip
                        className="z-50 -mr-3 -mt-2 h-6 w-6 rounded-full bg-white"
                        title={
                          'This is the total price of the accommodation, e.g. the total price of the house on AirBnb. This includes also your share.'
                        }
                      >
                        <InfoIcon className="ml-1 h-4 w-4" />
                      </Tooltip>
                    </div>
                    <TextField
                      label="Total Price"
                      id="price"
                      className="input-field"
                      required
                      value={price}
                      error={!!formError.price}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <EuroIcon className="dark-icon" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <p className="helper-text">
                      {formError.price ? formError.price.message : ''}
                    </p>
                  </FormControl>{' '}
                </Box>
                <Box className="flex space-x-4">
                  <FormControl fullWidth className="formcontrol w-2/3">
                    <div className="flex h-0 w-full justify-end">
                      <Tooltip
                        className="z-50 -mr-3 -mt-2 h-6 w-6 rounded-full bg-white"
                        title={
                          'This is the number of people you are offering to join youre trip on Fullhouse. '
                        }
                      >
                        <InfoIcon className="ml-1 h-4 w-4" />
                      </Tooltip>
                    </div>
                    <TextField
                      label="Available Spots to fill"
                      id="availablespots"
                      className="input-field"
                      required
                      value={availableSpots}
                      error={!!formError.availablespots}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <UsersIcon className="dark-icon" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    {totalSpots && (
                      <p className="text-md absolute right-12 top-4">
                        / {totalSpots}
                      </p>
                    )}
                    <p className="helper-text">
                      {formError.availablespots
                        ? formError.availablespots.message
                        : ''}
                    </p>
                  </FormControl>
                  <FormControl fullWidth className="formcontrol w-1/3">
                    <TextField
                      label="Min/person"
                      id="minprice"
                      disabled
                      className="input-field disabled"
                      value={minPrice}
                      error={!!formError.minprice}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <EuroIcon className="dark-icon" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <p className="helper-text">
                      {formError.minprice ? formError.minprice.message : ''}
                    </p>
                  </FormControl>
                </Box>
                <Box className="flex space-x-4">
                  <FormControl fullWidth className="formcontrol w-2/3">
                    <div className="flex h-0 w-full justify-end">
                      <Tooltip
                        className="z-50 -mr-3 -mt-2 h-6 w-6 rounded-full bg-white"
                        title={
                          'This is the minimum number of total participants for you to start the trip (including you and your friends, if applicable). If you are already certain that you will be starting the trip, feel free to fill your accommodation with additional people.'
                        }
                      >
                        <InfoIcon className="ml-1 h-4 w-4" />
                      </Tooltip>
                    </div>
                    <TextField
                      label="Required Total Spots"
                      id="requiredspots"
                      className="input-field"
                      required
                      value={requiredSpots}
                      error={!!formError.requiredspots}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <UsersIcon className="dark-icon" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    {totalSpots && (
                      <p className="text-md absolute right-12 top-4">
                        / {totalSpots}
                      </p>
                    )}
                    <p className="helper-text">
                      {formError.requiredspots
                        ? formError.requiredspots.message
                        : ''}
                    </p>
                  </FormControl>
                  <FormControl fullWidth className="formcontrol w-1/3">
                    <TextField
                      label="Max/person"
                      id="maxprice"
                      className="input-field disabled"
                      disabled
                      value={maxPrice}
                      error={!!formError.maxprice}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <EuroIcon className="dark-icon" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <p className="helper-text">
                      {formError.maxprice ? formError.maxprice.message : ''}
                    </p>
                  </FormControl>
                </Box>
                <Box className="flex space-x-4">
                  <FormControl fullWidth className="formcontrol">
                    <TextField
                      type="date"
                      label="Start Date"
                      id="startdate"
                      className={`input-field [&_input:focus]:text-dark ${startDate == '' ? '[&_input]:text-transparent' : '[&_input]:text-dark'} `}
                      required
                      value={startDate}
                      error={!!formError.startdate}
                    />
                    <p className="helper-text">
                      {formError.startdate ? formError.startdate.message : ''}
                    </p>
                  </FormControl>
                  <FormControl fullWidth className="formcontrol">
                    <TextField
                      type="date"
                      label="End Date"
                      id="enddate"
                      className={`input-field [&_input:focus]:text-dark ${endDate == '' ? '[&_input]:text-transparent' : '[&_input]:text-dark'} `}
                      required
                      value={endDate}
                      error={!!formError.enddate}
                    />
                    <p className="helper-text">
                      {formError.enddate ? formError.enddate.message : ''}
                    </p>
                  </FormControl>
                </Box>
              </>,
            ]}
          ></StepperComponent>
        }
      ></BaseModal>
    </>
  );
}
CreateTripModal.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};
