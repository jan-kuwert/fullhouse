import { Avatar, Box, Typography } from '@mui/material';
import { CheckIcon, EuroIcon, InfoIcon, UserIcon, XIcon } from 'lucide-react';
import PropTypes from 'prop-types';

export default function ParticipantChipComponent({
  participant,
  bookingRequest = null,
}) {
  return (
    <Box className="h-30 flex w-full items-center justify-between space-x-4 rounded-2xl bg-white p-3 mb-5">
      <Avatar
        src={participant?.profilePicture?.url}
        alt="avatar"
        className="h-12 w-12 bg-bright [&_svg]:mr-0"
      >
        {participant?.firstName ? (
          <>{participant?.firstName[0]}</>
        ) : (
          <UserIcon className="dark-icon" />
        )}
      </Avatar>
      <Box className="flex-1 overflow-hidden">
        <Typography className="overflow-hidden text-ellipsis whitespace-nowrap text-lg">
          {participant?.firstName} {participant?.lastName}
        </Typography>
        <Typography className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">
          {!bookingRequest && 'Accepted & paid'}
          {bookingRequest?.status && <>{bookingRequest?.status}</>}
        </Typography>
      </Box>

      <div
        className={`flex h-12 w-12 min-w-12 items-center justify-center place-self-end rounded-full ${!bookingRequest && 'bg-gradient-to-br from-primary to-light'}
           ${bookingRequest?.status === 'pending' && 'bg-blue-100'} ${bookingRequest?.status === 'accepted' && 'bg-green-100'}
           ${bookingRequest?.status === 'declined' && bookingRequest?.status === 'canceled' && 'bg-red-100'}`}
      >
        {!bookingRequest ? (
          <EuroIcon className="h-8 w-8 text-white" />
        ) : (
          <>
            {bookingRequest?.status === 'accepted' && (
              <CheckIcon className="h-8 w-8 text-green-600" />
            )}
            {bookingRequest?.status === 'declined' &&
              bookingRequest?.status === 'canceled' && (
                <XIcon className="h-8 w-8 text-red-600" />
              )}
            {bookingRequest?.status === 'pending' && (
              <InfoIcon className="h-8 w-8 text-blue-600" />
            )}
          </>
        )}
      </div>
    </Box>
  );
}

ParticipantChipComponent.propTypes = {
  participant: PropTypes.object.isRequired,
  bookingRequest: PropTypes.object,
};
