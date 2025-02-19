"use client";

import { Box, Typography, Button, useTheme } from "@mui/material";
import { motion } from "motion/react";
import Link from "next/link";

const HeroSection = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "4rem 1rem",
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 50%, ${theme.palette.background.default} 100%)`,
        color: theme.palette.getContrastText(theme.palette.background.default),
        minHeight: "90vh",
        textAlign: "center",
      }}
    >
      {/* Animated Headline */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: "bold",
            letterSpacing: "0.1em",
            fontSize: { xs: "2rem", sm: "3rem" },
          }}
        >
          Unleash Your Creativity
        </Typography>
      </motion.div>

      {/* Animated Subheadline */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            maxWidth: "600px",
            fontSize: { xs: "1rem", sm: "1.25rem" },
            marginBottom: "2rem",
          }}
        >
          A community-driven space providing tools, resources, and education to
          bring your ideas to life.
        </Typography>
      </motion.div>

      {/* Animated Button with Link */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Link href="auth/register" passHref>
          <Button
            variant="contained"
            size="large"
            sx={{
              padding: "0.75rem 2rem",
              fontSize: "1rem",
              textTransform: "uppercase",
              boxShadow: `0px 4px 10px ${theme.palette.primary.dark}`,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: `0px 6px 14px ${theme.palette.primary.dark}`,
              },
            }}
          >
            Become a Member
          </Button>
        </Link>
      </motion.div>
    </Box>
  );
};

export default HeroSection;
