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
import { Server } from "socket.io";
import dotenv from 'dotenv';
dotenv.config();

const port = 3000;
const app = express();
const server = http.createServer(app);
app.use(cors())

// Initialize Socket.IO
const io = initializeSocketIO(server);

// const server = http.createServer(app);
// const io = new Server(server);


server.listen(port,(err)=>{
    if (err) throw err;
    console.log(`Server is running at http://192.168.0.10:${port}`) 
})



// io.on('connection', socket => {
//   console.log("Started")
// });


const URL = process.env.MONGO_URL
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

  // app.listen(port, () => {
  //   console.log(`🚀 Server ready at http://192.168.0.10:3000/graphql`);
  // });

}

startServer();
