import {
  fetchRoutes,
  fetchStations,
  fetchStation,
  handleRouteInfo,
  fetchArrivalsByRoute,
  fetchArrivalsByStation
} from "./lib.mjs";
import cache from "./cache.mjs";
import { map } from "lodash-es";
import dayjs from "dayjs";

const resolvers = {
  Query: {
    routes: async () => {
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
};

export default resolvers;
