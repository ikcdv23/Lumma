import { NextRequest } from "next/server";

export function logRequest(req: NextRequest) {
    console.log(`[${req.method}] ${req.nextUrl.pathname}`);
}