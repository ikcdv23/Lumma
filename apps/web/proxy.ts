import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logRequest } from "@/proxy/logger";

const AUTH_COOKIES = [
	"authjs.session-token",
	"authjs.csrf-token",
	"authjs.callback-url",
	"__Secure-authjs.session-token",
	"__Secure-authjs.csrf-token",
	"__Secure-authjs.callback-url",
];

// @ts-ignore - NextAuth v5 middleware type inference issue
export default auth((req) => {
	try {
		logRequest(req);

		const logueado = !!req.auth;
		const enAuth = req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register";

		if (!logueado && !enAuth) {
			return Response.redirect(new URL("/login", req.nextUrl));
		}

		if (logueado && enAuth) {
			return Response.redirect(new URL("/home", req.nextUrl));
		}
	} catch (err) {
		console.error("[middleware] auth error:", err);

		// Cookie/JWT invalido → limpiar y mandar a login
		const response = NextResponse.redirect(new URL("/login", req.nextUrl));
		for (const name of AUTH_COOKIES) {
			response.cookies.delete(name);
		}
		return response;
	}
});

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
