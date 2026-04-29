"use server"

import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/schemas/auth.schema"
import bcrypt from "bcrypt"
import { redirect } from "next/navigation"
import { signIn } from "@/auth";

export async function manualSignin(prevState: unknown, formData: FormData) {
    const rawInput = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        confirmPassword: formData.get("confirmPassword") as string,
    };

    const result = registerSchema.safeParse(rawInput);
    if (!result.success) {
        // result.error.issues es un array con todos los errores
        // Devuelve el primero por simplicidad
        return { error: result.error.issues[0]?.message ?? "Datos invalidos" };
    }

    const { name, email, password } = result.data;

    // Comprobar que el email no existe
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return { error: "No se pudo crear la cuenta" };  // mensaje neutro (ver concepts/security-account-enumeration)
    }

    // Hashear y crear
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
        data: { name, email, password: hashedPassword },
    });

    redirect("/login")
}


export async function manualLogin(prevState: unknown, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email y contraseña requeridos" };
    }

    await signIn("credentials", {
        email,
        password,
        redirectTo: "/home",
    });
}