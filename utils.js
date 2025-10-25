const { PrismaClient } = require("./generated/prisma/client");

// when user connects, set their socket ID in the database
async function setUserSocketID(userId, socketID) {
  const prisma = new PrismaClient();

  try {
    await prisma.user_presence.upsert({
      where: { userId: userId },
      update: {
        socketID: socketID,
        updatedAt: new Date(),
        isOnline: true,
        lastSeen: new Date(),
        in_room: false,
      },
      create: {
        userId: userId,
        socketID: socketID,
        updatedAt: new Date(),
        isOnline: true,
        lastSeen: new Date(),
        in_room: false,
      },
    });
  } catch (error) {
    console.error("Error setting user socket ID:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// disconnect user socket ID in the database
async function disconnectUserSocketID(socketid) {
  const prisma = new PrismaClient();

  try {
    const result = await prisma.user_presence.updateMany({
      where: { socketID: socketid },
      data: {
        socketID: null,
        updatedAt: new Date(),
        isOnline: false,
        lastSeen: new Date(),
        in_room: false,
        call_status: "idle",
      },
    });

    console.log(`Updated ${result.count} user presence records`);
  } catch (error) {
    console.error("Error disconnecting user socket ID:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function setUserPeerID(userId, peerID) {
  const prisma = new PrismaClient();

  try {
    await prisma.user_presence.upsert({
      where: { userId: userId },
      update: {
        updatedAt: new Date(),
        isOnline: true,
        lastSeen: new Date(),
        in_room: false,
        peerID: peerID,
      },
      create: {
        userId: userId,
        updatedAt: new Date(),
        isOnline: true,
        lastSeen: new Date(),
        in_room: false,
        peerID: peerID,
      },
    });
  } catch (error) {
    console.error("Error setting user socket ID:", error);
  } finally {
    await prisma.$disconnect();
  }
}


async function disconnectSignout(socketid) {
  const prisma = new PrismaClient();

  try {
    const result = await prisma.user_presence.updateMany({
      where: { socketID: socketid },
      data: {
        updatedAt: new Date(),
        isOnline: false,
        lastSeen: new Date(),
        in_room: false,
        call_status: "idle",
      },
    });

    console.log(`Updated ${result.count} user presence records`);
  } catch (error) {
    console.error("Error disconnecting user socket ID:", error);
  } finally {
    await prisma.$disconnect();
  }
}



async function findSocketByPeerId(peerId) {
  const prisma = new PrismaClient();

  try {
    const userPresence = await prisma.user_presence.findMany({
      where: { peerID: peerId },
    });

    if (userPresence && userPresence[0] && userPresence[0].socketID) {
      return userPresence[0].socketID;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error finding socket ID by user ID:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}


module.exports = { setUserSocketID, disconnectUserSocketID, disconnectSignout,setUserPeerID, findSocketByPeerId  };
