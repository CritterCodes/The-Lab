"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Snackbar,
  useTheme,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  AlertTitle
} from "@mui/material";
import LoadingTerminal from "@/app/components/LoadingTerminal";
import VolunteerLog from "./VolunteerLog";

const MembershipTab = ({ user, onUpdateMembership }) => {
  const theme = useTheme();
  const [plans, setPlans] = useState([]);
  const [currentMembership, setCurrentMembership] = useState(user?.membership || null);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [billingType, setBillingType] = useState("monthly");
  const router = useRouter();

  const membershipStatus = user?.membership || {};
  const isReadyForPayment = membershipStatus.applicationDate && membershipStatus.contacted && membershipStatus.onboardingComplete;

  const activeStep = (() => {
      if (!membershipStatus.applicationDate) return 0;
      if (!membershipStatus.contacted) return 1;
      if (!membershipStatus.onboardingComplete) return 2;
      return 3; // Ready for payment
  })();

  const steps = [
      {
          label: 'Submit Application',
          description: 'Please complete the onboarding questionnaire to get started.',
          action: <Button variant="contained" color="primary" href={user?.userID ? `/dashboard/${user.userID}/onboarding` : "/dashboard/onboarding"} >Complete Questionnaire</Button> 
      },
      {
          label: 'Initial Contact',
          description: 'A team member will reach out to you shortly to discuss your application.',
      },
      {
          label: 'Onboarding',
          description: 'Meet with us to complete paperwork and safety orientation.',
      },
      {
          label: 'Select Membership',
          description: 'Choose a plan that fits your needs.',
      }
  ];

  const loadingSteps = [
    "Fetching membership plans...",
    "Checking user status...",
    "Loading payment options..."
  ];

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/v1/plans");
        if (!response.ok) {
          throw new Error("Failed to fetch membership plans.");
        }
        const data = await response.json();
        console.log("✅ Membership Plans:", data);
        setPlans(data);
      } catch (error) {
        console.error("❌ Error fetching membership plans:", error);
        setSnackbarMessage("Failed to load membership plans.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleBillingToggle = (event, newBillingType) => {
    if (newBillingType) {
      setBillingType(newBillingType);
    }
  };

  // Filter plans based on the selected billing type
  const filteredPlans = plans.filter((plan) =>
    plan.name.toLowerCase().includes(billingType)
  );

  if (loading) {
    return <LoadingTerminal steps={loadingSteps} />;
  }

  if (!isReadyForPayment) {
      return (
          <Box sx={{ mt: 3 }}>
              <Typography variant="h5" gutterBottom>Membership Application Status</Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                  <AlertTitle>Action Required</AlertTitle>
                  Please complete the following steps to unlock membership payment options.
              </Alert>
              
              <Card sx={{ border: `1px solid ${theme.palette.primary.main}` }}>
                  <CardContent>
                      <Stepper activeStep={activeStep} orientation="vertical">
                          {steps.map((step, index) => (
                              <Step key={step.label} expanded={true}>
                                  <StepLabel 
                                    StepIconProps={{
                                        sx: { 
                                            color: index <= activeStep ? theme.palette.primary.main : theme.palette.text.disabled,
                                            '&.Mui-active': { color: theme.palette.warning.main },
                                            '&.Mui-completed': { color: theme.palette.success.main },
                                        }
                                    }}
                                  >
                                      {step.label}
                                  </StepLabel>
                                  <StepContent>
                                      <Typography>{step.description}</Typography>
                                      {index === activeStep && step.action && (
                                          <Box sx={{ mt: 2 }}>
                                              {step.action}
                                          </Box>
                                      )}
                                  </StepContent>
                              </Step>
                          ))}
                      </Stepper>
                  </CardContent>
              </Card>
          </Box>
      );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Manage Your Membership
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        {currentMembership
          ? `You are currently subscribed to the ${currentMembership.name} plan.`
          : "You are not subscribed to any membership plan (Guest access)."}
      </Typography>

      {/* Billing Cycle Toggle */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <ToggleButtonGroup
          value={billingType}
          exclusive
          onChange={handleBillingToggle}
          aria-label="billing cycle"
          sx={{
            '& .MuiToggleButton-root': {
              color: theme.palette.primary.main,
              borderColor: theme.palette.primary.main,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.background.default,
              },
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.background.default,
              },
            },
          }}
        >
          <ToggleButton value="monthly">Monthly</ToggleButton>
          <ToggleButton value="annual">Annual</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3} sx={{ overflowX: 'auto' }}>
        {/* Guest Card (Free Plan) */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ border: "2px solid green" }}>
            <CardContent>
              <Typography variant="h6">Guest</Typography>
              <Typography variant="body2" sx={{ my: 2 }}>
                Free access with a member.
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 2 }}>
                Free
              </Typography>
              <Button
                variant="contained"
                color="default"
                fullWidth
                disabled={!currentMembership}
                onClick={() => onUpdateMembership(null)}
              >
                {currentMembership ? "Switch to Guest" : "Current Plan"}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Display plans */}
        {filteredPlans.map((plan) => (
          <Grid key={plan.id} item xs={12} sm={6} md={4}>
            <Card sx={{ border: "2px solid green", backgroundColor: currentMembership?.id === plan.id ? "rgba(0, 255, 0, 0.1)" : "inherit" }}>
              <CardContent>
                <Typography variant="h6">{plan.name}</Typography>
                <Typography variant="body2" sx={{ my: 2 }}>
                  {plan.name.includes("Plus")
                    ? "Access badge & dedicated desk."
                    : "Access badge."}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: "bold", mb: 2 }}>
                  ${plan.price}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <div dangerouslySetInnerHTML={{ __html: plan.embed }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <VolunteerLog user={user} onUpdate={onUpdateMembership} />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
    </Box>
  );
};

export default MembershipTab;
