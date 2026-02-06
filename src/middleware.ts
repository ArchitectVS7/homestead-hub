import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "homestead-session";

export function middleware(request: NextRequest) {
    const session = request.cookies.get(SESSION_COOKIE_NAME);

    // If no session cookie, redirect to login
    if (!session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/dashboard/:path*",
};
