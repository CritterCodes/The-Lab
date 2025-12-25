"use client";

import React, { useEffect, useState } from "react";
import { Box, Grid, Card, CardContent, Typography, Button, CircularProgress, Snackbar } from "@mui/material";
import { useRouter } from "next/navigation";

const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const router = useRouter();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/v1/plans"); 
        const data = await response.json();
        setPlans(data);
      } catch (error) {
        console.error("❌ Error fetching plans:", error);
        setSnackbarMessage("Failed to load membership plans.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <Box sx={{ padding: "4rem 1rem" }}>
      <Typography variant="h3" align="center" gutterBottom>
        Choose Your Membership Plan
      </Typography>
      <Typography variant="body1" align="center" sx={{ maxWidth: "600px", margin: "0 auto", marginBottom: "2rem" }}>
        Explore our membership options and join the Fab Lab Fort Smith community. Whether you&apos;re a casual hobbyist or
        a dedicated maker, we have a plan for you.
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {plans.map((plan) => (
            <Grid item xs={12} sm={6} md={4} key={plan.id}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {plan.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ marginBottom: "1rem" }}>
                    {plan.description}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: "1rem" }}>
                    ${plan.price}/month
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <div dangerouslySetInnerHTML={{ __html: plan.embed }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}


      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        ContentProps={{
          sx: {
            backgroundColor:
              snackbarSeverity === "success"
                ? "green"
                : snackbarSeverity === "error"
                ? "red"
                : "orange",
            color: "white",
          },
        }}
      />
    </Box>
  );
};

export default PlansPage;
