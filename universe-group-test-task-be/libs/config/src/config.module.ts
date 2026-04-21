import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { envValidationSchema } from './env.validation';

const nodeEnv = process.env.NODE_ENV ?? 'development';

// Priority (highest first). Next.js / 12-factor style:
// 1. .env.<env>.local  (local overrides, gitignored, per-env)
// 2. .env.local        (local overrides, gitignored, shared)
// 3. .env.<env>        (per-env defaults, committed for stage/prod templates)
// 4. .env              (shared defaults, committed)
const envFilePath = [
  `.env.${nodeEnv}.local`,
  `.env.local`,
  `.env.${nodeEnv}`,
  `.env`,
];

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: true,
        allowUnknown: true,
      },
    }),
  ],
})
export class AppConfigModule {}
