"use client";

import { motion, useReducedMotion } from "motion/react";
import { Box, Typography, Button } from "@mui/material";

const AboutSection = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: "easeOut" }}
      style={{ width: "100%" }}
    >
      <Box
        sx={{
          padding: { xs: "3rem 1rem", sm: "4rem 2rem" },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          backgroundColor: "background.default",
          color: "text.primary",
        }}
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: "bold",
              letterSpacing: "0.1em",
              fontSize: { xs: "1.5rem", sm: "2rem" },
              marginBottom: "1.5rem",
            }}
          >
            What is Fab Lab Fort Smith?
          </Typography>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Typography
            variant="body1"
            gutterBottom
            sx={{
              maxWidth: "600px",
              fontSize: { xs: "1rem", sm: "1.25rem" },
              lineHeight: "1.6",
              marginBottom: "2rem",
            }}
          >
            Fab Lab Fort Smith is a collaborative maker space where creativity
            meets technology. We empower the community by providing access to
            cutting-edge tools, workshops, and a supportive environment to
            innovate and grow.
          </Typography>
        </motion.div>

        {/* Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          whileHover={{
            scale: shouldReduceMotion ? 1 : 1.1,
            transition: { duration: 0.3 },
          }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outlined"
            size="large"
            sx={{
              borderColor: "primary.main",
              color: "primary.main",
              textTransform: "uppercase",
              fontWeight: "bold",
              padding: "0.5rem 2rem",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "primary.main",
                color: "white",
                borderColor: "primary.main",
              },
            }}
          >
            Learn More About Us
          </Button>
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default AboutSection;
