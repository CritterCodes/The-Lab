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
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Snackbar,
} from "@mui/material";
import MembershipService from "@/services/memberships";

const MembershipTab = ({ user, onUpdateMembership }) => {
  const [plans, setPlans] = useState([]);
  const [currentMembership, setCurrentMembership] = useState(user?.membership || null);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [billingType, setBillingType] = useState("monthly");
  const router = useRouter();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const data = await MembershipService.getMembershipPlans();
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

  const handleCheckout = (plan) => {
    console.log("🛒 Checkout plan:", plan);

    // Find the correct variation based on selected billingType
    const planVariation = plan.variations.find((v) => v.cadence.toLowerCase() === billingType);

    if (!planVariation) {
      console.error("⚠️ No valid plan variation found for", plan.name);
      setSnackbarMessage("Plan variation not found.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    // Navigate to the checkout page with the correct plan and variation ID
    router.push(`/checkout?planId=${plan.id}&variationId=${planVariation.variationId}`);
  };

  // Categorize plans based on the selected billing cadence (Monthly/Annual)
  const filteredPlans = plans
    .filter((plan) =>
      plan.variations.some((variation) => variation.cadence.toLowerCase() === billingType)
    )
    .sort((a, b) => {
      // Ensure "Basic" appears before "Plus"
      if (a.name.includes("Basic") && b.name.includes("Plus")) return -1;
      if (a.name.includes("Plus") && b.name.includes("Basic")) return 1;
      return 0;
    });

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Manage Your Membership
      </Typography>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && (
        <>
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
            >
              <ToggleButton value="monthly">Monthly</ToggleButton>
              <ToggleButton value="annual">Annual</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Grid container spacing={3}>
            {/* Guest Card (Free Plan) */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ border: !currentMembership ? "2px solid green" : "none" }}>
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

            {/* Display only plans matching the selected billing type */}
            {filteredPlans.map((plan) => (
              <Grid key={plan.id} item xs={12} sm={6} md={4}>
                <Card sx={{ border: currentMembership?.id === plan.id ? "2px solid green" : "none" }}>
                  <CardContent>
                    <Typography variant="h6">{plan.name}</Typography>
                    <Typography variant="body2" sx={{ my: 2 }}>
                      {plan.name.includes("Plus")
                        ? "Access badge & dedicated desk."
                        : "Access badge."}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: "bold", mb: 2 }}>
                      ${plan.price}/{billingType}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={currentMembership?.id === plan.id}
                      onClick={() => handleCheckout(plan)}
                    >
                      {currentMembership?.id === plan.id ? "Current Plan" : "Subscribe"}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default MembershipTab;
