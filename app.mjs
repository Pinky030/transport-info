import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import { find } from "lodash-es";

var station_info = [];

async function fetchArrivals(routeId, serviceType) {
  return await fetch(
    `https://data.etabus.gov.hk/v1/transport/kmb/route-eta/${routeId}/${serviceType}`
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (responseJson) {
      return responseJson;
    });
}

async function handleRouteInfo(routeId, direction, serviceType) {
  return await fetch(
    `https://data.etabus.gov.hk/v1/transport/kmb/route/${routeId}/${direction}/${serviceType}`
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (responseJson) {
      return responseJson;
    });
}

async function saveStation() {
  let { data, generated_timestamp, version, type } = await fetchStations();
  console.log(data);
  station_info = data;
}

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
    routes: [Routes],
    stations: [Stations],
    station(stop: String!): Stations,
    route(routeId: String!, direction: String!, serviceType: String!): Route
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

  type Route {
    route: String!
    bound: String!
    service_type: String!
    orig_en: String!
    orig_tc: String!
    orig_sc: String!
    dest_en: String!
    dest_tc: String!
    dest_sc: String!
    arrivals: [Arrivals]
  }

  type Arrivals {
    co: String!
    route: String!
    dir: String!
    service_type: Int!
    seq: Int!
    dest_tc: String!
    dest_sc: String!
    dest_en: String!
    eta_seq: Int!
    eta: String!
    rmk_tc: String!
    rmk_sc: String!
    rmk_en: String!
    data_timestamp: String!
  }

`;

const resolvers = {
  Query: {
    routes: async () => {
      let { data, generated_timestamp, version, type } = await fetchRoutes();

      return data;
    },
    stations: async () => {
      if (station_info.length == 0) saveStation();

      return station_info;
    },
    station: async (parent, { stop }) => {
      let { data, generated_timestamp, version, type } = await fetchStation(
        stop
      );

      return data;
    },
    route: async (parent, { routeId, serviceType, direction }, context) => {
      let { data, generated_timestamp, version, type } = await handleRouteInfo(
        routeId,
        direction,
        serviceType
      );

      return data;
    },
  },

  Routes: {
    stop: (route) => {
      // if (station_info.length == 0) {
      //   saveStation();
      // }
      return find(station_info, function (v) {
        return v.stop == route.stop;
      });
    },
  },

  Route: {
    arrivals: async (route) => {
      const { route :routeId, service_type } = route;
      let { data, generated_timestamp, version, type } = await fetchArrivals(
        routeId,
        service_type
      );
      return data;
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
saveStation();
console.log(`🚀 Server ready at http://localhost:4000`);
