import { auth } from "@/auth";
import { logRequest } from "@/proxy/logger";

// @ts-ignore - NextAuth v5 middleware type inference issue
export default auth((req) => {
	logRequest(req);

	const logueado = !!req.auth;
	const enAuth = req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register";

	if (!logueado && !enAuth) {
		return Response.redirect(new URL("/login", req.nextUrl));
	}

	if (logueado && enAuth) {
		return Response.redirect(new URL("/home", req.nextUrl));
	}
});

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
