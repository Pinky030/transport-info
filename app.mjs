import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
// import { find } from "lodash-es";
import typeDefs from "./schema.mjs";
import resolvers from "./resolvers.mjs";
import { saveStation } from "./lib.mjs";
import { LRUCache } from 'lru-cache'


let isShuttingDown = false;

process.on("SIGINT", () => {
  isShuttingDown = true;
  process.exit(0);
});

process.on("SIGTERM", () => {
  isShuttingDown = true;
  process.exit(0);
});

const options = {
  maxSize: 10000,
  sizeCalculation: (value, key) => {
    return 1;
  },
  dispose: (value, key) => {
    if (!isShuttingDown) saveStation();
  },
  ttl:  1000 * 60 * 60 * 24,
  allowStale: false,

  updateAgeOnGet: false,
  updateAgeOnHas: false,
  // fetchMethod: async (key, staleValue, { options, signal, context }) => {},
};

export const cache = new LRUCache(options);
saveStation();

const app = express();
const httpServer = http.createServer(app);

// Set up Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(cors(), bodyParser.json(),expressMiddleware(server));

await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));

console.log(`🚀 Server ready at http://localhost:4000`);
