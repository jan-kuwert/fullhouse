import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
} from '@mui/material';
import axios from 'axios';
import {
  LogInIcon,
  LogOutIcon,
  LuggageIcon,
  MessageSquareIcon,
  SearchIcon,
  UserIcon,
  UserPlusIcon,
} from 'lucide-react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAlert } from '../provider/AlertProvider';
import { useAuth } from '../provider/AuthenticationProvider';
import { useSearch } from '../provider/SearchProvider';
import fullhouseLogo from './../assets/fullhouse-logo.svg';

export default function NavBarComponent({ setOpenModal }) {
  const { setToken, setUser, user, getFirstNameLetter, unreadMessages } =
    useAuth();

  const { setAlert } = useAlert();

  // Get searchQuery, handleSearch and clearSearch from SearchProvider
  const { searchText, handleTextChange } = useSearch();

  const navigate = useNavigate();

  // anchor for menu pop up
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // logout request
  const handleLogOut = async () => {
    try {
      await axios.post(import.meta.env.VITE_BACKEND_URL + '/user/logout');
      setUser(null);
      setToken(null);
      navigate('/');
      setAlert('success', 'Logout successful. See you soon 😉');
    } catch (error) {
      setAlert('error', 'Error logging out');
      console.error(error);
    }
  };

  return (
    <Box className="min-h-20">
      <AppBar
        position="fixed"
        className="bg-white bg-opacity-70 shadow-none backdrop-blur-lg"
      >
        <Toolbar className="grid grid-cols-3 gap-x-6 px-12 text-dark">
          <Link
            to={'/'}
            className="flex max-h-8 w-fit flex-row items-center text-2xl font-normal"
          >
            <img
              src={fullhouseLogo}
              className="logo mr-2 w-10"
              alt="Fullhouse Logo"
            />
            FullHouse
          </Link>
          {/*TextsearchComponent */}
          <div className="flex w-6/12 min-w-80 flex-row items-center justify-self-center rounded-md bg-bright px-4 py-2 transition-all focus-within:w-7/12 focus-within:min-w-96">
            <input
              className="w-full focus:outline-none"
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={handleTextChange}
            />
            <SearchIcon className="text-dark" />
          </div>
          <IconButton onClick={handleMenu} className="w-14 justify-self-end">
            <Badge
              badgeContent={anchorEl ? 0 : unreadMessages}
              className="text-white [&_.MuiBadge-badge]:bg-gradient-to-br [&_.MuiBadge-badge]:from-primary [&_.MuiBadge-badge]:to-light"
            >
              <Avatar
                src={user?.profilePicture && user.profilePicture.url}
                variant="filled"
                className="cursor-pointer bg-bright text-dark shadow"
              >
                {user ? (
                  <> {!user?.profilePicture && <>{getFirstNameLetter()}</>}</>
                ) : (
                  <UserIcon />
                )}
              </Avatar>
            </Badge>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            className="[&_.MuiMenu-paper]:mt-1 [&_.MuiMenu-paper]:bg-bright [&_.MuiMenu-paper]:px-4 [&_.MuiMenu-paper]:py-2 [&_.MuiMenu-paper]:shadow-md [&_.MuiPaper-root]:rounded-xl"
          >
            {user ? (
              <div>
                {/* show menu with all options only when logged in*/}
                <MenuItem
                  onClick={() => {
                    navigate('/Chat');
                    handleClose();
                  }}
                  className="rounded-md py-2 pr-12 text-xl"
                >
                  <ListItemIcon>
                    <Badge
                      badgeContent={unreadMessages}
                      className="text-white [&_.MuiBadge-badge]:bg-gradient-to-br [&_.MuiBadge-badge]:from-primary [&_.MuiBadge-badge]:to-light"
                    >
                      <MessageSquareIcon className="dark-icon" />
                    </Badge>
                  </ListItemIcon>
                  Chat
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate('/myTrips');
                    handleClose();
                  }}
                  className="rounded-md py-2 pr-12 text-xl"
                >
                  <ListItemIcon>
                    <LuggageIcon className="dark-icon" />
                  </ListItemIcon>
                  My Trips
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate('/account');
                    handleClose();
                  }}
                  className="rounded-md py-2 pr-12 text-xl"
                >
                  <ListItemIcon>
                    <UserIcon className="dark-icon" />
                  </ListItemIcon>
                  Account
                </MenuItem>
                <Divider variant="middle" component="li" />
                <MenuItem
                  onClick={() => {
                    handleLogOut();
                    handleClose();
                  }}
                  className="rounded-md py-2 pr-12 text-xl"
                >
                  <ListItemIcon>
                    <LogOutIcon className="dark-icon" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </div>
            ) : (
              <div>
                {/* show only log in and sign up if not logged in */}
                <MenuItem
                  onClick={() => {
                    setOpenModal('signup');
                    handleClose();
                  }}
                  className="rounded-md py-2 pr-12 text-xl"
                >
                  <ListItemIcon>
                    <UserPlusIcon className="dark-icon" />
                  </ListItemIcon>
                  Sign Up
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setOpenModal('login');
                    handleClose();
                  }}
                  className="rounded-md py-2 pr-12 text-xl"
                >
                  <ListItemIcon>
                    <LogInIcon className="dark-icon" />
                  </ListItemIcon>
                  Log In
                </MenuItem>
              </div>
            )}
          </Menu>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

NavBarComponent.propTypes = {
  setOpenModal: PropTypes.func.isRequired,
};
