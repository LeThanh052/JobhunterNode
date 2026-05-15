import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  description: z.string().min(1),
  logo: z.string().min(1)
});

export const updateCompanySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  address: z.string().min(1),
  description: z.string().min(1),
  logo: z.string().min(1)
});
