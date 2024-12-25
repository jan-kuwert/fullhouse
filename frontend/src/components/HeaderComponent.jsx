import { Box, IconButton } from '@mui/material';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

// header component for the trip page
export default function HeaderComponent({
  title,
  showButton = false,
  link = '',
}) {
  const navigate = useNavigate();

  return (
    <Box className="container mx-auto mb-4 mt-8 flex flex-row items-center justify-between ">
      <div className="flex h-full flex-row items-center">
        <IconButton className="h-12 w-12" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </IconButton>
        <p className="ml-2 h-fit text-3xl text-dark">{title}</p>
      </div>
      {showButton && (
        <IconButton
          className="btn btn-bright text-lg"
          onClick={() => window.open(link, '_blank')}
        >
          <ExternalLink />
          Accommodation Details
        </IconButton>
      )}
    </Box>
  );
}

HeaderComponent.propTypes = {
  title: PropTypes.string.isRequired,
  showButton: PropTypes.bool,
  link: PropTypes.string,
};
