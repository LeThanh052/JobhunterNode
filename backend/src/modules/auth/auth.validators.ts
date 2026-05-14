import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  age: z.coerce.number().int(),
  gender: z.string().min(1),
  address: z.string().min(1)
});
