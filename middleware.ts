
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If environment variables are missing, we can't initialize Supabase.
    // We log and proceed to prevent a hard crash of the middleware.
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase environment variables are missing in middleware.')
        return response
    }

    try {
        // Create an authenticated Supabase client
        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        // If the cookie is updated, update the request and response
                        request.cookies.set({
                            name,
                            value,
                            ...options,
                        })
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        })
                        response.cookies.set({
                            name,
                            value,
                            ...options,
                        })
                    },
                    remove(name: string, options: CookieOptions) {
                        request.cookies.set({
                            name,
                            value: '',
                            ...options,
                        })
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        })
                        response.cookies.set({
                            name,
                            value: '',
                            ...options,
                        })
                    },
                },
            }
        )

        // Refresh session if expired
        // We use getUser() as it's more secure than getSession() as it revalidates with Supabase Auth
        const { data: { user } } = await supabase.auth.getUser()

        const { pathname } = request.nextUrl

        // Protected routes logic
        if (pathname.startsWith('/admin')) {
            if (!user) {
                return NextResponse.redirect(new URL('/login', request.url))
            }
        }

        if (pathname === '/') {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        if (pathname === '/login' && user) {
            return NextResponse.redirect(new URL('/admin', request.url))
        }

        return response
    } catch (error) {
        // Fallback for any unexpected errors to prevent MIDDLEWARE_INVOCATION_FAILED
        console.error('Middleware error:', error)
        return response
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
