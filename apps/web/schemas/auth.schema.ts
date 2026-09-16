import { z } from "zod";

const normalizedEmail = z
  .string()
  .trim()
  .toLowerCase()
  .email("El formato del email no es válido")
  .max(254, "El email es demasiado largo");

export const loginSchema = z.object({
  email: normalizedEmail,
  password: z.string().min(1, "La contraseña es requerida").max(128),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre es requerido").max(50),
    email: normalizedEmail,
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(128),
    confirmPassword: z.string().max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
