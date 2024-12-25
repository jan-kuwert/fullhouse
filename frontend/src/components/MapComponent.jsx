import { IconButton } from '@mui/material';
import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
} from '@vis.gl/react-google-maps';
import { ExternalLinkIcon, HomeIcon } from 'lucide-react';
import PropTypes from 'prop-types';
import React from 'react';

// header component for the trip page
export default function MapComponent({ latitude, longitude, mapsLink }) {
  const position = { lat: latitude, lng: longitude };

  return (
    // div for the trip description card
    <div>
      <h2 className="mb-2 mt-4 text-2xl">Map</h2>
      <APIProvider
        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        libraries={['marker']}
      >
        <div className="relative overflow-clip rounded-xl">
          <Map
            style={{ width: '100%w', height: '60vh' }}
            mapId={'tripMap'}
            defaultCenter={position}
            defaultZoom={15}
            gestureHandling={'greedy'}
            disableDefaultUI={true}
          >
            <AdvancedMarker position={position} clickable={true}>
              <Pin background={'primary'} borderColor={'#16BAC5'} scale={1.5}>
                <HomeIcon className="text-white" />
              </Pin>
            </AdvancedMarker>
          </Map>

          <IconButton
            className="btn btn-bright absolute right-4 top-4 w-fit px-6 text-lg"
            onClick={() => window.open(mapsLink, '_blank')}
          >
            <ExternalLinkIcon />
            Link to Google Maps
          </IconButton>
        </div>
        <div className="h-10"></div>
      </APIProvider>
    </div>
  );
}

// Prop types for the TripDescriptionCard component
MapComponent.propTypes = {
  latitude: PropTypes.number.isRequired,
  longitude: PropTypes.number.isRequired,
  mapsLink: PropTypes.string.isRequired,
};
