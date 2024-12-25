import { CheckCircleIcon, InfoIcon, XCircleIcon } from 'lucide-react';
import PropTypes from 'prop-types';
import { getFormattedDay, getFormattedTime } from '../utils/DateFormatUtils';

export default function ChatMessageComponent({
  type = 'normal', // type of message (normal, request, accepted, declined)
  text, // message text
  time, //time of message
  position, // orientation of message in Chat window (left, right)
}) {
  return (
    <div
      className={`mb-4 h-fit w-fit max-w-[66%] rounded-xl  p-4 ${position == 'left' ? 'rounded-tl-none bg-white' : 'self-end rounded-tr-none bg-light text-white'}`}
    >
      {type != 'normal' && (
        <div
          className={`-m-4 mb-2 flex items-center gap-2 p-2 text-dark ${type == 'pending' && 'bg-blue-100'} ${type == 'accepted' && 'bg-green-100 '} ${(type == 'declined' || type == 'canceled') && 'bg-red-100'} ${position == 'left' ? 'rounded-tr-xl' : 'rounded-tl-xl'}`}
        >
          {type == 'pending' && (
            <>
              <InfoIcon className="text-blue-600" />{' '}
              {position == 'left' ? (
                <span>You received a request</span>
              ) : (
                <span>You sent a request</span>
              )}
            </>
          )}
          {type == 'accepted' && (
            <>
              <CheckCircleIcon className="text-green-600" />
              {position == 'left' ? (
                <span>Your request was Accepted</span>
              ) : (
                <span>You accepted the request</span>
              )}
            </>
          )}
          {(type == 'declined' || type == 'canceled') && (
            <>
              <XCircleIcon className="text-red-600" />
              {position == 'left' ? (
                <span>Your request was {type}</span>
              ) : (
                <span>You {type} the request</span>
              )}
            </>
          )}
        </div>
      )}
      <div className="flex justify-end">
        <span className="min-h-5">{text}</span>
        <span className="-mt-2 ml-2 self-end text-right align-bottom text-xs">
          {getFormattedDay(time)}
          <p>{getFormattedTime(time)}</p>
        </span>
      </div>
    </div>
  );
}
ChatMessageComponent.propTypes = {
  type: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  position: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
};
