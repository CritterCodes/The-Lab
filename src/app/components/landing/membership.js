"use client";

import { Box, Typography, Button } from "@mui/material";
import { motion, useReducedMotion } from "motion/react";

const MembershipSection = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: "easeOut" }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "3rem 1.5rem",
          background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
          borderRadius: "16px",
          margin: "1rem",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: shouldReduceMotion ? 0 : 0.6 }}
        >
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "1.8rem", sm: "2.2rem" },
              color: "#1e3a8a",
              marginBottom: "1rem",
            }}
          >
            Join Our Community
          </Typography>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: shouldReduceMotion ? 0 : 0.6 }}
        >
          <Typography
            variant="body1"
            sx={{
              maxWidth: "600px",
              fontSize: { xs: "1rem", sm: "1.2rem" },
              lineHeight: "1.6",
              color: "#334155",
              marginBottom: "2rem",
            }}
          >
            Benefits of membership include access to tools and equipment,
            skill-building workshops, and networking opportunities with fellow
            creators. <br />
            <strong>Monthly membership: $30/month</strong>.
          </Typography>
        </motion.div>

        {/* Button */}
        <motion.div
          whileHover={{
            scale: shouldReduceMotion ? 1 : 1.05,
            boxShadow: "0px 8px 15px rgba(99, 102, 241, 0.5)",
          }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="contained"
            sx={{
              fontWeight: "bold",
              padding: "0.8rem 2rem",
              fontSize: "1rem",
              textTransform: "none",
              borderRadius: "30px",
              backgroundColor: "#6366f1",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "#4f46e5",
              },
            }}
          >
            View Membership Options
          </Button>
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default MembershipSection;
