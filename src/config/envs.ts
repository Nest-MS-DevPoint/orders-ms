import 'dotenv/config';
import * as joi from 'joi'

interface EnvVars {
    PORT: number
    DATABASE_URL: string
    PRODUCT_MICROSERVICE_HOST: string,
    PRODUCT_MICROSERVICE_PORT: number,

    NATS_SERVERS: string[]
}

const envsSchema = joi.object({

    PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),
    PRODUCT_MICROSERVICE_HOST: joi.string().required(),
    PRODUCT_MICROSERVICE_PORT: joi.number().required(),

    NATS_SERVERS: joi.array().items( joi.string() ).required(),

}).unknown(true)

const { error, value } = envsSchema.validate( {
    ...process.env,
    NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
} )

if (error){
    throw new Error(`Config validation error: ${error.message}`)
}

const envVars: EnvVars = value

export const envs = {
    port: envVars.PORT,
    databaseUrl: envVars.DATABASE_URL,
    productHost: envVars.PRODUCT_MICROSERVICE_HOST,
    productPort: envVars.PRODUCT_MICROSERVICE_PORT,

    natsServers: envVars.NATS_SERVERS,
}