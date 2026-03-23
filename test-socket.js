const { io } = require("socket.io-client");

const socket = io("http://localhost:4000");

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  // join chat
  socket.emit("joinConversation", "9b8cc21c-b164-4323-ac46-b6bd91454c0f");

  // send message
  socket.emit("sendMessage", {
    conversationId: "9b8cc21c-b164-4323-ac46-b6bd91454c0f",
    senderId: "bbb46910-ec7d-46b1-97e1-5f48f03ef2ea",
    content: "Hello realtime 🚀 again ",
  });
});

socket.on("newMessage", (msg) => {
  console.log("NEW MESSAGE:", msg);
});