"use client";

import { Box, Typography, TextField, Button, useTheme } from "@mui/material";
import { motion, useReducedMotion } from "motion/react";

const ContactSection = () => {
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
          padding: "4rem 1rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
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
            color: theme.palette.primary.main,
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
            color: theme.palette.text.primary,
          }}
        >
          Address: 805 N Greenwood Ave., Fort Smith, AR, 72901
          <br />
          Email: info@fablabfortsmith.com
          <br />
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
              backgroundColor: theme.palette.background.paper,
              "& .MuiInputBase-root": {
                color: theme.palette.text.primary,
              },
              "& .MuiInputLabel-root": {
                color: theme.palette.text.primary,
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: theme.palette.primary.main,
                },
                "&:hover fieldset": {
                  borderColor: theme.palette.primary.main,
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />
          <TextField
            label="Email"
            variant="outlined"
            type="email"
            fullWidth
            required
            sx={{
              backgroundColor: theme.palette.background.paper,
              "& .MuiInputBase-root": {
                color: theme.palette.text.primary,
              },
              "& .MuiInputLabel-root": {
                color: theme.palette.text.primary,
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: theme.palette.primary.main,
                },
                "&:hover fieldset": {
                  borderColor: theme.palette.primary.main,
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main,
                },
              },
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
              backgroundColor: theme.palette.background.paper,
              "& .MuiInputBase-root": {
                color: theme.palette.text.primary,
              },
              "& .MuiInputLabel-root": {
                color: theme.palette.text.primary,
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: theme.palette.primary.main,
                },
                "&:hover fieldset": {
                  borderColor: theme.palette.primary.main,
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main,
                },
              },
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
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.background.default,
                "&:hover": {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.background.default,
                },
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
