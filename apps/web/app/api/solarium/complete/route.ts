import { NextResponse } from "next/server";
import { getAuthedUserId } from "@/lib/auth-helper";
import * as solariumService from "@/server/solarium/solarium.service";

/**
 * Marca la sesión como completada vía API route en lugar de Server Action.
 *
 * Por qué no usamos `completeSessionAction`: los Server Actions disparan un
 * refresh automático de la page actual. Cuando el timer llega a 0 y el
 * cliente la dispara desde `/active`, el refresh re-fetcha la page, no
 * encuentra sesión ACTIVA (porque la acabamos de marcar COMPLETED) y
 * ejecuta el `redirect("/solarium")` que tiene la page. Resultado: el
 * modal de fin de sesión aparecía un instante y desaparecía.
 *
 * Las API routes no tienen ese comportamiento — solo persisten y devuelven.
 * El cliente sigue en `/active` con el modal abierto.
 *
 * Los minutos del cliente se clampan en el service contra el tiempo real.
 */
export async function POST(req: Request) {
	const userId = await getAuthedUserId();
	if (!userId) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}

	const body = await req.json().catch(() => null);
	if (
		!body?.sessionId ||
		typeof body.studyMinutes !== "number" ||
		typeof body.breakMinutes !== "number"
	) {
		return NextResponse.json({ error: "bad request" }, { status: 400 });
	}

	await solariumService.completeSession(
		userId,
		body.sessionId,
		body.studyMinutes,
		body.breakMinutes,
	);

	return NextResponse.json({ ok: true });
}
