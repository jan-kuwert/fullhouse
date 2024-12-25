import axios from 'axios';
import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext();

export const AuthenticationProvider = ({ children }) => {
  //State to hold the authentication token, allows to manullay navigate to pages that require authentication
  const [token, setToken_] = useState(localStorage.getItem('token'));
  const [user, setUser_] = useState();
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Function to set the authentication token
  const setToken = (newToken) => {
    setToken_(newToken);
  };

  // Function to set the user data
  const setUser = (newUser) => {
    setUser_(newUser);
  };

  // Function to get the first letter of the user's first name
  const getFirstNameLetter = () => {
    return user ? user.firstName.charAt(0).toUpperCase() : '';
  };

  // Effect to handle the token and user data
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      handleGetUser();
    } else {
      localStorage.removeItem('token');
      setToken_(null);
      setUser_(null);
    }
  }, [token]);

  // Function to get the user data
  const handleGetUser = async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_BACKEND_URL + '/user/get/',
        { withCredentials: true }
      );
      setToken(true);
      setUser(response.data.user);
    } catch (error) {
      setToken(false);
      console.error(error);
    }
  };

  useEffect(() => {
    if (token) handleGetUser();
  }, [token]);

  // Memoized value of the authentication context
  const contextValue = useMemo(
    () => ({
      token,
      setToken,
      user,
      setUser,
      getFirstNameLetter,
      unreadMessages,
    }),
    [token, user]
  );

  // Provide the authentication context to the children components
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthenticationProvider;

AuthenticationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
