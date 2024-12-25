import {
  Avatar,
  Box,
  IconButton,
  InputAdornment,
  Popover,
  TextField,
} from '@mui/material';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import {
  ArrowRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  SendHorizonalIcon,
  UserIcon,
} from 'lucide-react';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingRequestComponent from '../components/BookingRequestComponent.jsx';
import ChatMessageComponent from '../components/ChatMessageComponent.jsx';
import ChatPreviewComponent from '../components/ChatPreviewComponent.jsx';
import HeaderComponent from '../components/HeaderComponent';
import { useAuth } from '../provider/AuthenticationProvider.jsx';
import SocketProvider from '../provider/SocketProvider.jsx';

export default function ChatPage({
  setOpenModal,
  openModal,
  setModalPaymentTrip,
  setModalPaymentBookingRequest,
}) {
  const { user } = useAuth(); //get user data from context
  const navigate = useNavigate();

  const [socket, setSocket] = useState(null); // State to store socket instance

  const [chats, setChats] = useState([]); // holds all chats
  const [active, setActive] = useState(0); // 0,1,2...: index of active chat
  const [message, setMessage] = useState(''); //holds message
  let [messageValid, setMessageValid] = useState(false); //holds if message is valid
  const messageRegex = /^[A-Za-zäöüÄÖÜß\s\d!-&,.:%'"#$€?\\u]{1,2000}$/;
  const [showEmojis, setShowEmojis] = useState(false);
  const [emojiPopoverAnchorEl, setEmojiPopoverAnchorEl] = useState(null);

  // Default booking request status
  const [bookingRequestExists, setBookingRequestExists] = useState(false);
  const [showBookingRequest, setShowBookingRequest] = useState(true);

  // Function to handle switching between different chats
  const handleActiveChat = (index) => {
    setActive(index);
    markMessagesAsRead(index);
  };

  function emojiToUnicode(str) {
    return str.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      function (e) {
        return (
          '\\u' +
          e.charCodeAt(0).toString(16) +
          '\\u' +
          e.charCodeAt(1).toString(16)
        );
      }
    );
  }

  const handleEmojiClick = (event) => {
    setShowEmojis(true);
    setEmojiPopoverAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setShowEmojis(false);
    setEmojiPopoverAnchorEl(null);
  };

  // Function to handle message input changes, can handle events from message input or text from other sources like booking request for example
  const handleMessageChange = (e) => {
    if (
      messageRegex.test(e.target.value) &&
      messageRegex.test(emojiToUnicode(message))
    ) {
      setMessageValid(true);
    } else {
      setMessageValid(false);
    }
    setMessage(e.target.value);
  };

  //translates emoji to unicode and checks if it is a valid message 🙃 => \ud83d\ude43
  const handleEmoji = (emojiObject) => {
    if (messageRegex.test(emojiToUnicode(emojiObject.emoji))) {
      setMessageValid(true);
    } else {
      setMessageValid(false);
    }
    setMessage((prev) => prev + emojiObject.emoji);
  };

  //add listener to listen for enter
  useEffect(() => {
    window.addEventListener('keypress', handleKeypress);

    // Cleanup function to remove the event listener after component unmounts
    return () => {
      window.removeEventListener('keypress', handleKeypress);
    };
  }); // NO empty array here

  //trigger login or signup by pressing the enter key for ease of use
  const handleKeypress = (e) => {
    if (e.keyCode === 13) {
      sendMessage();
    }
  };

  // Function to send a message, allow messageText to change so bookin request Component can send custom messages
  const sendMessage = async (type = 'normal', messageText = message) => {
    if (
      (messageValid ||
        (messageText !== message &&
          messageRegex.test(emojiToUnicode(messageText)))) &&
      messageText.trim()
    ) {
      markMessagesAsRead(active);
      const payload = {
        chatId: chats[active]?._id,
        roomId: chats[active]?.receiver._id,
        message: {
          text: messageText,
          time: new Date(),
          type: type,
          sender: user?._id,
          unread: true,
        },
      };
      if (socket) {
        socket.emit('sendMessage', payload);
      }
      try {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/chat/sendMessage`,
          payload,
          { withCredentials: true }
        );
        setMessage('');
        addMessageToChat(payload.message, payload.chatId);
        setMessageValid(false);
        return true; //used to catch if message was sent in booking request component
      } catch (error) {
        console.error('Error sending message:', error);
        return false; //used to catch if message was sent in booking request component
      }
    } else {
      return false; //used to catch if message was sent in booking request component
    }
  };

  //sorts chats by last updated time
  const sortChats = (chats) => {
    setActive(0);

    return chats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  };

  // Function to update the updatedAt field of a chat which saves the last time this chat object was updated to sort chats by time
  const handleChatUpdatedAt = async (index, time) => {
    const payload = {
      chatId: chats[index]?._id,
      time: time,
    };
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/chat/updatedAt`,
        payload,
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Function to get chats
  const getChats = async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_BACKEND_URL + '/chat/byUser',
        { withCredentials: true }
      );
      setChats(sortChats(response.data));
      console.log(response.data);
    } catch (error) {
      console.error('Error getting chats:', error);
    }
  };

  // Function to add a message to a chat
  const addMessageToChat = useCallback(
    (message, id) => {
      if (chats.length === 0) {
        console.warn('Chats array is empty. Waiting for chats to populate...');
      }
      const chatIndex = chats.findIndex((chat) => chat._id == id); // Find the index of the chat object with matching _id

      if (chatIndex !== -1) {
        let updatedChats = [...chats];
        updatedChats[chatIndex].messages.push(message);
        updatedChats[chatIndex].updatedAt = message.time;
        handleChatUpdatedAt(chatIndex, message.time);
        updatedChats = sortChats(updatedChats);
        setChats(updatedChats);
      } else {
        console.error(`Chat with _id ${id} not found.`);
      }
    },
    [chats]
  );

  // If messages are read
  const markMessagesAsRead = async (index) => {
    if (index < 0 || index >= chats.length) {
      console.error('Invalid chat index:', index);
      return;
    }
    chats[index].messages.forEach((message) => {
      if (message.sender !== user._id) {
        message.unread = false;
      }
    });
    const chatId = chats[index]._id;
    try {
      await axios.post(
        import.meta.env.VITE_BACKEND_URL + '/chat/markRead',
        {
          chatId,
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleReceiveMessage = useCallback(
    (payload) => {
      if (chats.length === 0) {
        console.warn('Chats array is empty in handleReceiveMessage');
      }
      const chatId = payload?.chatId;
      const incomingMessage = payload?.message;
      const activeChatId = chats[active]?._id;
      if (chatId && chatId === activeChatId) {
        // We are in the chat that is currently active
        if (incomingMessage.sender != user._id) incomingMessage.unread = false;
      }
      addMessageToChat(incomingMessage, chatId); // Add the message to the chat
    },
    [chats, active, addMessageToChat, user]
  );

  // Get all chats on page load
  useEffect(() => {
    // Get all chats
    getChats();
  }, []);

  // Initialize socket on component mount
  useEffect(() => {
    // function to handle incoming messages

    if (user) {
      // Initialize socket and set up event listeners
      const currentSocket = SocketProvider.getInstance(user?._id);
      setSocket(currentSocket);

      // Listen for incoming messages
      currentSocket.on('receiveMessage', handleReceiveMessage);

      return () => {
        currentSocket.off('receiveMessage', handleReceiveMessage);
        if (currentSocket.connected) {
          currentSocket.disconnect();
          currentSocket.close();
        }
      };
    }
  }, [user, handleReceiveMessage]);

  // Render the Chat Page
  return (
    <>
      <HeaderComponent title="Chat" />
      <Box className="container mx-auto flex h-[82vh] flex-row gap-5 ">
        {/* Note: First Component */}
        {/* The first Column containing all the chats a user has sorted by Time */}
        <div className="relative flex w-1/4 flex-col gap-5 overflow-y-auto overflow-x-hidden rounded-xl bg-bright p-5">
          {chats.length > 0 &&
            chats.map((chat, i) => (
              // Renders the ProfilePicture, Firstname and trip as button to access the chat
              <ChatPreviewComponent
                firstName={chat?.receiver?.firstName}
                lastName={chat?.receiver?.lastName}
                tripShortTitle={chat?.trip?.shortTitle}
                profilePicture={chat?.receiver?.profilePicture.url}
                updatedAt={chat?.updatedAt}
                unreadCount={
                  chat.messages.filter((m) => m.unread && m.sender !== user._id)
                    .length
                }
                active={active}
                setActive={handleActiveChat}
                id={i}
                key={i}
              />
            ))}
        </div>

        {/* Note: Second and third component in second column */}
        {/* Second column: The chat, Displays the receiver of the messages at the top, then the messages and at the bottom the send message input*/}
        <div className="relative flex w-1/2 flex-1 flex-col overflow-hidden rounded-xl bg-bright">
          {bookingRequestExists && !showBookingRequest && (
            <IconButton
              className="absolute right-2 top-5  text-dark"
              onClick={() => setShowBookingRequest(!showBookingRequest)}
            >
              <ChevronsLeftIcon />
            </IconButton>
          )}
          {/* Note: second Component */}
          {/* This is the header bar with the avatar */}
          <div className="grid grid-cols-3 p-4">
            <div className="col-start-2 mx-auto flex items-center gap-4">
              <Avatar
                src={
                  chats.length > 0
                    ? chats[active].receiver.profilePicture.url
                    : ''
                }
                alt="avatar"
                className="h-12 w-12 bg-white shadow-sm"
              >
                {chats.length > 0 ? (
                  <>
                    {!chats[active]?.receiver.firstName && (
                      <>{chats[active].receiver.firstName[0]} </>
                    )}
                  </>
                ) : (
                  <UserIcon />
                )}
              </Avatar>
              <p className="text-nowrap text-2xl">
                {chats.length > 0 && chats[active].receiver.firstName}{' '}
                {chats.length > 0 && chats[active].receiver.lastName}
              </p>
            </div>
            {!bookingRequestExists && chats[active] && (
              <IconButton
                className="btn btn-white float-end h-fit w-fit justify-self-end px-6"
                onClick={() => navigate(`/trip/${chats[active].trip._id}`)}
              >
                <ArrowRightIcon /> Go to Trip
              </IconButton>
            )}
          </div>
          {/* All the messages in the chat. flex-col-reverse is used to show the chat scrolled to the bottom*/}
          <div className="flex flex-1 flex-col-reverse overflow-auto px-4 py-2">
            <div className="flex flex-col">
              {chats.length > 0 &&
                chats[active].messages.map((message, index) => (
                  <ChatMessageComponent
                    key={index}
                    type={message.type}
                    text={message.text}
                    time={message.time}
                    position={
                      message.sender == chats[active].receiver._id
                        ? 'left'
                        : 'right' // === user._id
                    }
                  />
                ))}
            </div>
          </div>

          {/* Note: thrid Component */}
          {/* The send message input with send button */}
          <div className="flex h-fit pb-4 pt-2">
            <IconButton
              onClick={handleEmojiClick}
              className="btn btn-white ml-4 w-fit px-4 shadow-none hover:shadow-md"
            >
              🤩
            </IconButton>
            <Popover
              id="emoji-picker"
              open={showEmojis}
              anchorEl={emojiPopoverAnchorEl}
              onClose={handleClose}
              className="[&_.MuiPaper-root]:rounded-xl"
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
            >
              <EmojiPicker onEmojiClick={handleEmoji} />
            </Popover>
            <TextField
              aria-label="Message"
              id="message"
              name="message"
              autoComplete="off"
              error={!messageValid}
              value={message}
              autoFocus
              placeholder="Message"
              className={`mx-4 w-full ${!messageValid && message != '' && '[&_input]:-m-0.5 [&_input]:rounded-2xl [&_input]:border-2 [&_input]:border-solid [&_input]:border-red-600'} rounded-2xl bg-white outline-none transition-all focus-within:shadow-md hover:shadow-md [&_fieldset]:border-none`}
              onChange={handleMessageChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => sendMessage()}>
                      <SendHorizonalIcon className="dark-icon" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>
        </div>

        {/* Note: Fourth Component */}
        {/* 3rd column showing status of booking Request only shown when Bookingrequest exists */}
        <div
          className={`${showBookingRequest ? 'w-1/4 min-w-80' : 'hidden'} relative overflow-auto rounded-xl bg-bright ${!bookingRequestExists && 'hidden'}`}
        >
          <IconButton
            className="absolute right-2 top-5 z-10 text-dark"
            onClick={() => setShowBookingRequest(!showBookingRequest)}
          >
            <ChevronsRightIcon />
          </IconButton>
          {showBookingRequest && (
            <BookingRequestComponent
              setOpenModal={setOpenModal}
              setBookingRequestExists={setBookingRequestExists}
              trip={chats.length > 0 ? chats[active].trip : {}}
              receiver={chats.length > 0 ? chats[active].receiver : {}}
              sendMessage={sendMessage}
              setModalPaymentTrip={setModalPaymentTrip}
              setModalPaymentBookingRequest={setModalPaymentBookingRequest}
            />
          )}
        </div>
      </Box>
    </>
  );
}

ChatPage.propTypes = {
  openModal: PropTypes.bool.isRequired,
  setopenModal: PropTypes.func.isRequired,
};
