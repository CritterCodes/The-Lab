"use client";

import { Box, Typography, TextField, Button } from "@mui/material";
import { motion, useReducedMotion } from "motion/react";

const ContactSection = () => {
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
          padding: "4rem 1rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          backgroundColor: "background.default",
          color: "text.primary",
        }}
      >
        {/* Heading */}
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: "bold",
            letterSpacing: "0.1em",
            marginBottom: "1.5rem",
          }}
        >
          We’d Love to Hear From You
        </Typography>

        {/* Contact Information */}
        <Typography
          variant="body1"
          gutterBottom
          sx={{
            maxWidth: "600px",
            lineHeight: "1.6",
            marginBottom: "2rem",
          }}
        >
          Address: 123 Example Street, Fort Smith, AR
          <br />
          Email: info@fablabfortsmith.com
          <br />
          Phone: (555) 123-4567
        </Typography>

        {/* Contact Form */}
        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            width: "100%",
            maxWidth: "500px",
            textAlign: "left",
          }}
        >
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            required
            sx={{
              backgroundColor: "background.paper",
            }}
          />
          <TextField
            label="Email"
            variant="outlined"
            type="email"
            fullWidth
            required
            sx={{
              backgroundColor: "background.paper",
            }}
          />
          <TextField
            label="Message"
            variant="outlined"
            multiline
            rows={4}
            fullWidth
            required
            sx={{
              backgroundColor: "background.paper",
            }}
          />
          <motion.div
            whileHover={{
              scale: shouldReduceMotion ? 1 : 1.1,
              transition: { duration: 0.3 },
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                width: "100%",
                padding: "0.75rem 1.5rem",
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              Submit
            </Button>
          </motion.div>
        </Box>
      </Box>
    </motion.div>
  );
};

export default ContactSection;
