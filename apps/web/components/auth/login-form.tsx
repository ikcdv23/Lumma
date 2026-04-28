"use client"

import { useActionState, useState } from "react";
import { manualLogin } from "@/server/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export function LoginForm() {
    const [state, formAction, isPending] = useActionState(manualLogin, null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const allFilled =
        email.trim() !== "" &&
        password.trim() !== "";
    return (
        <form
            action={formAction}
            className="space-y-4">
            <div className="space-y-4">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
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
            {state?.error && (
                <p className="text-sm text-destructive">{state.error}</p>
            )}
            <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!allFilled}
            >
                Iniciar sesion
            </Button>
        </form>
    );
}