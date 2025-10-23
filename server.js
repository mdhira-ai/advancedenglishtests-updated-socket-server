//server.js
const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const cors = require("cors");
const {
  setUserSocketID,
  disconnectUserSocketID,
  disconnectSignout,
  setUserPeerID,
  findSocketByPeerId,
} = require("./utils");

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

  socket.on("update-peer-id", async (data) => {
    const userId = data.userId;
    const peerId = data.peerID;
    // console.log(`User ${userId} updated peer ID to ${peerId}`);
    await setUserPeerID(userId, peerId);
    // Here you can implement a function to update the peer ID in the database if needed
  });

  socket.on("signout", async (data) => {
    const userId = data.userId;
    console.log(`User ${userId} signed out from socket ID ${socket.id}`);
    await disconnectSignout(socket.id);
  });

  socket.on("call-rejected", async (data) => {
    const { toPeerId, fromPeerId, fromUserId } = data;
    // console.log(`Call rejected: ${fromUserId} (${fromPeerId}) to ${toPeerId}`);
    // check if toPeerId is connected and tosocketid exists
    const socketid = await findSocketByPeerId(toPeerId);

    if (socketid) {
      // console.log(`Socket ID found for peer ID: ${toPeerId} -> ${socketid}`);
      io.to(socketid).emit("call-rejected", {
        fromPeerId: fromPeerId,
        fromUserId: fromUserId,
      });
    } else {
      console.log(`Socket ID not found for peer ID: ${toPeerId}`);
    }
  });

  // In your socket server
  socket.on("call-cancelled", async (data) => {

    // Find the target user's socket and emit the cancellation
    const targetSocket = await findSocketByPeerId(data.toPeerId);
    if (targetSocket) {
      io.to(targetSocket).emit("call-cancelled", {
        fromPeerId: data.fromPeerId,
        fromUserId: data.fromUserId,
      });
    } else {
      console.log(`No socket found for user ID: ${data.toUserId}`);

    }
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
