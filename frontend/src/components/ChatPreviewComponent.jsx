import { Avatar, Badge, Button } from '@mui/material';
import { UserIcon } from 'lucide-react';
import PropTypes from 'prop-types';
import { getFormattedDay, getFormattedTime } from '../utils/DateFormatUtils';

export default function ChatPreviewComponent({
  active,
  setActive,
  id,
  firstName,
  lastName,
  profilePicture,
  tripShortTitle,
  unreadCount,
  updatedAt,
}) {
  return (
    <Button
      className={`btn font relative flex w-full flex-row items-center justify-between rounded-xl bg-white text-left normal-case text-dark transition-all hover:shadow-lg ${active == id && 'bg-gradient-to-r from-primary to-light text-white shadow-sm'} p-3`}
      onClick={() => setActive(id)}
    >
      <div className="flex flex-row items-center">
        <Avatar
          src={profilePicture}
          alt="avatar"
          className="mr-3 h-12 w-12 [&_svg]:mr-0"
        >
          {firstName ? <>{firstName[0]}</> : <UserIcon />}
        </Avatar>
        <div className="">
          <p className="text-xl font-semibold">
            {firstName} {lastName && lastName[0]}.
          </p>
          <p className="text-lg">{tripShortTitle}</p>
        </div>
      </div>
      <div className="flex h-full flex-col justify-between">
        <div
          className={`flex flex-col ${active == id ? 'text-white' : 'text-gray-500'}`}
        >
          <p>{updatedAt && getFormattedDay(updatedAt)}</p>
          <p>
            {updatedAt &&
              getFormattedDay(updatedAt) == '' &&
              getFormattedTime(updatedAt)}
          </p>
        </div>
        <div className="flex justify-end mr-3 mb-4">
          <Badge
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            badgeContent={unreadCount}
            className="text-white [&_.MuiBadge-badge]:bg-gradient-to-br [&_.MuiBadge-badge]:from-primary [&_.MuiBadge-badge]:to-light"
          ></Badge>
        </div>
      </div>
    </Button>
  );
}

ChatPreviewComponent.propTypes = {
  active: PropTypes.number,
  setActive: PropTypes.func.isRequired,
  profilePicture: PropTypes.string,
  id: PropTypes.number,
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  tripShortTitle: PropTypes.string.isRequired,
  unreadCount: PropTypes.number,
  updatedAt: PropTypes.string,
};
