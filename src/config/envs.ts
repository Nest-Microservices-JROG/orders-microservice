import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
   PORT: number;
   DATABASE_URL: string;
   PRODUCT_SERVICE_NAME: string;
   PRODUCTS_MICROSERVICE_HOST: string;
   PRODUCTS_MICROSERVICE_PORT: number;
}

const envVarsSchema = joi.object({
   PORT: joi.number().required(),
   DATABASE_URL: joi.string().required(),
   PRODUCT_SERVICE_NAME: joi.string().required(),
   PRODUCTS_MICROSERVICE_HOST: joi.string().required(),
   PRODUCTS_MICROSERVICE_PORT: joi.number().required(),
}).unknown(true);


const { error, value } = envVarsSchema.validate(process.env);

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
}