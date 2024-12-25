import {
  Avatar,
  Box,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import axios from 'axios';
import {
  Building2Icon,
  EarthIcon,
  EyeIcon,
  EyeOffIcon,
  ImagePlus,
  MailIcon,
  PenIcon,
  SaveIcon,
  Trash2Icon,
  TypeIcon,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DialogComponent from '../components/DialogComponent.jsx';
import HeaderComponent from '../components/HeaderComponent.jsx';
import UploadFileComponent from '../components/UploadFileComponent.jsx';
import { useAlert } from '../provider/AlertProvider.jsx';
import { useAuth } from '../provider/AuthenticationProvider.jsx';

export default function AccountPage() {
  const { user, setUser, setToken } = useAuth();
  const { setAlert } = useAlert();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState({});
  const [profilePicture, setProfilePicture] = useState([]);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [newPasswordVisibility, setNewPasswordVisibility] = useState(false);
  const [currentPassword, setCurrentPassword] = useState(''); // Add this line
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileDescription, setProfileDescription] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
    const emailRegex =
      /^(([^<>()[\]\\.,;:+\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; //checks correct email format
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z0-9\d@$!#%*?&]{8,}$/; //cheks if password has at least 1 lowercase, 1 uppercase, 1 number and 1 special character
    const lowerCaseRegex = /[a-z]/; //also single checks for individual error messages
    const upperCaseRegex = /[A-Z]/;
    const numberRegex = /[0-9]/;
    const specialCharacterRegex = /[@$!#%*?&]/;

    let hasErrors = false;

    switch (id) {
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
      // falls through
      case 'bio':
        if (
          (!value && !bioRegex.test(profileDescription)) ||
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
      case 'email':
        if (
          (!value && !emailRegex.test(email)) ||
          (value && !emailRegex.test(value))
        ) {
          addFormError('email', 'Email is required');
          hasErrors = true;
        } else if (!emailRegex.test(email)) {
          addFormError('email', 'Invalid email');
          hasErrors = true;
        } else if (formError.email) {
          removeFormError('email');
        }
        if (id === 'email') break;
      // falls through
      case 'currentpassword':
      // falls through
      case 'newpassword':
      // falls through
      case 'confirmnewpassword':
        if (newPassword.length < 8) {
          addFormError(
            'confirmnewpassword',
            'Password must be at least 8 characters'
          );
          hasErrors = true;
        } else if (!lowerCaseRegex.test(newPassword)) {
          addFormError(
            'confirmnewpassword',
            'Password must contain at least 1 lowercase'
          );
          hasErrors = true;
        } else if (!upperCaseRegex.test(newPassword)) {
          addFormError(
            'confirmnewpassword',
            'Password must contain at least 1 uppercase'
          );
        } else if (!numberRegex.test(newPassword)) {
          addFormError(
            'confirmnewpassword',
            'Password must contain at least 1 number'
          );
          hasErrors = true;
        } else if (!specialCharacterRegex.test(newPassword)) {
          addFormError(
            'confirmnewpassword',
            'Password must contain at least 1 special character'
          );
          hasErrors = true;
        } else if (!passwordRegex.test(newPassword)) {
          addFormError(
            'confirmnewpassword',
            'Invalid password: 8-40 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character'
          );
          hasErrors = true;
        } else {
          if (formError.confirmnewpassword)
            removeFormError('confirmnewpassword');
        }
        if (!formError.newpassword) {
          if (!confirmNewPassword) {
            addFormError('confirmpassword', 'Please repeat your password');
            hasErrors = true;
          } else if (confirmNewPassword !== newPassword) {
            addFormError('confirmpassword', 'Passwords do not match');
            hasErrors = true;
          } else if (formError.confirmpassword) {
            removeFormError('confirmpassword');
          }
        }
        if (id === 'confirmnewpassword') break;
      // falls through
      case 'profilepicture':
        if (profilePicture.length === 0) {
          addFormError('profilepicture', 'Please upload a profile picture');
          hasErrors = true;
        } else {
          if (formError.profilepicture) removeFormError('profilepicture');
        }
        if (id === 'profilepicture') break;
    }
    //returns true if no errors are present and verification succeded
    return !hasErrors;
  };

  const handleChange = (event) => {
    const { id, value } = event.target;
    switch (id) {
      case 'email':
        setEmail(value);
        break;
      case 'currentpassword':
        setCurrentPassword(value);
        break;
      case 'newpassword':
        setNewPassword(value);
        break;
      case 'confirmnewpassword':
        setConfirmNewPassword(value);
        break;
      case 'firstname':
        setFirstName(value);
        break;
      case 'lastname':
        setLastName(value);
        break;
      case 'country':
        setCountry(value);
        break;
      case 'city':
        setCity(value);
        break;
      case 'bio':
        setProfileDescription(value);
        break;
      case 'profilepicture':
        setProfilePicture(value);
        break;
    }
    validateForm(id, value);
  };

  const updateProfilePicture = (newProfilePicture) => {
    if (newProfilePicture && newProfilePicture.length > 0) {
      setProfilePicture(newProfilePicture);
    }
  };

  const initInputs = useCallback(() => {
    setProfilePicture(user?.profilePicture);
    setEmail(user?.email);
    setNewPassword('');
    setCurrentPassword('');
    setFirstName(user?.firstName);
    setLastName(user?.lastName);
    setProfileDescription(user?.profileDescription);
    setCity(user?.location?.city);
    setCountry(user?.location?.country);
  }, [user]);

  useEffect(() => {
    initInputs();
  }, [user, initInputs]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const checkMail = async () => {
    if (user.email === email) return false;
    try {
      const response = await axios.get(
        import.meta.env.VITE_BACKEND_URL + '/user/checkMail/' + email
      );
      return !response.data;
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    axios.defaults.withCredentials = true;
    if (validateForm()) {
      if (!(await checkMail())) {
        const editedUser = {
          email,
          password: newPassword,
          currentPassword,
          firstName,
          lastName,
          profileDescription,
          city,
          country,
          profilePicture,
        };
        try {
          const response = await axios.put(
            `${import.meta.env.VITE_BACKEND_URL}/user/update/${user?._id}`,
            editedUser,
            {
              withCredentials: true,
            }
          );
          setUser(response.data); // Set the user with updated data returned from the server
          setAlert('success', 'User updated successfully');
          setEditMode(false);
        } catch (error) {
          console.error('Failed to update user data:', error);
          setAlert('error', 'Failed to update Trip');
        }
      } else {
        setAlert('error', 'Email already in use');
      }
      setLoading(false);
    }
  };

  //cancel the edit mode and reset the inputs + password visibility
  const handleCancel = () => {
    setCancelDialogOpen(false);
    setEditMode(false);
    initInputs();
    setPasswordVisibility(false);
    setNewPasswordVisibility(false);
    setFormError({});
  };

  //delete account from db
  const handleDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/user/delete`, {
        withCredentials: true,
      });
      setAlert('success', 'Account deleted successfully');
      //handle the logout by resetting user and token variables and redirecting to home page immediatly (would happen anyway but slower)
      setUser(null);
      setToken(null);
      setDeleteDialogOpen(false);
      navigate('/');
    } catch (error) {
      setAlert('error', 'Error deleting account.');
      console.error('Failed to delete user:', error);
    }
  };

  return (
    <Box className="flex min-h-[calc(100vh-240px)] w-full justify-center">
      <Box
        component="form"
        onChange={handleChange}
        className="flex w-1/3 min-w-[400px] max-w-[600px] flex-col"
      >
        <HeaderComponent title="Account"></HeaderComponent>

        <Box className="mb-6 w-full">
          <p>Profile Picture</p>
          {!editMode && (
            <Avatar
              src={user?.profilePicture && user.profilePicture.url}
              className="mt-2 h-20 w-20"
            />
          )}
          {editMode && (
            <Box className="my-3">
              <UploadFileComponent
                setParentFiles={updateProfilePicture}
                maxFiles={1}
                icon={<ImagePlus className="my-4 h-10 w-10" />}
              />
            </Box>
          )}
        </Box>
        <Box className="flex space-x-4">
          <FormControl fullWidth className="text-left">
            <TextField
              className="input-field"
              label="First Name"
              fullWidth
              disabled={!editMode}
              id="firstname"
              value={firstName}
              error={formError.firstname}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <TypeIcon />
                  </InputAdornment>
                ),
              }}
            />
            <p className="mb-3 mt-1 text-sm text-red-600">
              {formError.firstname ? formError.firstname.message : ''}
            </p>
          </FormControl>

          <FormControl fullWidth className="text-left">
            <TextField
              className="input-field"
              label="Last Name"
              fullWidth
              disabled={!editMode}
              id="lastname"
              value={lastName}
              error={formError.lastname}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <TypeIcon />
                  </InputAdornment>
                ),
              }}
            />
            <p className="mb-3 mt-1 text-sm text-red-600">
              {formError.lastname ? formError.lastname.message : ''}
            </p>
          </FormControl>
        </Box>
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
            label="Bio"
            fullWidth
            disabled={!editMode}
            id="bio"
            value={profileDescription}
            error={formError.bio}
            multiline
            rows={4}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <TypeIcon />
                </InputAdornment>
              ),
            }}
          />
          <p className="mb-3 mt-1 text-sm text-red-600">
            {formError.bio ? formError.bio.message : ''}
          </p>
        </FormControl>

        <FormControl fullWidth className="text-left">
          <TextField
            className="input-field"
            label="Email Address"
            fullWidth
            disabled={!editMode}
            id="email"
            value={email}
            error={formError.email}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <MailIcon />
                </InputAdornment>
              ),
            }}
          />
          <p className="htext-sm mb-3 mt-1 text-red-600">
            {formError.email ? formError.email.message : ''}
          </p>
        </FormControl>

        <FormControl fullWidth className="text-left">
          <TextField
            className="input-field"
            label="Current Password" // Add this field
            fullWidth
            type={passwordVisibility ? 'text' : 'password'}
            id="currentpassword"
            disabled={!editMode}
            value={currentPassword}
            error={formError.currentpassword}
            InputProps={{
              //adds the eye at the end of the password field an controls if it is open or not
              endAdornment: (
                <InputAdornment position="end">
                  {passwordVisibility ? (
                    <EyeOffIcon
                      className={`${editMode && 'cursor-pointer'}`}
                      onClick={() => {
                        if (editMode) setPasswordVisibility(false);
                      }}
                    />
                  ) : (
                    <EyeIcon
                      className={`${editMode && 'cursor-pointer'}`}
                      onClick={() => {
                        if (editMode) setPasswordVisibility(true);
                      }}
                    />
                  )}
                </InputAdornment>
              ),
            }}
          />
          <p className="mb-3 mt-1 text-sm text-red-600">
            {formError.currentpassword ? formError.currentpassword.message : ''}
          </p>
        </FormControl>

        <Box className="flex space-x-4">
          <FormControl fullWidth className="text-left">
            <TextField
              className="input-field"
              label="New Password"
              fullWidth
              type={newPasswordVisibility ? 'text' : 'password'}
              id="newpassword"
              disabled={!editMode}
              value={newPassword}
              error={formError.newpassword}
              InputProps={{
                //adds the eye at the end of the password field an controls if it is open or not
                endAdornment: (
                  <InputAdornment position="end">
                    {newPasswordVisibility ? (
                      <EyeOffIcon
                        className={`${editMode && ' cursor-pointer'}`}
                        onClick={() => {
                          if (editMode) setNewPasswordVisibility(false);
                        }}
                      />
                    ) : (
                      <EyeIcon
                        className={`${editMode && ' cursor-pointer'}`}
                        onClick={() => {
                          if (editMode) setNewPasswordVisibility(true);
                        }}
                      />
                    )}
                  </InputAdornment>
                ),
              }}
            />
            <p className="mb-3 mt-1 text-sm text-red-600">
              {formError.newpassword ? formError.newpassword.message : ''}
            </p>
          </FormControl>

          <FormControl fullWidth className="text-left">
            <TextField
              className="input-field"
              label="Confirm New Password"
              fullWidth
              type={newPasswordVisibility ? 'text' : 'password'}
              id="confirmnewpassword"
              disabled={!editMode}
              value={confirmNewPassword}
              error={formError.confirmnewpassword}
              InputProps={{
                //adds the eye at the end of the password field an controls if it is open or not
                endAdornment: (
                  <InputAdornment position="end">
                    {newPasswordVisibility ? (
                      <EyeOffIcon
                        className={`${editMode && 'cursor-pointer'}`}
                        onClick={() => {
                          if (editMode) setNewPasswordVisibility(false);
                        }}
                      />
                    ) : (
                      <EyeIcon
                        className={`${editMode && 'cursor-pointer'}`}
                        onClick={() => {
                          if (editMode) setNewPasswordVisibility(true);
                        }}
                      />
                    )}
                  </InputAdornment>
                ),
              }}
            />
            <p className="mb-3 mt-1 text-sm text-red-600">
              {formError.confirmnewpassword
                ? formError.confirmnewpassword.message
                : ''}
            </p>
          </FormControl>
        </Box>
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
          <Box className="flex justify-between">
            {/* TODO: add delete account handler */}
            <IconButton
              className="btn btn-danger w-1/3 min-w-44"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={loading}
            >
              {loading && (
                <CircularProgress className="absolute h-8 w-8 text-white [&_svg]:mr-0" />
              )}
              <Trash2Icon /> Delete
            </IconButton>
            <DialogComponent
              open={deleteDialogOpen}
              handleClose={() => setDeleteDialogOpen(false)}
              handleSubmit={handleDelete}
              dialogText="Your Account will be deleted permanently and cannot be recovered."
              withInput={false}
              confirmButtonText="Delete"
              color="red"
            ></DialogComponent>
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
  );
}
