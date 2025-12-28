import { createContext, useContext, useEffect, useState } from "react";
import socket from "../socket.js";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [messagesByOrder, setMessagesByOrder] = useState({});
  const [unreadByOrder, setUnreadByOrder] = useState({});

  useEffect(() => {
    socket.on("chat-message", (message) => {
      setMessagesByOrder((prev) => ({
        ...prev,
        [message.orderId]: [...(prev[message.orderId] || []), message],
      }));

      setUnreadByOrder((prev) => ({
        ...prev,
        [message.orderId]: (prev[message.orderId] || 0) + 1,
      }));
    });

    return () => socket.off("chat-message");
  }, []);

  const sendMessage = (message) => {
    socket.emit("chat-message", message);
  };

  const joinChat = (orderId) => {
    socket.emit("join-chat", { orderId });
  };

  const clearUnread = (orderId) => {
    setUnreadByOrder((prev) => {
      if (!prev[orderId]) return prev;
      return { ...prev, [orderId]: 0 };
    });
  };

  return (
    <ChatContext.Provider
      value={{
        socket,
        messagesByOrder,
        unreadByOrder,
        sendMessage,
        joinChat,
        clearUnread,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
