import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import resolvers from "./resolver.js";
import UserRoute from "./routes/userRoute.js";
import typeDefs from "./typeDef.js";
import initializeSocketIO from "./websockets.js";

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocketIO(server);

const port = 3000;

const URL = `mongodb+srv://raoyashwant132:Xchange@mobile.qd2x1vb.mongodb.net/xchange-app?retryWrites=true&w=majority`;
mongoose
  .connect(URL)
  .then(() => {
    console.log("Connected to xchange-app database");
  })
  .catch((err) => {
    console.log(err);
  });

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

//   app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.json());
  app.use("/user", UserRoute);
  app.use(
    "/graphql",
    cors(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.authorization }),
    })
  );

  app.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
  });
}

startServer();
