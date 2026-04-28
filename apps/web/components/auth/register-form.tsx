"use client";

import { useState } from "react";
import { manualSignin } from "@/server/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const allFilled =
		name.trim() !== "" &&
		email.trim() !== "" &&
		password.trim() !== "" &&
		confirmPassword.trim() !== "";

	return (
		<form className="space-y-4" action={manualSignin}>
			<div className="space-y-2">
				<Label htmlFor="name">Nombre</Label>
				<Input
					id="name"
					name="name"
					type="text"
					placeholder="Tu nombre"
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					name="email"
					type="email"
					placeholder="tu@email.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="password">Contrasena</Label>
				<Input
					id="password"
					name="password"
					type="password"
					placeholder="********"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="confirmPassword">Confirmar contrasena</Label>
				<Input
					id="confirmPassword"
					name="confirmPassword"
					type="password"
					placeholder="********"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
				/>
			</div>
			<Button
				type="submit"
				size="lg"
				className="w-full"
				disabled={!allFilled}
			>
				Crear cuenta
			</Button>
		</form>
	);
}
