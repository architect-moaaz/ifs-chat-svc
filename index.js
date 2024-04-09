const express = require("express");
const cors = require("cors");
const messageRoutes = require("./routes/messages");
const userRoutes = require("./routes/user");
const app = express();
const socket = require("socket.io");
const checkNodeEnv = require("./configService");

var config = checkNodeEnv();

const {
  app: { port, originUrl },
  mongodb: { url },
} = config;

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

const server = app.listen(port, () => {
  console.log(`Server started on ${port}`);
  console.log(`Connected to ${url} `);
});
const io = socket(server, {
  cors: {
    origin: originUrl,
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  // console.log("Connection")
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    console.log("data", data.from);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });

  socket.on("send-videoid", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("videoid-recieve", data.videoid);
    }
  });
});
