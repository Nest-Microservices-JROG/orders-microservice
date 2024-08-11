import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
   PORT: number;
   DATABASE_URL: string;
   PRODUCT_SERVICE_NAME: string;
   PRODUCTS_MICROSERVICE_HOST: string;
   PRODUCTS_MICROSERVICE_PORT: number;
   NATS_SERVICE_NAME: string;
   NATS_SERVERS: string;
}

const envVarsSchema = joi.object({
   PORT: joi.number().required(),
   DATABASE_URL: joi.string().required(),
   PRODUCT_SERVICE_NAME: joi.string().required(),
   PRODUCTS_MICROSERVICE_HOST: joi.string().required(),
   PRODUCTS_MICROSERVICE_PORT: joi.number().required(),
   NATS_SERVICE_NAME: joi.string().required(),
   NATS_SERVERS: joi.array().items(joi.string()).required()
}).unknown(true);


const { error, value } = envVarsSchema.validate({
   ...process.env,
   NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
});

if (error) {
   throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
   port: envVars.PORT,
   databaseUrl: envVars.DATABASE_URL,
   productServiceName: envVars.PRODUCT_SERVICE_NAME,
   productServiceHost: envVars.PRODUCTS_MICROSERVICE_HOST,
   productServicePort: envVars.PRODUCTS_MICROSERVICE_PORT,
   natsServiceName: envVars.NATS_SERVICE_NAME,
   natsServers: envVars.NATS_SERVERS,
}