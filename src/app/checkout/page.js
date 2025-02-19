"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Snackbar,
  TextField,
} from "@mui/material";
import { PaymentForm, CreditCard } from "react-square-web-payments-sdk";
import { submitPayment } from "@/app/actions/actions";
import MembershipService from "@/services/memberships";

const CheckoutPage = ({ user }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId");
  const variationId = searchParams.get("variationId");

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  // Billing Information State (Auto-filling Full Name)
  const [fullName, setFullName] = useState(`${user?.fName || ""} ${user?.lName || ""}`.trim());
  const [address, setAddress] = useState(user?.address || "");
  const [city, setCity] = useState(user?.city || "");
  const [state, setState] = useState(user?.state || "");
  const [zip, setZip] = useState(user?.zip || "");
  const [country, setCountry] = useState(user?.country || "US");

  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        setLoading(true);
        const plans = await MembershipService.getMembershipPlans();
        const selectedPlan = plans.find((p) => p.id === planId);
        if (!selectedPlan) throw new Error("Plan not found.");
        setPlan(selectedPlan);
      } catch (error) {
        console.error("❌ Error loading plan data:", error);
        setSnackbarMessage(error.message || "Failed to load checkout details.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPlanDetails();
  }, [planId]);

  const handlePaymentSuccess = async (token) => {
    try {
      setLoading(true);
      console.log("📤 Sending Payment Request...");

      const subscriptionData = {
        planVariationId: variationId,
        paymentMethod: token.token,
        billingAddress: {
          fullName,
          address,
          city,
          state,
          zip,
          country,
        },
      };

      const response = await submitPayment(subscriptionData);
      if (response.success) {
        setSnackbarMessage("✅ Payment successful! Redirecting...");
        setSnackbarSeverity("success");
        setTimeout(() => router.push("/confirmation"), 2000);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("❌ Payment Error:", error);
      setSnackbarMessage("Payment failed. Please try again.");
      setSnackbarSeverity("error");
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!plan) {
    return (
      <Typography color="error" sx={{ textAlign: "center", mt: 3 }}>
        Error: Plan details not found.
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 3, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Checkout
      </Typography>
      <Card sx={{ mt: 3, p: 3 }}>
        <CardContent>
          <Typography variant="h6">{plan.name}</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Price: <strong>${plan.price}</strong> per {plan.cadence}
          </Typography>

          {/* Billing Information Form */}
          <TextField
            label="Full Name"
            fullWidth
            sx={{ mt: 2 }}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <TextField
            label="Address"
            fullWidth
            sx={{ mt: 2 }}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <TextField
            label="City"
            fullWidth
            sx={{ mt: 2 }}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
          <TextField
            label="State"
            fullWidth
            sx={{ mt: 2 }}
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
          />
          <TextField
            label="ZIP Code"
            fullWidth
            sx={{ mt: 2 }}
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            required
          />
          <TextField
            label="Country"
            fullWidth
            sx={{ mt: 2 }}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />

          {/* Square Payment Form (Only Includes the Pay Button) */}
          <PaymentForm
            applicationId={process.env.NEXT_PUBLIC_SQUARE_APP_ID}
            locationId={process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID}
            cardTokenizeResponseReceived={handlePaymentSuccess}
          >
            <CreditCard />
          </PaymentForm>

        </CardContent>
      </Card>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
};

export default CheckoutPage;
