import { LRUCache } from "lru-cache";

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
  maxSize: 20000,
  sizeCalculation: (value, key) => {
    if (Array.isArray(value)) return value.length;
    
    return 1;
  },
  dispose: (value, key) => {
    if (!isShuttingDown) saveStation();
  },
  ttl: 1000 * 60 * 60 * 24,
  allowStale: false,

  updateAgeOnGet: false,
  updateAgeOnHas: false,
  // fetchMethod: async (key, staleValue, { options, signal, context }) => {},
};

const cache = new LRUCache(options);

export default cache;
