import cache from "./cache.mjs";

async function fetchRoutes() {
  return await fetch("https://data.etabus.gov.hk/v1/transport/kmb/route-stop")
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

async function saveRoute() {
  let { data, generated_timestamp, version, type } = await fetchRoutes();
  cache.set("routesInfo", data);
}

async function saveStation() {
  let { data, generated_timestamp, version, type } = await fetchStations();
  data.forEach((v) => cache.set(v.stop, v));
}

async function fetchArrivalsByRoute(routeId, serviceType) {
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

async function fetchArrivalsByStation(stationId) {
  return await fetch(
    `https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/${stationId}`
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

async function fetchStation(id) {
  return await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/stop/${id}`)
    .then(function (response) {
      return response.json();
    })
    .then(function (responseJson) {
      return responseJson;
    });
}

export {
  saveRoute,
  fetchStations,
  saveStation,
  fetchArrivalsByRoute,
  fetchArrivalsByStation,
  handleRouteInfo,
  fetchStation,
  fetchRoutes,
};
