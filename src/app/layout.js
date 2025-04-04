import { AppProvider } from "@toolpad/core/AppProvider";
import { Experimental_CssVarsProvider as AppRouterCacheProvider } from '@mui/material/styles';
import DashboardIcon from "@mui/icons-material/Dashboard";
import BuildIcon from "@mui/icons-material/Handyman";
import BarChartIcon from "@mui/icons-material/Insights";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory2";
import EventIcon from "@mui/icons-material/Event";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MoveIcon from "@mui/icons-material/CompareArrows";
import WarningIcon from "@mui/icons-material/ReportProblem";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { SessionProvider } from "next-auth/react";
import theme from "../../theme";
import { auth } from "../../auth";
import { signIn, signOut } from "next-auth/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import "./globals.css"; // Import the global CSS file

// ✅ Updated icons for better visual clarity
const getUserNavigation = (userID) => [
    {
        segment: `dashboard/${userID}`,
        title: 'Dashboard',
        icon: <DashboardIcon />
    },
    {
        segment: `dashboard/${userID}/profile`,
        title: 'Profile',
        icon: <BuildIcon />,
    },
];

const NAVIGATION = {
    admin: [
        {
            segment: 'dashboard',
            title: 'Dashboard',
            icon: <DashboardIcon />
        },
        {
            segment: 'dashboard/analytics',
            title: 'Analytics',
            icon: <BarChartIcon />
        },
        {
            segment: 'dashboard/members',
            title: 'Members',
            icon: <PeopleIcon />
        }

    ]
};

const BRANDING = {
    logo: <img src='/logos/darkLogo.png' alt="[efd] Logo" style={{ maxWidth: '150px', height: 'auto' }} />,
    title: '',
};

const AUTHENTICATION = { signIn, signOut };

export default async function RootLayout({ children }) {
    const session = await auth();

    // ✅ Logging session and user details for debugging
    console.log("Session Data:", session);
    if (session?.user) {
        console.log("User Role:", session.user.role);
        console.log("User ID:", session.user.userID);
    } else {
        console.log("No session data or user found");
    }

    const userRole = session?.user?.role || "user";
    const userID = session?.user?.userID;
    const userNavigation = userRole === "user" ? getUserNavigation(userID) : NAVIGATION.admin;
    return (
        <html lang="en">
            <body>
                <SessionProvider session={session}>
                    <ThemeProvider theme={theme}>
                        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
                            <AppProvider
                                session={session}
                                navigation={userNavigation}
                                branding={BRANDING}
                                authentication={AUTHENTICATION}
                                theme={theme}
                            >
                                <CssBaseline />
                                {children}
                            </AppProvider>
                        </AppRouterCacheProvider>
                    </ThemeProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
