import { auth } from "@/auth";
import { logRequest } from "@/proxy/logger";

// @ts-ignore - NextAuth v5 middleware type inference issue
export default auth((req) => {
	logRequest(req);

	const logueado = !!req.auth;
	const enLogin = req.nextUrl.pathname.startsWith("/auth");

	if (!logueado && !enLogin) {
		return Response.redirect(new URL("/auth/login", req.nextUrl));
	}

	if (logueado && enLogin) {
		return Response.redirect(new URL("/home", req.nextUrl));
	}
});

export const config = {
	//THIS IS ONLY FOR TESTING matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
	matcher: []
};
