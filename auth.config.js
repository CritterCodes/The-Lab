export const authConfig = {
    pages: {
        signIn: '/auth/signin',
    },
    providers: [],
    secret: process.env.AUTH_SECRET,
    callbacks: {
        authorized({ auth, request: nextUrl }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                // Optional: Redirect authenticated users to dashboard if they visit login page
                // return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
    },
};
