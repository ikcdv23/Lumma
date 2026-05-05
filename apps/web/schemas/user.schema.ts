import { z } from "zod";

export const updateNameSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "El nombre es requerido")
		.max(50, "Maximo 50 caracteres"),
});

export const updatePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "La contraseña actual es requerida"),
		newPassword: z
			.string()
			.min(8, "La contraseña debe tener al menos 8 caracteres"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Las contraseñas no coinciden",
		path: ["confirmPassword"],
	});

export type UpdateNameInput = z.infer<typeof updateNameSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
