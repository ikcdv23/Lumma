import { NextResponse } from "next/server";
import { auth } from "@/auth";
import * as solariumService from "@/server/solarium/solarium.service";

// Endpoint mínimo para navigator.sendBeacon() en beforeunload.
// Server actions no se pueden invocar con sendBeacon, así que hace falta una
// API route POST que cumpla el mismo contrato.
export async function POST(req: Request) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}

	const body = await req.json().catch(() => null);
	if (!body?.sessionId || typeof body.studyMinutes !== "number") {
		return NextResponse.json({ error: "bad request" }, { status: 400 });
	}

	await solariumService.abandonSession(
		session.user.id,
		body.sessionId,
		body.studyMinutes,
		0,
	);

	return NextResponse.json({ ok: true });
}
