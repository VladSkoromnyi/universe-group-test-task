import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'stage', 'production', 'test')
    .default('development'),
  DATABASE_URL: Joi.string().uri({ scheme: ['postgres', 'postgresql'] }).required(),
  RABBITMQ_URL: Joi.string().uri({ scheme: ['amqp', 'amqps'] }).required(),
  RABBITMQ_QUEUE: Joi.string().default('products_queue'),
  PRODUCTS_PORT: Joi.number().port().default(3001),
  NOTIFICATIONS_PORT: Joi.number().port().default(3002),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'log', 'debug', 'verbose').default('log'),
});
