import { Box, Divider } from '@mui/material';
import {
  FigmaIcon,
  GithubIcon,
  GitlabIcon,
  HeartIcon,
  HomeIcon,
  LinkedinIcon,
  LuggageIcon,
  MessageSquareIcon,
  UserIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../provider/AuthenticationProvider';
import fullhouseLogo from './../assets/fullhouse-logo.svg';

export function FooterComponent() {
  const { user } = useAuth();
  return (
    <Box className="relative mt-20 flex justify-center bg-bright p-6">
      <Box className="absolute bottom-4 left-12 flex flex-col text-sm text-gray-500">
        <p>FullHouse by Team15</p>
        <div className="flex space-x-4">
          <p>©2024</p>
          <p className="cursor-pointer hover:underline">Data Privacy</p>
          <p className="cursor-pointer hover:underline">Imprint</p>
        </div>
      </Box>
      <Link
        to={'/'}
        className="flex max-h-8 w-fit flex-row items-center text-xl font-normal"
      >
        <img
          src={fullhouseLogo}
          className="logo mr-2 w-10"
          alt="Fullhouse Logo"
        />
        FullHouse
      </Link>
      {user && (
        <>
          <Divider
            orientation="vertical"
            flexItem
            className="-my-3 ml-8 mr-4"
          />
          <Box className="flex space-x-4">
            <Link to="/">
              <HomeIcon className="hover:text-gray-600" />
            </Link>

            <Link to="/chat">
              <MessageSquareIcon className="hover:text-gray-600" />
            </Link>
            <Link to="/myTrips">
              <LuggageIcon className="hover:text-gray-600" />
            </Link>

            <Link to="/account">
              <UserIcon className="hover:text-gray-600" />
            </Link>
          </Box>
        </>
      )}
      <Divider orientation="vertical" flexItem className="-my-3 ml-8 mr-4" />
      <Box className="flex space-x-4">
        <a
          href="https://gitlab.lrz.de/seba-master-2024/team-15/prototype/"
          target="_blank"
          rel="noopener"
        >
          <GitlabIcon className="hover:text-[#fc6d26]" />
        </a>
        <Link to="/">
          <GithubIcon className="hover:text-gray-600" />
        </Link>
        <Link to="/">
          <LinkedinIcon className="hover:text-gray-600" />
        </Link>
        <a
          href="https://www.figma.com/design/KCKwdSIZJm5WMG91dWdENE/Mockups?t=hlPdp3UNhDKqclCA-0"
          target="_blank"
          rel="noopener"
        >
          <FigmaIcon className="hover:text-[#a259ff]" />
        </a>
      </Box>
      <Box className="absolute bottom-4 right-12 flex flex-col items-end text-sm text-gray-500">
        <p className="flex">
          Made with{' '}
          <HeartIcon className="mx-1 text-red-600 hover:animate-pulse" />
          by:
        </p>
        <div className="flex space-x-4">
          <p className="hover:animate-spin hover:text-primary">Ole</p>
          <p className="hover:animate-spin hover:text-primary">Simon</p>
          <p className="hover:animate-spin hover:text-primary">Leon</p>
          <p className="hover:animate-spin hover:text-primary">Jan</p>
        </div>
      </Box>
    </Box>
  );
}
