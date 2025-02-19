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
} from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const DashboardPage = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleNavigate = (path) => {
    router.push(path);
  };

  return (
    <Box
      sx={{
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        backgroundColor: "background.default",
        color: "text.primary",
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
        <Avatar
          src={session?.user?.image || "/default-avatar.png"}
          alt={session?.user?.name || "User"}
          sx={{ width: 56, height: 56 }}
        />
        <Typography variant="h4" component="h1">
          Welcome, {session?.user?.name || "User"}!
        </Typography>
      </Box>

      {/* Dashboard Options */}
      <Grid container spacing={3}>
        {/* Manage Profile */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Manage Profile
              </Typography>
              <Typography variant="body2" gutterBottom>
                Update your personal details and customize your profile.
              </Typography>
              <Button
                variant="contained"
                onClick={() => handleNavigate("/dashboard/profile")}
                sx={{ marginTop: "1rem" }}
              >
                Go to Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Manage Membership */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: "100%" }}>
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
                onClick={() => handleNavigate("/membership")}
                sx={{ marginTop: "1rem" }}
              >
                Manage Membership
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Transaction History */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Transaction History
              </Typography>
              <Typography variant="body2" gutterBottom>
                Review your past payments and download invoices.
              </Typography>
              <Button
                variant="contained"
                onClick={() => handleNavigate("/transactions")}
                sx={{ marginTop: "1rem" }}
              >
                View History
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Help or Support */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Help & Support
              </Typography>
              <Typography variant="body2" gutterBottom>
                Need assistance? Get in touch with our support team.
              </Typography>
              <Button
                variant="contained"
                onClick={() => handleNavigate("/help")}
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
