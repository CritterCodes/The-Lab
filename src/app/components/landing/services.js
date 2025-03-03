"use client";
import React from "react";
import { Container, Grid, Card, CardContent, Typography, Button, useTheme } from "@mui/material";
import Link from "next/link";

const services = [
  {
    title: "Computer Repair",
    description: "Professional computer repair services.",
    link: "/services/computer-repair"
  },
  {
    title: "Laser Engraving",
    description: "Coming soon",
    link: "#"
  },
  {
    title: "3D Printing",
    description: "Coming soon",
    link: "#"
  }
];

const Services = () => {
  const theme = useTheme();

  return (
    <Container component="main" maxWidth="lg" sx={{ marginTop: 8 }}>
      <Typography component="h1" variant="h4" align="center" gutterBottom sx={{ color: theme.palette.primary.main }}>
        Our Services
      </Typography>
      <Grid container spacing={4}>
        {services.map((service, index) => (
          <Grid item key={index} xs={12} sm={6} md={4}>
            <Card sx={{ cursor: service.link !== "#" ? "pointer" : "default", backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}>
              <CardContent>
                <Typography gutterBottom variant="h5" component="div" sx={{ color: theme.palette.primary.main }}>
                  {service.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ color: theme.palette.text.secondary }}>
                  {service.description}
                </Typography>
              </CardContent>
              {service.link !== "#" && (
                <Link href={service.link} passHref>
                  <Button size="small" color="primary" sx={{ color: theme.palette.primary.main }}>
                    Learn More
                  </Button>
                </Link>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Services;
