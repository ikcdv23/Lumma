import { z } from "zod"

export const registerSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    email: z.string().email("El formato del email no es valido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string()
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"]
    }
)

export type RegisterInput = z.infer<typeof registerSchema>;