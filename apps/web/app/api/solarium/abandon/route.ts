import { NextResponse } from "next/server";
import { getAuthedUserId } from "@/lib/auth-helper";
import * as solariumService from "@/server/solarium/solarium.service";

// Endpoint mínimo para navigator.sendBeacon() en beforeunload.
// Server actions no se pueden invocar con sendBeacon, así que hace falta una
// API route POST que cumpla el mismo contrato.
//
// Los minutos vienen del cliente pero el service los clampa contra el tiempo
// real transcurrido — no confiamos en el valor.
export async function POST(req: Request) {
	const userId = await getAuthedUserId();
	if (!userId) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}

	const body = await req.json().catch(() => null);
	if (!body?.sessionId || typeof body.studyMinutes !== "number") {
		return NextResponse.json({ error: "bad request" }, { status: 400 });
	}

	await solariumService.abandonSession(
		userId,
		body.sessionId,
		body.studyMinutes,
		0,
	);

	return NextResponse.json({ ok: true });
}
