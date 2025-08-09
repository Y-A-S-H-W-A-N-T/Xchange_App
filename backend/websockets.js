import { Server } from "socket.io";

function initializeSocketIO(server) {
  console.log("Running Web Sockets");
  const io = new Server(server, {
    cors: {
      origin: "*", // Restrict in production
      methods: ["GET", "POST"],
    },
  });

  // Store rooms: { productId: { user: socket, owner: socket } }
  const rooms = new Map();

  io.on("connection", (socket) => {
    const { productId, role } = socket.handshake.query;

    // Validate input
    if (!productId || !["user", "owner"].includes(role)) {
      socket.emit("error", { message: "Invalid product ID or role" });
      socket.disconnect(true);
      return;
    }

    // Initialize or join room
    if (!rooms.has(productId)) {
      rooms.set(productId, { user: null, owner: null });
    }
    const room = rooms.get(productId);
    room[role] = socket;

    // Join Socket.IO room
    socket.join(productId);

    // Notify other party
    socket.to(productId).emit("system", {
      message: `${role === "user" ? "User" : "Product Owner"} joined`,
      timestamp: new Date().toISOString(),
    });

    // Handle messages
    socket.on("message", (data) => {
      if (!data.text || typeof data.text !== "string") {
        socket.emit("error", { message: "Invalid message" });
        return;
      }

      const message = {
        type: "message",
        sender: role,
        text: data.text,
        timestamp: new Date().toISOString(),
      };
      io.to(productId).emit("message", message);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      room[role] = null;
      socket.to(productId).emit("system", {
        message: `${role === "user" ? "User" : "Product Owner"} left`,
        timestamp: new Date().toISOString(),
      });

      // Clean up empty room
      if (!room.user && !room.owner) {
        rooms.delete(productId);
      }
    });

    // Handle socket errors
    socket.on("error", (error) => {
      console.error(`Socket error in room ${productId} for ${role}:`, error);
    });
  });

  // Periodic cleanup
  setInterval(() => {
    rooms.forEach((room, roomId) => {
      if (!room.user && !room.owner) {
        rooms.delete(roomId);
      }
    });
  }, 60000);

  return io;
}

export default initializeSocketIO;
