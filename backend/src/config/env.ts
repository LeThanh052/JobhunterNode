import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(8000),
  DATABASE_URL: z.string().min(1),
  CLIENT_URL: z.string().default("http://localhost:3000"),
  JWT_ACCESS_TOKEN_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRE: z.string().min(1),
  JWT_REFRESH_TOKEN_SECRET: z.string().min(1),
  JWT_REFRESH_EXPIRE: z.string().min(1),
  SHOULD_INIT: z.string().default("true"),
  INIT_PASSWORD: z.string().default("123456")
});

export const env = envSchema.parse(process.env);
