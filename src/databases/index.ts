import {DB_DATABASE, DB_HOST, DB_PORT} from "@config";

export const mongoDbConnection = {
    url: `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`,
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
}