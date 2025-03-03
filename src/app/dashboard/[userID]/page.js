"use client";

import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  useTheme,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoadingTerminal from "@/app/components/LoadingTerminal";

const DashboardPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const loading = status === 'loading';

  const loadingSteps = [
    'Initializing...',
    'Loading user data...',
    'Fetching membership plans...',
    'Connecting to database...',
    'Retrieving session information...',
    'Finalizing setup...',
    'Almost there...'
  ];

  if (loading) {
    return <LoadingTerminal steps={loadingSteps} />;
  }

  const handleNavigate = (path) => {
    router.push(path);
  };

  const displayName = session?.user?.username || session?.user?.name || "User";

  return (
    <Box
      sx={{
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        minHeight: "100vh",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <Typography variant="h4" component="h1">
          Welcome, {displayName}!
        </Typography>
      </Box>

      {/* Dashboard Options */}
      <Grid container spacing={3}>
        {/* Manage Profile */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: "100%", backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.primary.main}` }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Manage Profile
              </Typography>
              <Typography variant="body2" gutterBottom>
                Update your personal details and customize your profile.
              </Typography>
              <Button
                variant="contained"
                onClick={() => handleNavigate(`/dashboard/${session.user.userID}/profile`)}
                sx={{ marginTop: "1rem" }}
              >
                Go to Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Manage Membership */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: "100%", backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.primary.main}` }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Manage Membership
              </Typography>
              <Typography variant="body2" gutterBottom>
                View your membership details, update your plan, or change your
                payment method.
              </Typography>
              <Button
                variant="contained"
                onClick={() => handleNavigate(`/dashboard/${session.user.userID}/profile?tab=1`)}
                sx={{ marginTop: "1rem" }}
              >
                Manage Membership
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Help or Support */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: "100%", backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.primary.main}` }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Help & Support
              </Typography>
              <Typography variant="body2" gutterBottom>
                Need assistance? Get in touch with our support team.
              </Typography>
              <Button
                variant="contained"
                onClick={() => window.open("https://discord.gg/YWcAd3TCDV", "_blank")}
                sx={{ marginTop: "1rem" }}
              >
                Get Help
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
