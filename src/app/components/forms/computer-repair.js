"use client";
import React, { useState } from "react";
import { TextField, Button, Typography, Container, Paper, Grid, MenuItem } from "@mui/material";

const ComputerRepairForm = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    deviceType: "",
    issueDescription: "",
    contactMethod: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission logic here (e.g., send data to an API)
    setSubmitted(true);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 8 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Computer Repair Request
        </Typography>
        {submitted ? (
          <Typography variant="body1" align="center">
            Thank you for your request. We will contact you soon.
          </Typography>
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  variant="outlined"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  variant="outlined"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  variant="outlined"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Device Type"
                  name="deviceType"
                  variant="outlined"
                  value={form.deviceType}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="Laptop">Laptop</MenuItem>
                  <MenuItem value="Desktop">Desktop</MenuItem>
                  <MenuItem value="Tablet">Tablet</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Issue Description"
                  name="issueDescription"
                  variant="outlined"
                  multiline
                  rows={4}
                  value={form.issueDescription}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Preferred Contact Method"
                  name="contactMethod"
                  variant="outlined"
                  value={form.contactMethod}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="Email">Email</MenuItem>
                  <MenuItem value="Phone">Phone</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  type="submit"
                >
                  Submit Request
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </Paper>
    </Container>
  );
};

export default ComputerRepairForm;
