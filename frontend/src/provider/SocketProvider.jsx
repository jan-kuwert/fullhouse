import { io } from 'socket.io-client';

class SocketProvider {
  static instance; // Singleton instance of the socket
  static user_id; // User ID to identify the current user

  // Private constructor to prevent instantiation
  constructor() {}

  /**
   * Returns the singleton instance of the socket.
   * Reinitializes the socket if the user_id has changed or the instance is undefined.
   * @param {string} user_id - The ID of the current user
   * @returns {Socket} - The singleton instance of the socket
   */
  static getInstance(user_id) {
    // Check if instance is undefined or user_id has changed
    if (SocketProvider.instance === undefined || SocketProvider.user_id !== user_id) {
      SocketProvider.user_id = user_id;
      SocketProvider.initializeSocket();
    }

    return SocketProvider.instance;
  }

  /**
   * Initializes the socket instance.
   */
  static initializeSocket() {
    if (SocketProvider.instance) {
      SocketProvider.instance.disconnect();
    }

    SocketProvider.instance = io(import.meta.env.VITE_BACKEND_URL, {
      withCredentials: true,
    });

    SocketProvider.setupEventHandlers();
  }

  /**
   * Sets up event handlers for the socket instance.
   */
  static setupEventHandlers() {

    // On connecntion, join the chat room with the user ID
    SocketProvider.instance.on('connect', () => {
      // Join My Room
      SocketProvider.joinChatRoom(SocketProvider.user_id);
      console.log('Joining room', SocketProvider.user_id);
    });

    // ON Diconnencting, leave the chat room with the user ID
    SocketProvider.instance.on('disconnect', () => {
      if (SocketProvider.user_id) {
        SocketProvider.leaveChatRoom(SocketProvider.user_id);
        console.log('Leaving room', SocketProvider.user_id);
        SocketProvider.closeSocket();
      }
    });
  }

  /**
   * Joins the chat room with the specified user ID.
   * @param {string} user_id - The ID of the user to join the chat room
   */
  static joinChatRoom(user_id) {
    if (SocketProvider.instance) {
      SocketProvider.instance.emit('joinChat', user_id);
    }
  }

  /**
   * Leaves the chat room with the specified user ID.
   * @param {string} user_id - The ID of the user to leave the chat room
   */
  static leaveChatRoom(user_id) {
    if (SocketProvider.instance) {
      SocketProvider.instance.emit('leaveChat', user_id);
    }
  }

  /**
   * Closes the socket connection.
   */
  static closeSocket() {
    if (SocketProvider.instance) {
      SocketProvider.instance.close();
      SocketProvider.instance = undefined;
    }
  }

}

export default SocketProvider;
