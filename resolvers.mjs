import {
  fetchRoutes,
  fetchStations,
  fetchStation,
  handleRouteInfo,
  fetchArrivalsByRoute,
  fetchArrivalsByStation,
} from "./lib.mjs";
import cache from "./cache.mjs";
import { map, find } from "lodash-es";
import dayjs from "dayjs";
import DataLoader from "dataloader";

const arrivalsLoader = new DataLoader(async (keys) => {
  debugger;
  // const results = await fetchArrivalsByStations(keys);
  const results = await Promise.all(
    keys.map((v) => fetchArrivalsByStations(v))
  );
  console.log(results);
  return keys.map((key) => results[key]);
});

async function fetchArrivalsByStations(stop) {
  let { data, generated_timestamp, version, type } = await fetch(
       `https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/${stop}`
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (responseJson) {
      return responseJson;
    })
    .catch((error) => {
      console.log(error)
    });


  return data;
  // let result = map(data, function (v) {
  //   return {
  //     ...v,
  //     data_timestamp: dayjs(new Date(v.data_timestamp)).format(
  //       "YYYY-MM-DD HH:mm:ss"
  //     ),
  //     eta: dayjs(new Date(v.eta)).format("YYYY-MM-DD HH:mm:ss"),
  //   };
  // });
  // debugger
  // return result;
}

const resolvers = {
  Query: {
    routes: async () => {
      if (cache !== undefined && cache.get("routesInfo").length > 0) {
        return cache.get("routesInfo");
      }

      let { data, generated_timestamp, version, type } = await fetchRoutes();

      return data;
    },
    stations: async () => {
      let { data, generated_timestamp, version, type } = await fetchStations();

      return data;
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
      return cache !== undefined ? cache.get(route.stop) : {};
    },
  },

  Route: {
    arrivals: async (route) => {
      const { route: routeId, service_type } = route;
      let { data, generated_timestamp, version, type } =
        await fetchArrivalsByRoute(routeId, service_type);
      let result = map(data, function (v) {
        return {
          ...v,
          data_timestamp: dayjs(new Date(v.data_timestamp)).format(
            "YYYY-MM-DD HH:mm:ss"
          ),
          eta: dayjs(new Date(v.eta)).format("YYYY-MM-DD HH:mm:ss"),
        };
      });
      return result;
    },
  },

  Stations: {
    arrivals: async (station) => {
      const { stop } = station;

      return arrivalsLoader.load(stop);
      // const { stop } = station;
      // let { data, generated_timestamp, version, type } =
      //   await fetchArrivalsByStation(stop);

      // let result = map(data, function (v) {
      //   return {
      //     ...v,
      //     data_timestamp: dayjs(new Date(v.data_timestamp)).format(
      //       "YYYY-MM-DD HH:mm:ss"
      //     ),
      //     eta: dayjs(new Date(v.eta)).format("YYYY-MM-DD HH:mm:ss"),
      //   };
      // });
      // return result;
    },
  },

  Station: {
    arrivals: async (station) => {
      const { stop } = station;
      let { data, generated_timestamp, version, type } =
        await fetchArrivalsByStation(stop);
      let result = map(data, function (v) {
        return {
          ...v,
          data_timestamp: dayjs(new Date(v.data_timestamp)).format(
            "YYYY-MM-DD HH:mm:ss"
          ),
          eta: dayjs(new Date(v.eta)).format("YYYY-MM-DD HH:mm:ss"),
        };
      });
      return result;
    },
  },

  Arrivals: {
    route: (info) => {
      // debugger
      let routes = cache !== undefined ? cache.get("routesInfo") : {};
      return find(routes, function (o) {
        return (
          o.route == info.route &&
          o.bound == info.dir &&
          o.service_type == info.service_type
        );
      });
    },
  },
};

export default resolvers;
