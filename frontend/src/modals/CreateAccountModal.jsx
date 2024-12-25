import {
  Box,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import axios from 'axios';
import {
  Building2Icon,
  CalendarIcon,
  EarthIcon,
  ImagePlusIcon,
  PenIcon,
  ScanFaceIcon,
  TypeIcon,
  UserIcon,
} from 'lucide-react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import PersonaComponent from '../components/PersonaComponent';
import StepperComponent from '../components/StepperComponent';
import UploadFileComponent from '../components/UploadFileComponent';
import { useAlert } from '../provider/AlertProvider.jsx';
import { useAuth } from '../provider/AuthenticationProvider.jsx';
import BaseModal from './BaseModal';

export default function CreateAccountModal({
  handleClose,
  open,
  createAccountData,
}) {
  const { setToken } = useAuth();

  const { setAlert } = useAlert();

  //data for form
  const [formError, setFormError] = React.useState({}); //saves form errors for each field if field is present it has an error and message is within

  //data for stepper (see stepper for more info)
  const steps = ['Personal information', 'Complete Profile', 'Verification'];
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = React.useState({});
  const [stepHasError, setStepHasError] = React.useState([null, null, null]);

  //data for step 1
  let [firstName, setFirstName] = React.useState('');
  let [lastName, setLastName] = React.useState('');
  let [birthday, setBirthday] = React.useState('');
  let [city, setCity] = React.useState('');
  let [country, setCountry] = React.useState('');
  let [gender, setGender] = React.useState('');
  const genderOptions = ['female', 'male', 'other'];

  //data step 2
  let [bio, setBio] = React.useState('');
  const [tempFileIds, setTempFileIds] = useState([]);
  const [response, setResponse] = React.useState([true, null]);

  //data step 3
  const [verificationStatus, setVerificationStatus] = useState(null);

  // Handler function to update verification status
  const handleVerificationStatus = (status) => {
    setVerificationStatus(status);
    validateForm('verificationdocument');
  };

  // Handle uploaded Files
  const handleFiles = (fileIds) => {
    setTempFileIds(fileIds);
  };

  const handleClose_ = () => {
    handleClose();
    resetState();
    setActiveStep(0);
  };

  const resetState = () => {
    setFirstName('');
    setBio('');
    setLastName('');
    setBirthday('');
    setCity('');
    setCountry('');
    setGender('');
    setTempFileIds([]);
    setVerificationStatus(null);
    setCompleted({});
    setFormError({});
    setResponse([null, null]);
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
    firstName = firstName.trim();
    setFirstName(firstName);
    lastName = lastName.trim();
    setLastName(lastName);
    city = city.trim();
    setCity(city);
    country = country.trim();
    setCountry(country);
    bio = bio.trim();
    setBio(bio);
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
    const nameRegex = /^[A-Za-zäöüÄÖÜß\s]{2,50}$/;
    const bioRegex = /^[A-Za-zäöüÄÖÜß\s\d.,:'’-]{10,400}$/;
    const locationRegex = /^[A-Za-zäöüÄÖÜß\s\d!\-&,.:]{2,120}$/;

    var hasErrors = false;

    switch (id) {
      case 0: //first page, fall through for all fields on first page
      case 1: //second page, fall through for all fields on first and second page
      case 2: //third page
      case 'firstname':
        // check input against regex and add or remove errors from the formError object
        if (
          (!value && !nameRegex.test(firstName)) ||
          (value && !nameRegex.test(value))
        ) {
          addFormError(
            'firstname',
            'First Name must be between 2 and 50 characters'
          );
          hasErrors = true;
        } else {
          if (formError.firstname) removeFormError('firstname');
        }
        if (id === 'firstname') break;
      // falls through
      case 'lastname':
        if (
          (!value && !nameRegex.test(lastName)) ||
          (value && !nameRegex.test(value))
        ) {
          addFormError(
            'lastname',
            'Last Name must be between 2 and 50 characters'
          );
          hasErrors = true;
        } else {
          if (formError.lastname) removeFormError('lastname');
        }
        if (id === 'lastname') break;
      //falls through
      case 'city':
        if (
          (!value && !locationRegex.test(city)) ||
          (value && !locationRegex.test(value))
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
          (!value && !locationRegex.test(country)) ||
          (value && !locationRegex.test(value))
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
      case 'birthday':
        if (
          (!value && birthday === '') ||
          (!value && new Date(birthday) > new Date()) ||
          (value && new Date(value) > new Date())
        ) {
          addFormError(
            'birthday',
            "Please select a valid date. Date can't be in the future."
          );
          hasErrors = true;
        } else {
          if (formError.birthday) removeFormError('birthday');
        }
        if (id === 'birthday') break;
      // falls through
      case 'gender':
        if (
          (!value && !genderOptions.includes(gender)) ||
          (value && !genderOptions.includes(value))
        ) {
          addFormError('gender', 'Please select a gender');
          hasErrors = true;
        } else {
          if (formError.gender) removeFormError('gender');
        }
        if (id === 'gender') break;
        if (id === 0) break;
      // falls through
      case 'bio':
        if (
          (!value && !bioRegex.test(bio)) ||
          (value && !bioRegex.test(value))
        ) {
          addFormError(
            'bio',
            'Your Bio must be between 10 and 400 letters including: . , :'
          );
          hasErrors = true;
        } else {
          if (formError.bio) removeFormError('bio');
        }
        if (id === 'bio') break;
      // falls through
      case 'tempFileIds':
        if (tempFileIds.length === 0) {
          addFormError('profilepicture', 'Please upload a profile picture');
          hasErrors = true;
        } else {
          if (formError.profilepicture) removeFormError('profilepicture');
        }
        if (id === 'tempFileIds') break;
        if (id === 1) break;
      // falls through
      case 'verificationdocument':
        if (!verificationStatus) {
          addFormError(
            'verificationdocument',
            'Please verify your account with Persona'
          );
          hasErrors = true;
        } else {
          if (formError.verificationdocument)
            removeFormError('verificationdocument');
        }
    }
    //returns true if no errors are present and verification succeded
    return !hasErrors;
  };

  const handleChange = () => {
    var { id, value } = event.target;
    //seperate handler for select since it made problems
    if (event.target.role === 'option') {
      id = 'gender';
      value = event.target.textContent;
    }
    switch (id) {
      case 'firstname':
        setFirstName(value);
        break;
      case 'lastname':
        setLastName(value);
        break;
      case 'city':
        setCity(value);
        break;
      case 'country':
        setCountry(value);
        break;
      case 'birthday':
        setBirthday(value);
        break;
      case 'gender':
        setGender(value);
        break;
      case 'bio':
        setBio(value);
        break;
    }
    // if (stepHasError[activeStep]) handleStepValidated();
    validateForm(id, value);
  };

  const uploadAccountData = async () => {
    try {
      const json = {
        email: createAccountData.email,
        password: createAccountData.password,
        firstName: firstName,
        lastName: lastName,
        birthday: birthday,
        location: {
          city: city,
          country: country,
        },
        gender: gender,
        profileDescription: bio,
        profilePicture: tempFileIds[0],
        registrationDate: new Date(),
      };

      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + '/user/create',
        json
      );
      setResponse([true, response.data]);
    } catch (error) {
      const displayError = error;
      delete displayError.stack;
      setResponse([false, displayError.message]);
      console.error(displayError);
    }

    // Login
    try {
      await axios.post(import.meta.env.VITE_BACKEND_URL + '/user/login', {
        email: createAccountData.email,
        password: createAccountData.password,
      });
      setToken(true);
      setAlert('success', 'Welcome ✌🏽');
    } catch (error) {
      setToken(false);
      if (error?.response) {
        setAlert('error', error.response.data.message);
        console.error(error.response);
      } else {
        setAlert('error', 'Error logging in');
        console.error(error);
      }
    }
  };

  return (
    <>
      <BaseModal
        open={open}
        handleClose={handleClose}
        title="Create your Account"
        description="Create your Account"
        content={
          <>
            <StepperComponent
              stepIcons={[
                <UserIcon key="" />,
                <PenIcon key="" />,
                <ScanFaceIcon key="" />,
              ]}
              stepTitles={steps}
              completed={completed}
              setCompleted={setCompleted}
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              handleStep={handleStep}
              handleStepValidated={handleStepValidated}
              handleChange={handleChange}
              submit={uploadAccountData}
              handleClose={handleClose_}
              submitButtonTitle="Create Account"
              submitResponse={response}
              successErrorMessages={[
                'Your Account has been created',
                'There was an error creating your Account:',
              ]}
              stepContent={[
                <>
                  <Box class="flex flex-row space-x-4">
                    <FormControl
                      variant="outlined"
                      fullWidth
                      className="formcontrol"
                    >
                      <TextField
                        variant="outlined"
                        label="First Name"
                        id="firstname"
                        className="input-field"
                        required
                        autoFocus
                        value={firstName}
                        error={!!formError.firstname}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <TypeIcon className="dark-icon" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <div className="helper-text">
                        {formError.firstname ? formError.firstname.message : ''}
                      </div>
                    </FormControl>
                    <FormControl
                      variant="outlined"
                      fullWidth
                      className="formcontrol"
                    >
                      <TextField
                        variant="outlined"
                        label="Last Name"
                        id="lastname"
                        className="input-field"
                        required
                        value={lastName}
                        error={!!formError.lastname}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <TypeIcon className="dark-icon" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <p className="helper-text">
                        {formError.lastname ? formError.lastname.message : ''}
                      </p>
                    </FormControl>
                  </Box>
                  <FormControl
                    variant="outlined"
                    fullWidth
                    className="formcontrol"
                  >
                    <TextField
                      type="date"
                      variant="outlined"
                      label="Birthday"
                      id="birthday"
                      className={`input-field [&_input:focus]:text-dark ${birthday == '' ? '[&_input]:text-transparent' : '[&_input]:text-dark'} `}
                      required
                      value={birthday}
                      error={!!formError.birthday}
                    />
                    <p className="helper-text">
                      {formError.birthday ? formError.birthday.message : ''}
                    </p>
                  </FormControl>
                  <Box class="flex flex-row space-x-4">
                    <FormControl
                      variant="outlined"
                      fullWidth
                      className="formcontrol"
                    >
                      <TextField
                        variant="outlined"
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
                    <FormControl
                      variant="outlined"
                      fullWidth
                      className="formcontrol"
                    >
                      <TextField
                        variant="outlined"
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
                  <FormControl
                    variant="outlined"
                    fullWidth
                    className="formcontrol"
                  >
                    <InputLabel id="select-gender-label">Gender</InputLabel>
                    <Select
                      labelId="select-gender-label"
                      id="gender"
                      name="gender"
                      label="Gender"
                      className="input-field "
                      required
                      variant="outlined"
                      value={gender}
                      error={!!formError.gender}
                      slots={{ openPickerIcon: <CalendarIcon /> }}
                      onChange={handleChange}
                    >
                      {genderOptions.map((genders) => (
                        <MenuItem key={genders} value={genders}>
                          {genders}
                        </MenuItem>
                      ))}
                    </Select>
                    <p className="helper-text">
                      {formError.gender ? formError.gender.message : ''}
                    </p>
                  </FormControl>
                </>,
                <>
                  <FormControl
                    variant="outlined"
                    fullWidth
                    className="formcontrol mb-8"
                  >
                    <TextField
                      label="Bio"
                      multiline
                      aria-label="Use Bio"
                      error={formError.bio}
                      id="bio"
                      name="bio"
                      value={bio}
                      required
                      autoFocus
                      minRows={4}
                      placeholder="Write something about yourself..."
                      className="input-field"
                      onChange={handleChange}
                    />
                    <p className="absolute bottom-6 right-2 rounded-lg bg-bright">
                      {bio.length}/400
                    </p>

                    <p className="helper-text">
                      {formError.bio ? formError.bio.message : ''}
                    </p>

                    <TypeIcon className="dark-icon absolute right-2 top-2" />
                  </FormControl>
                  <FormControl
                    variant="outlined"
                    fullWidth
                    className="formcontrol"
                  >
                    <div className="rounded-xl bg-bright">
                      <InputLabel
                        id="profilePicture-label"
                        error={!!formError.profilepicture}
                        className="-mt-12"
                      >
                        Profile Picture
                      </InputLabel>

                      <UploadFileComponent
                        id="profilepicture"
                        setParentFiles={handleFiles}
                        icon={<ImagePlusIcon className="mb-4 h-12 w-12" />}
                      />
                    </div>
                    <p className="helper-text">
                      {formError.profilepicture
                        ? formError.profilepicture.message
                        : ''}
                    </p>
                  </FormControl>
                </>,
                <>
                  <FormControl
                    variant="outlined"
                    fullWidth
                    className="formcontrol"
                  >
                    <InputLabel
                      id="verificationDocument-label"
                      error={!!formError.verificationdocument}
                      className="-mt-12"
                    ></InputLabel>
                    <PersonaComponent
                      setVerificationStatus={handleVerificationStatus}
                    />
                    <span className="mt-2 px-4 text-gray-500">
                      For security reasons you can only book or add trips to
                      FullHouse if your account is verified!
                    </span>
                  </FormControl>
                </>,
              ]}
            ></StepperComponent>
          </>
        }
      ></BaseModal>
    </>
  );
}

CreateAccountModal.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  createAccountData: PropTypes.object.isRequired,
};
