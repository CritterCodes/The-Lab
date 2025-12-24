"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  useTheme,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoadingTerminal from "@/app/components/LoadingTerminal";

const DashboardPage = ({ params }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

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

  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user?.userID) {
        try {
          const res = await fetch(`/api/v1/users?userID=${session.user.userID}`);
          if (res.ok) {
            const data = await res.json();
            setUserData(data.user);
          }
        } catch (error) {
          console.error("Failed to fetch user data", error);
        } finally {
          setLoadingUser(false);
        }
      }
    };

    if (session) {
      fetchUser();
    }
  }, [session]);

  if (loading || loadingUser) {
    return <LoadingTerminal steps={loadingSteps} />;
  }

  const handleNavigate = (path) => {
    router.push(path);
  };

  const displayName = session?.user?.username || session?.user?.name || "User";

  // Determine active step
  let activeStep = 0;
  let showProgress = true;

  if (userData) {
      const m = userData.membership || {};
      // Calculate total hours from volunteer log
      const totalHours = (m.volunteerLog || []).reduce((acc, log) => acc + Number(log.hours), 0);
      
      // Check if membership is active (waived or valid subscription)
      const isMember = m.isWaived || (m.sponsorshipExpiresAt && new Date(m.sponsorshipExpiresAt) > new Date());

      if (!m.applicationDate) activeStep = 1;
      else if (!m.contacted) activeStep = 2;
      else if (!m.onboardingComplete) activeStep = 3;
      else if (m.status === 'onboarding' && !isMember) activeStep = 4; // Membership Subscription
      else if ((m.status === 'probation' || (m.status === 'onboarding' && isMember)) && (!userData.profileCompleted || !userData.isPublic)) activeStep = 5; // Complete Public Profile
      else if (totalHours < 4) activeStep = 6; // Volunteer Requirement
      else if (!m.accessKey?.issued) activeStep = 7; // Access Key
      else if (m.status !== 'active' && m.status !== 'probation') activeStep = 8; // Full Access
      else showProgress = false; // All steps complete
  }

  const steps = [
    'Account Created',
    'Submit Application',
    'Initial Contact',
    'Onboarding',
    'Membership Subscription',
    'Complete Public Profile',
    'First Month Volunteer Requirement',
    'Access Key Issued',
    'Full Access Granted'
  ];

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

      {/* Membership Progress */}
      {showProgress && (
      <Card variant="outlined" sx={{ mb: 3, p: 2, backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.primary.main}` }}>
          <Typography variant="h6" gutterBottom color="primary">Membership Progress</Typography>
          <Stepper activeStep={activeStep} alternativeLabel sx={{
              '& .MuiStepLabel-label': { color: 'text.secondary' },
              '& .MuiStepLabel-label.Mui-active': { color: 'primary.main' },
              '& .MuiStepLabel-label.Mui-completed': { color: 'primary.main' },
              '& .MuiStepIcon-root': { color: 'gray' },
              '& .MuiStepIcon-root.Mui-active': { color: 'primary.main' },
              '& .MuiStepIcon-root.Mui-completed': { color: 'primary.main' },
          }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {!userData?.onboardingComplete && activeStep === 1 && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Alert severity="info" variant="outlined" sx={{ color: 'primary.main', borderColor: 'primary.main' }} action={
                      <Button color="inherit" size="small" onClick={() => handleNavigate(`/dashboard/${session.user.userID}/onboarding`)}>
                          Start Application
                      </Button>
                  }>
                      Please submit your membership application to get started.
                  </Alert>
              </Box>
          )}

          {activeStep === 2 && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Alert severity="info" variant="outlined">
                      Application submitted! We will contact you shortly.
                  </Alert>
              </Box>
          )}

          {activeStep === 3 && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Alert severity="info" variant="outlined">
                      Please visit the FabLab for your orientation and paperwork.
                  </Alert>
              </Box>
          )}

          {activeStep === 4 && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Alert severity="info" variant="outlined" action={
                      <Button color="inherit" size="small" onClick={() => handleNavigate(`/dashboard/${session.user.userID}/profile?tab=1`)}>
                          View Plans
                      </Button>
                  }>
                      Please select a membership plan to continue.
                  </Alert>
              </Box>
          )}
          
          {activeStep === 5 && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Alert severity="success" variant="outlined" action={
                      <Button color="inherit" size="small" onClick={() => handleNavigate(`/dashboard/${session.user.userID}/profile?tab=2`)}>
                          Setup Profile
                      </Button>
                  }>
                      Membership active! Please complete your public profile to connect with the community.
                  </Alert>
              </Box>
          )}
          
          {activeStep === 6 && (
               <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Alert severity="warning" variant="outlined" action={
                      <Button color="inherit" size="small" onClick={() => handleNavigate(`/dashboard/${session.user.userID}/volunteer`)}>
                          Log Hours
                      </Button>
                  }>
                      You have volunteer hours remaining for your first month requirement.
                  </Alert>
              </Box>
          )}
      </Card>
      )}

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
                onClick={() => window.open("/api/v1/discord/invite", "_blank")}
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
