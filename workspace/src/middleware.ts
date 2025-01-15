import { NextRequest, NextResponse } from 'next/server';

// Specify protected and public routes
const protectedRoutes = ['/home']
const publicRoutes = ['/login', '/signup', '/']

export default async function middleware(req: NextRequest, res: NextResponse) {
    if ( res.headers ) {
        res.headers.append('Access-Control-Allow-Credentials', "true")
        res.headers.append('Access-Control-Allow-Origin', '*')
        res.headers.append('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT')
        res.headers.append(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        )
    }





    const url = req.nextUrl.clone()
    if ( url.pathname !== "/setup" ) {
        const apiStatusUrl = `${process.env.NEXT_PUBLIC_WORKSPACE_API_BASE_URL}/setup/status`;
        const apiResponse = await fetch(apiStatusUrl);
        const response = await apiResponse.json();
        if (!response.initialised) {
            url.pathname = '/setup';
            return NextResponse.redirect(url);
        }
    }

    // Check if the current route is protected or public
    const path = req.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.includes(path)
    const isPublicRoute = publicRoutes.includes(path)

    // Redirect to /login if the user is not authenticated
    if (isProtectedRoute && false) {
        return NextResponse.redirect(new URL('/login', req.nextUrl))
    }


    return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png|.*\\.ico|.*\\.svg$).*)'],
}