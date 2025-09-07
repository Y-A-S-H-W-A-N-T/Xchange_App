import { Server } from "socket.io";
import User from "./schemas/userSchema.js";

// Enable Socket.IO debug logging
process.env.DEBUG = "socket.io*";

function initializeSocketIO(server) {
  console.log("Initializing Web Sockets on port 3000");
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "OPTIONS"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    allowEIO3: true,
    pingTimeout: 20000,
    pingInterval: 25000,
    path: "/socket.io/",
  });

  console.log("Socket.IO server initialized, waiting for connections...");

  server.on("request", (req, res) => {
    if (req.url.includes("/socket.io/")) {
      console.log(`Socket.IO request: ${req.method} ${req.url} from ${req.headers["user-agent"]}`);
    }
  });

  io.on("connection", async (socket) => {
    const { chatSpace, productName, sender } = socket.handshake.query;
    console.log(`Client connected: ${socket.id}, chatSpace: ${chatSpace}, sender: ${sender}`);

    // Validate chatSpace
    if (!chatSpace || typeof chatSpace !== "string") {
      console.log(`Invalid chatSpace for socket ${socket.id}: ${chatSpace}`);
      socket.emit("error", { message: "Invalid chat ID" });
      socket.disconnect(true);
      return;
    }

    // Validate sender
    if (sender !== "Owner" && sender !== "Customer") {
      console.log(`Invalid sender for socket ${socket.id}: ${sender}`);
      socket.emit("error", { message: "Invalid sender type" });
      socket.disconnect(true);
      return;
    }

    // Parse chatSpace (format: productID-productOwner-userNumber)
    const [productID, productOwner, userNumber] = chatSpace.split("-");
    if (!productID || !productOwner || !userNumber) {
      console.log(`Invalid chatSpace format for socket ${socket.id}: ${chatSpace}`);
      socket.emit("error", { message: "Invalid chat ID format" });
      socket.disconnect(true);
      return;
    }

    try {
      // Find the owner's and user's documents
      const owner = await User.findOne({ number: parseInt(productOwner) });
      const user = await User.findOne({ number: parseInt(userNumber) });
      
      if (!owner) {
        console.log(`Owner not found for number ${productOwner}, socket ${socket.id}`);
        socket.emit("error", { message: "Product owner not found" });
        socket.disconnect(true);
        return;
      }

      if (!user) {
        console.log(`User not found for number ${userNumber}, socket ${socket.id}`);
        socket.emit("error", { message: "User not found" });
        socket.disconnect(true);
        return;
      }

      // Determine sender number
      const senderNumber = sender === "Owner" ? productOwner : userNumber;

      // Check if chatSpace exists in owner's and user's chatSpace arrays
      let ownerChat = owner.chatSpace.find((c) => c.chatID === chatSpace);
      let userChat = user.chatSpace.find((c) => c.chatID === chatSpace);
      let pastMessages = [];

      if (!ownerChat || !userChat) {
        // Create new chatSpace for both owner and user
        const newChat = {
          productID,
          productName: productName || "Unknown Product",
          chatPartner: sender === "Owner" ? productOwner : userNumber,
          chatID: chatSpace,
          messages: [],
        };

        if (!ownerChat) {
          owner.chatSpace.push(newChat);
          await owner.save();
          console.log(`Created new chatSpace ${chatSpace} for owner ${productOwner}`);
        }

        if (!userChat) {
          user.chatSpace.push(newChat);
          await user.save();
          console.log(`Created new chatSpace ${chatSpace} for user ${userNumber}`);
        }

        pastMessages = newChat.messages.map((m) => ({
          text: m.messageSent,
          sender: m.sender,
        }));
      } else {
        // Use existing chatSpace
        console.log(`Found existing chatSpace ${chatSpace} for owner ${productOwner} and user ${userNumber}`);
        pastMessages = ownerChat.messages.map((m) => ({
          text: m.messageSent,
          sender: m.sender,
        }));
      }

      // Join the unique chatSpace room
      socket.join(chatSpace);
      console.log(`Socket ${socket.id} joined room: ${chatSpace}`);

      // Notify other user in the room
      socket.to(chatSpace).emit("system", {
        message: "User connected",
        type: "system",
      });
      console.log(`Notified room ${chatSpace} of connection: ${socket.id}`);

      // Send past messages with sender
      socket.emit("pastMessages", pastMessages);
      console.log(`Sent pastMessages to socket ${socket.id} for chatSpace: ${chatSpace}`);

      // Handle incoming messages
      socket.on("message", async (data) => {
        if (typeof data.text === "string" && data.text.trim()) {
          console.log(`Received message from ${socket.id} in room ${chatSpace}: ${data.text}`);

          // Save message to both owner and user chatSpace
          const messageData = {
            sender: data.sender || senderNumber, // Use data.sender if provided, else fallback
            messageSent: data.text.trim(),
          };

          // Update owner's chatSpace
          const updatedOwner = await User.findOne({ number: parseInt(productOwner) });
          if (updatedOwner) {
            const targetChat = updatedOwner.chatSpace.find((c) => c.chatID === chatSpace);
            if (targetChat) {
              targetChat.messages.push(messageData);
              await updatedOwner.save();
              console.log(`Saved message to owner chatSpace ${chatSpace}`);
            }
          }

          // Update user's chatSpace
          const updatedUser = await User.findOne({ number: parseInt(userNumber) });
          if (updatedUser) {
            const targetChat = updatedUser.chatSpace.find((c) => c.chatID === chatSpace);
            if (targetChat) {
              targetChat.messages.push(messageData);
              await updatedUser.save();
              console.log(`Saved message to user chatSpace ${chatSpace}`);
            }
          }

          // Broadcast to other user in the room with sender
          socket.to(chatSpace).emit("message", {
            text: data.text.trim(),
            type: "message",
            sender: data.sender || senderNumber,
          });
        }
      });

      // Handle socket errors
      socket.on("error", (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
      });

      // Handle disconnection
      socket.on("disconnect", async (reason) => {
        console.log(`Socket ${socket.id} disconnected: ${reason}`);
        socket.to(chatSpace).emit("system", {
          message: "User disconnected",
          type: "system",
        });
        console.log(`Notified room ${chatSpace} of disconnection: ${socket.id}`);
      });
    } catch (error) {
      console.error(`Error processing connection for socket ${socket.id}:`, error);
      if (error.code === 11000) {
        socket.emit("error", { message: "Duplicate user number detected" });
      } else {
        socket.emit("error", { message: "Server error" });
      }
      socket.disconnect(true);
    }
  });

  // Log server-level errors
  io.on("error", (error) => {
    console.error("Server error:", error);
  });

  return io;
}

export default initializeSocketIO;