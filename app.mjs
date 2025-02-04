import typeDefs from "./schema.mjs";
import resolvers from "./resolvers.mjs";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
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

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(cors(), bodyParser.json(),expressMiddleware(server));

saveStation();

await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));

console.log(`🚀 Server ready at http://localhost:4000`);
