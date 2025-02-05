import {Redis} from "ioredis";
import {REDIS_URL} from "@config";
import {logger} from "@utils/logger";

class RedisClient {
    private static instance: Redis | null = null;

    private constructor() {}

    public static getInstance() {
        if(!RedisClient.instance) {
            RedisClient.instance = new Redis(REDIS_URL);
            RedisClient.instance.on("connect", () => logger.info("Connected to Redis Database successfully."));
            RedisClient.instance.on("error", (err: Error) => logger.error(err.message));
        }
        return RedisClient.instance;
    }
}

export const redisClient = RedisClient.getInstance();