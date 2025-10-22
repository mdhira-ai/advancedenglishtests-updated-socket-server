//server.js
const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const cors = require("cors");
const { setUserSocketID, disconnectUserSocketID, disconnectSignout } = require("./utils");

const port = 3001;
const app = express();

app.use(cors());
app.use(express.json());

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  console.log("a user connected", socket.id);

  // when user connects, set their socket ID in the database

  socket.on("join", async (data) => {
    const userId = data.userId;
    console.log(`User ${userId} joined with socket ID ${socket.id}`);
    await setUserSocketID(userId, socket.id);
  });

  socket.on("signout", async (data) => {
    const userId = data.userId;
    console.log(`User ${userId} signed out from socket ID ${socket.id}`);
    await disconnectSignout(socket.id);
  });

  socket.on("disconnect", async () => {
    console.log("user disconnected", socket.id);
    await disconnectUserSocketID(socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("<h1>Hello World!</h1>");
});

server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});
