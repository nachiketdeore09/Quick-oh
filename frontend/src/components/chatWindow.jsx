import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useChat } from "../context/ChatContext";

const ChatWindow = React.memo(({ open, onClose, orderId, currentUser }) => {
  const { messagesByOrder, sendMessage, clearUnread } = useChat();
  const [text, setText] = useState("");
  const didClearRef = useRef(false);

  const messages = messagesByOrder[orderId] || [];

  useEffect(() => {
    if (open && !didClearRef.current) {
      clearUnread(orderId);
      didClearRef.current = true;
    }
    if (!open) {
      didClearRef.current = false;
    }
  }, [open, orderId]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage({
      orderId,
      message: text,
      senderRole: currentUser.role,
      senderId: currentUser._id,
      createdAt: new Date(),
    });
    setText("");
  };

  if (!open) {
    return <Box sx={{ display: "none" }} />;
  }

  return createPortal(
    <Box
      sx={{
        position: "fixed",
        bottom: 90,
        left: 25,
        width: 320,
        height: 420,
        bgcolor: "background.paper",
        borderRadius: 3,
        boxShadow: 6,
        display: "flex",
        flexDirection: "column",
        zIndex: 2000,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 1.5,
          bgcolor: "primary.main",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        <Typography fontWeight="bold">Order Chat</Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          p: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === currentUser._id;
          return (
            <Box
              key={idx}
              sx={{
                alignSelf: isMe ? "flex-end" : "flex-start",
                bgcolor: isMe ? "primary.light" : "grey.200",
                color: "black",
                px: 1.5,
                py: 1,
                borderRadius: 2,
                maxWidth: "80%",
              }}
            >
              <Typography variant="caption" fontWeight={600}>
                {isMe ? "You" : msg.senderRole}
              </Typography>
              <Typography variant="body2">{msg.message}</Typography>
            </Box>
          );
        })}
      </Box>

      {/* Input */}
      <Box sx={{ p: 1, display: "flex", gap: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button variant="contained" onClick={handleSend}>
          Send
        </Button>
      </Box>
    </Box>,
    document.body
  );
});

export default ChatWindow;
