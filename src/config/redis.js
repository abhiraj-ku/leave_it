const redis = require("redis");
const logger = require("../utils/logger");

let client;

const connectRedis = async () => {
  try {
    client = redis.createClient({
      url: process.env.REDIS_URL,
    });

    client.on("error", (err) => {
      logger.error("Redis Client Error:", err);
    });

    client.on("connect", () => {
      logger.info("Redis Connected");
    });

    await client.connect();
  } catch (error) {
    logger.error("Redis connection failed:", error.message);
  }
};

const getClient = () => client;

module.exports = { connectRedis, getClient };
