"use client";

import { Box, Typography, Button, useTheme } from "@mui/material";
import { motion, useReducedMotion } from "motion/react";

const MembershipSection = () => {
  const shouldReduceMotion = useReducedMotion();
  const theme = useTheme();

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
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
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
              color: theme.palette.primary.main,
              marginBottom: "1rem",
            }}
          >
            Join Our Discord Community
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
              color: theme.palette.text.primary,
              marginBottom: "2rem",
            }}
          >
            Stay updated with the latest news, events, and connect with fellow creators. Join our Discord community to get support and be part of the conversation!
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
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.background.default,
              "&:hover": {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.background.default,
              },
            }}
            onClick={() => window.open("https://discord.gg/YWcAd3TCDV", "_blank")}
          >
            Join Our Discord
          </Button>
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default MembershipSection;
