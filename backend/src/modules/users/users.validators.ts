import { z } from "zod";

const companySchema = z.object({
  _id: z.string().min(1),
  name: z.string().min(1)
});

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  age: z.coerce.number().int(),
  gender: z.string().min(1),
  address: z.string().min(1),
  role: z.string().min(1),
  company: companySchema
});

export const updateUserSchema = z.object({
  _id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  age: z.coerce.number().int(),
  gender: z.string().min(1),
  address: z.string().min(1),
  role: z.string().min(1),
  company: companySchema
});
