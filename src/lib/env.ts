// import { z } from "zod";

// const envSchema = z.object({
//     DATABASE_URL: z.string().url(),
//     PORT: z.string().optional(),
//     NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
// });

// export type EnvVariables = z.infer<typeof envSchema>;
// export const env = envSchema.parse(process.env);
