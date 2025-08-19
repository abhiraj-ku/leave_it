const { getClient } = require("../config/redis");
const logger = require("./logger");

const cache = {
  async get(key) {
    try {
      const client = getClient();
      if (!client) return null;

      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error("Cache get error:", error.message);
      return null;
    }
  },

  async set(key, data, ttl = parseInt(process.env.CACHE_TTL) || 3600) {
    try {
      const client = getClient();
      if (!client) return false;

      await client.setEx(key, ttl, JSON.stringify(data));
      return true;
    } catch (error) {
      logger.error("Cache set error:", error.message);
      return false;
    }
  },

  async del(key) {
    try {
      const client = getClient();
      if (!client) return false;

      await client.del(key);
      return true;
    } catch (error) {
      logger.error("Cache delete error:", error.message);
      return false;
    }
  },
};

module.exports = cache;
