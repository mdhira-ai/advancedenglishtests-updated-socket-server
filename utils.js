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
      },
    });

    console.log(`Updated ${result.count} user presence records`);
  } catch (error) {
    console.error("Error disconnecting user socket ID:", error);
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
      },
    });

    console.log(`Updated ${result.count} user presence records`);
  } catch (error) {
    console.error("Error disconnecting user socket ID:", error);
  } finally {
    await prisma.$disconnect();
  }
}



module.exports = { setUserSocketID, disconnectUserSocketID, disconnectSignout };
