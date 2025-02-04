import {DB_DATABASE, DB_PASSWORD, DB_USERNAME, REDIS_HOST, REDIS_PASSWORD, REDIS_PORT, REDIS_USERNAME} from "@config";

export const mongoDbConnection = {
    url: `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@umurava-cluster.v5zrt.mongodb.net/${DB_DATABASE}`,
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
}

export const redisConfig = {
    redis: {
        port: parseInt(REDIS_PORT),
        host: REDIS_HOST,
        username: REDIS_USERNAME || "",
        password: REDIS_PASSWORD || "",
    }
}