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

export default typeDefs;