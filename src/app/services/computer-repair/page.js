"use client";
import React from "react";
import { Container, Typography, Box } from "@mui/material";
import ComputerRepairForm from "@/app/components/forms/computer-repair";

const ComputerRepairPage = () => {
  return (
    <Container component="main" maxWidth="md" sx={{ marginTop: 8 }}>
      <Typography component="h1" variant="h4" align="center" gutterBottom>
        Computer Repair Services
      </Typography>
      <Typography variant="body1" align="center" gutterBottom>
        We offer professional computer repair services at competitive rates. Our services include OS reinstallation, malware removal, system cleanup, and more.
      </Typography>
      <Box mt={4}>
        <ComputerRepairForm />
      </Box>
    </Container>
  );
};

export default ComputerRepairPage;
