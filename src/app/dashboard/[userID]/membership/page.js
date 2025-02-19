// src/app/dashboard/membership/page.js
"use client";

import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useSession } from "next-auth/react";
import squareClient from "../../../../lib/square"; // Import your Square.js client

const ManageMembership = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [membershipStatus, setMembershipStatus] = useState(null);

  useEffect(() => {
    const fetchMembershipStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/membership/status", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMembershipStatus(data);
        } else {
          throw new Error("Failed to fetch membership status.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchMembershipStatus();
  }, [session]);

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/membership/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.token}`,
        },
        body: JSON.stringify({ plan: "premium" }),
      });

      if (!response.ok) {
        throw new Error("Failed to upgrade membership.");
      }

      const data = await response.json();
      setMembershipStatus(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/membership/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to cancel membership.");
      }

      const data = await response.json();
      setMembershipStatus(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: "2rem" }}>
      <Typography variant="h4" gutterBottom>
        Manage Your Membership
      </Typography>

      {loading && <CircularProgress />}

      {error && (
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {error}
        </Alert>
      )}

      {membershipStatus ? (
        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <Typography variant="h6">
            Current Plan: {membershipStatus.plan}
          </Typography>
          <Typography variant="body1">
            Status: {membershipStatus.status}
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: 2 }}>
            Renewal Date: {membershipStatus.renewalDate}
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpgrade}
                disabled={loading || membershipStatus.plan === "premium"}
              >
                Upgrade to Premium
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                color="error"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel Membership
              </Button>
            </Grid>
          </Grid>
        </Paper>
      ) : (
        <Typography>
          You don’t have an active membership. Select a plan to get started.
        </Typography>
      )}
    </Box>
  );
};

export default ManageMembership;
