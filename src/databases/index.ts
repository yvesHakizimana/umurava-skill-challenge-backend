import {DB_DATABASE, DB_PASSWORD, DB_USERNAME} from "@config";

export const mongoDbConnection = {
    url: `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@umurava-cluster.v5zrt.mongodb.net/${DB_DATABASE}`,
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
}