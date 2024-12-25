import {
  Box,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  LinearProgress,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import {
  EyeIcon,
  EyeOffIcon,
  LogInIcon,
  MailIcon,
  RocketIcon,
} from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useAlert } from '../provider/AlertProvider.jsx';
import { useAuth } from '../provider/AuthenticationProvider.jsx';
import beachHut from './../assets/beach-hut.png';
import BaseModal from './BaseModal';


export default function LoginSignUpModal({
  handleClose,
  open,
  modalType, // type of the modal: login or signup
  setModalType, // function to set the modal type
  setOpenCreateAccountModal, // function to open the create account modal after signup
  setCreateAccountData, //function to send username and password to create account modal
}) {
  const { setToken } = useAuth();
  const [loading, setLoading] = useState(false); //show loading circle on button for visual feedback after sending requests

  const { setAlert } = useAlert();

  const logInTitle = 'Log In'; //rendered at multiple places so save in variable
  const signUpTitle = 'Sign Up';

  let [email, setEmail] = useState('');
  let [password, setPassword] = useState('');
  let [confirmPassword, setConfirmPassword] = useState(''); // only for signup
  const [passwordVisibility, setPasswordVisibility] = useState(false); // to toggle password readable or hidden as dots
  const [formError, setFormError] = useState({}); //object saving form errors

  //toggle password visibility
  const handlePassswordVisibility = () => {
    setPasswordVisibility(!passwordVisibility);
  };

  const handleChange = () => {
    const { id, value } = event.target;
    switch (id) {
      case 'email':
        email = value;
        setEmail(value);
        break;
      case 'password':
        password = value;
        setPassword(value);
        break;
      case 'confirmpassword':
        confirmPassword = value;
        setConfirmPassword(value);
        break;
    }
    validateForm(id);
  };

  const validateForm = (id = '') => {
    const emailRegex =
      /^(([^<>()[\]\\.,;:+\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; //checks correct email format
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z0-9\d@$!#%*?&]{8,}$/; //cheks if password has at least 1 lowercase, 1 uppercase, 1 number and 1 special character
    const lowerCaseRegex = /[a-z]/; //also single checks for individual error messages
    const upperCaseRegex = /[A-Z]/;
    const numberRegex = /[0-9]/;
    const specialCharacterRegex = /[@$!#%*?&]/;

    let hasError = false; //returns true if the form has an error but works instantly since addFormError() is async, enables validation to work even before change is rendered

    switch (id) {
      case '':
      case 'email':
        if (!email) {
          addFormError('email', 'Email is required');
          hasError = true;
        } else if (!emailRegex.test(email)) {
          addFormError('email', 'Invalid email');
          hasError = true;
        } else if (formError.email) {
          removeFormError('email');
        }
        if (id === 'email') break;
      //fall through
      case 'password':
      case 'confirmpassword':
        if (!password) {
          addFormError('password', 'Password is required');
          hasError = true;
        } else if (modalType === 'signup') {
          if (password.length < 8) {
            addFormError('password', 'Password must be at least 8 characters');
            hasError = true;
          } else if (!lowerCaseRegex.test(password)) {
            addFormError(
              'password',
              'Password must contain at least 1 lowercase'
            );
            hasError = true;
          } else if (!upperCaseRegex.test(password)) {
            addFormError(
              'password',
              'Password must contain at least 1 uppercase'
            );
          } else if (!numberRegex.test(password)) {
            addFormError('password', 'Password must contain at least 1 number');
            hasError = true;
          } else if (!specialCharacterRegex.test(password)) {
            addFormError(
              'password',
              'Password must contain at least 1 special character'
            );
            hasError = true;
          } else if (!passwordRegex.test(password)) {
            addFormError(
              'password',
              'Invalid password: 8-40 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character'
            );
            hasError = true;
          } else {
            if (formError.password) removeFormError('password');
          }
          if (!formError.password) {
            if (!confirmPassword) {
              addFormError('confirmpassword', 'Please repeat your password');
              hasError = true;
            } else if (confirmPassword !== password) {
              addFormError('confirmpassword', 'Passwords do not match');
              hasError = true;
            } else if (formError.confirmpassword) {
              removeFormError('confirmpassword');
            }
          }
        } else {
          if (formError.password) removeFormError('password');
        }
        break;
    }

    return !hasError;
  };

  const checkMail = async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_BACKEND_URL + '/user/checkMail/' + email
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };

  const addFormError = (id, errorMessage) => {
    if (formError[id]) {
      formError[id].message = errorMessage;
      return;
    }
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

  //trigger login or signup by pressing the enter key for ease of use
  const handleKeypress = (e) => {
    if (e.keyCode === 13) {
      if (modalType === 'login') handleLogin();
      if (modalType === 'signup') handleSignUp();
    }
  };

  //add listener to listen for enter
  useEffect(() => {
    window.addEventListener('keypress', handleKeypress);

    // Cleanup function to remove the event listener after component unmounts
    return () => {
      window.removeEventListener('keypress', handleKeypress);
    };
  }); // Empty dependency array means this effect runs once on mount and cleanup on unmount

  //handles the signup
  const handleSignUp = async () => {
    setLoading(true);
    if (validateForm()) {
      if (await checkMail()) {
        addFormError('checkmail', 'Email already in use.');
      } else {
        setOpenCreateAccountModal(true);
        setCreateAccountData({ email: email, password: password });
        setEmail('');
        setPassword('');
        handleClose();
        setAlert('success', 'Signup successful');
      }
    }
    setLoading(false);
  };

  // login request to backend when user presses login button, sends the password and email to check if user exists
  const handleLogin = async () => {
    setLoading(true);
    axios.defaults.withCredentials = true;
    if (validateForm()) {
      try {
        await axios.post(import.meta.env.VITE_BACKEND_URL + '/user/login', {
          email: email,
          password: password,
        });
        setToken(true);
        handleClose(); //close modal after successful login
        setAlert('success', 'Welcome back ✌🏽');
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
    }
    setLoading(false);
  };

  //switches between login and signup modal by changing type variable which is used to render the correct form
  const switchModalType = () => {
    setFormError({});
    setModalType(modalType === 'login' ? 'signup' : 'login');
  };

  return (
    <>
      <BaseModal
        title={modalType === 'login' ? logInTitle : signUpTitle}
        open={open}
        handleClose={handleClose}
        description="Login and SignUp modal"
        image={beachHut}
        onKeyUp={handleKeypress}
        content={
          // handleChange is called on every textfield change in the form
          <Box component="form" onChange={handleChange} className="mx-24">
            <FormControl fullWidth className="formcontrol text-left">
              <TextField
                type="text"
                label="Email"
                id="email"
                className="input-field"
                required
                value={email}
                error={!!formError.email}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <MailIcon className="dark-icon" />
                    </InputAdornment>
                  ),
                }}
              />
              <p className="helper-text">
                {formError.email ? formError.email.message : ''}
                {formError.checkmail && !formError.email
                  ? formError.checkmail.message
                  : ''}
              </p>
            </FormControl>
            <FormControl fullWidth className="formcontrol text-left">
              <TextField
                type={passwordVisibility ? 'text' : 'password'} //toggle password visibility by changing type
                label="Password"
                id="password"
                className="input-field"
                required
                value={password}
                error={!!formError.password}
                InputProps={{
                  //adds the eye at the end of the password field an controls if it is open or not
                  endAdornment: (
                    <InputAdornment position="end">
                      {passwordVisibility ? (
                        <EyeOffIcon
                          className="dark-icon cursor-pointer"
                          onClick={handlePassswordVisibility}
                        />
                      ) : (
                        <EyeIcon
                          className="dark-icon cursor-pointer"
                          onClick={handlePassswordVisibility}
                        />
                      )}
                    </InputAdornment>
                  ),
                }}
              />
              {modalType === 'signup' ? (
                //shows password strength as a progress bar
                <LinearProgress
                  variant="determinate"
                  size="sm"
                  value={Math.min((password.length * 100) / 14, 100)}
                  className="mx-3 rounded-full bg-gray-400 [&_span]:bg-gradient-to-l [&_span]:from-primary [&_span]:to-light"
                />
              ) : (
                //empty paragraph to keep the layout from 'jumping' when switching between login and signup
                <p className="h-3"></p>
              )}
              <Box className="flex min-h-6 justify-between">
                <p className="helper-text">
                  {formError.password ? formError.password.message : ''}
                </p>
                {modalType === 'signup' && !formError.password && (
                  <Typography className="text-[hsl(var(--hue) 80% 30%)] self-end">
                    {password.length < 6 && 'Very weak'}
                    {password.length >= 6 && password.length < 8 && 'Weak'}
                    {password.length >= 8 && password.length < 14 && 'Strong'}
                    {password.length >= 14 && 'Very strong'}
                  </Typography>
                )}
              </Box>
            </FormControl>
            {modalType === 'login' ? (
              <>
                {/* render the login button and link to switch to sing up*/}
                <IconButton
                  color="inherit"
                  onClick={handleLogin}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading && (
                    <CircularProgress className="absolute h-8 w-8 text-white [&_svg]:mr-0" />
                  )}
                  <LogInIcon /> {logInTitle}
                </IconButton>
                <p className="mt-1 text-gray-500">
                  Don&apos;t have an account?{' '}
                  <span
                    onClick={switchModalType}
                    className="cursor-pointer underline"
                  >
                    {signUpTitle}
                  </span>
                </p>
              </>
            ) : (
              <>
                {/* render the 2nd passwort field for repeating the pw and the button + link similar to above */}
                <FormControl fullWidth className="formcontrol text-left">
                  <TextField
                    type={passwordVisibility ? 'text' : 'password'}
                    label="Repeat Password"
                    id="confirmpassword"
                    className="input-field"
                    required
                    value={confirmPassword}
                    error={!!formError.confirmpassword}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {passwordVisibility ? (
                            <EyeOffIcon
                              className="dark-icon cursor-pointer"
                              onClick={handlePassswordVisibility}
                            />
                          ) : (
                            <EyeIcon
                              className="dark-icon cursor-pointer"
                              onClick={handlePassswordVisibility}
                            />
                          )}
                        </InputAdornment>
                      ),
                    }}
                  />
                  <p className="helper-text">
                    {formError.confirmpassword
                      ? formError.confirmpassword.message
                      : ''}
                  </p>
                </FormControl>

                <IconButton
                  color="inherit"
                  onClick={handleSignUp}
                  disabled={loading}
                  className="btn btn-primary mt-6 transition-all"
                >
                  {loading && (
                    <CircularProgress className="absolute h-8 w-8 text-white [&_svg]:mr-0" />
                  )}
                  <RocketIcon />
                  {signUpTitle}
                </IconButton>
                <p className="mt-1 text-gray-500">
                  Already have an ccount?{' '}
                  <span
                    onClick={switchModalType}
                    className="cursor-pointer underline"
                  >
                    {logInTitle}
                  </span>
                </p>
              </>
            )}
          </Box>
        }
      />
    </>
  );
}

LoginSignUpModal.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  modalType: PropTypes.string.isRequired,
  setModalType: PropTypes.func.isRequired,
  setOpenCreateAccountModal: PropTypes.func.isRequired,
  setCreateAccountData: PropTypes.func.isRequired,
};
