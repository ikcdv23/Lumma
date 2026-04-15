import { signIn } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const metadata = {
    title: "Registrarse",
};

export default function RegisterPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center space-y-2">
					<CardTitle className="text-4xl font-bold tracking-tight">
						Lumma
					</CardTitle>
					<CardDescription className="text-base">
						Crea tu cuenta gratuita
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Boton de Google — funcional */}
					<form
						action={async () => {
							"use server";
							await signIn("google");
						}}
					>
						<Button
							type="submit"
							variant="outline"
							size="lg"
							className="w-full"
						>
							<svg viewBox="0 0 24 24" className="mr-2 size-5">
								<path
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
									fill="#4285F4"
								/>
								<path
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									fill="#34A853"
								/>
								<path
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									fill="#FBBC05"
								/>
								<path
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									fill="#EA4335"
								/>
							</svg>
							Registrarse con Google
						</Button>
					</form>

					{/* Separador */}
					<div className="relative">
						<Separator />
						<span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-sm text-muted-foreground">
							o con tu email
						</span>
					</div>

					{/* Formulario de registro — de pega por ahora */}
					<form className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Nombre</Label>
							<Input
								id="name"
								type="text"
								placeholder="Tu nombre"
								disabled
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="tu@email.com"
								disabled
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Contrasena</Label>
							<Input
								id="password"
								type="password"
								placeholder="********"
								disabled
							/>
						</div>
						<Button
							type="submit"
							size="lg"
							className="w-full"
							disabled
						>
							Crear cuenta
						</Button>
					</form>
				</CardContent>

				<CardFooter className="justify-center">
					<p className="text-sm text-muted-foreground">
						Ya tienes cuenta?{" "}
						<Link href="/login" className="text-primary hover:underline">
							Inicia sesion
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
