import { config } from 'dotenv'

const envFile = `.env.${process.env.NODE_ENV || 'development'}.local`

config({ path: envFile })

export const CREDENTIALS = process.env.CREDENTIALS === 'true'
export const {
    NODE_ENV,
    PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_DATABASE,
    LOG_FORMAT,
    LOG_DIR,
    ORIGIN,
    ACCESS_TOKEN_SECRET_KEY,
    REDIS_USERNAME,
    REDIS_PORT,
    REDIS_HOST,
    REDIS_PASSWORD,
    REDIS_URL,
    REFRESH_TOKEN_SECRET_KEY,
} = process.env