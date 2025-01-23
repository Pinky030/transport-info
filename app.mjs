import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";

const bus_route_stop = [
  {
    route: "1",
    bound: "O",
    service_type: "1",
    seq: "1",
    stop: "18492910339410B1",
  },
];

const bus_stop = [
  {
    stop: "18492910339410B1",
    name_en: "CHUK YUEN ESTATE BUS TERMINUS",
    name_tc: "竹園邨總站",
    name_sc: "竹园邨总站",
    lat: "22.345415",
    long: "114.192640",
  },
];

// async function handleData() {
//     let {data, generated_timestamp, version, type} = await tryFetch();
//     return data;
//   }
async function fetchStation(id) {
  return await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/stop/${id}`)
    .then(function (response) {
      return response.json();
    })
    .then(function (responseJson) {
      return responseJson;
    });
}

async function fetchStations() {
  return await fetch("https://data.etabus.gov.hk/v1/transport/kmb/stop")
    .then(function (response) {
      return response.json();
    })
    .then(function (responseJson) {
      return responseJson;
    });
}

async function fetchRoutes() {
  return await fetch("https://data.etabus.gov.hk/v1/transport/kmb/route-stop")
    .then(function (response) {
      console.log("sccuess fetch data");
      return response.json();
    })
    .then(function (responseJson) {
      return responseJson;
    });

  // console.log(fromServer);
}

// The GraphQL schema
const typeDefs = `#graphql
  type Query {
    hello: String,
    route: [Routes],
    station: [Stations]
  }

  type Routes {
    route: String!
    bound: String!
    service_type: String!
    seq: String!
    stop: Stations
  }

  type Stations {
   stop: String! 
   name_en: String!
   name_tc: String!
   name_sc: String!
   lat: String!
   long: String!
  }
`;

const resolvers = {
  Query: {
    hello: () => "world",
    route: async () => {
    //   let { data, generated_timestamp, version, type } = await fetchRoutes();
      return bus_route_stop;
    },
    station: async () => {
    //   let { data, generated_timestamp, version, type } = await fetchStations();
      return bus_stop;
    },
  },

  Routes: {
    stop: async (route) => {
    //   let { data, generated_timestamp, version, type } = await fetchStation(
    //     route.stop
    //   );
    return  bus_stop.find((v) =>v.stop == route.stop)
     
    },
  },
};

const app = express();
const httpServer = http.createServer(app);

// Set up Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start();

app.use(cors(), bodyParser.json(), expressMiddleware(server));

await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000`);
