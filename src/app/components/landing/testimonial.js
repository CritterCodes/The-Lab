"use client";

import { Box, Typography, Paper } from "@mui/material";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

const testimonials = [
  {
    quote:
      "The Fab Lab has been a game-changer for my small business. I love the supportive community and access to top-notch equipment!",
    name: "John Doe",
  },
  {
    quote:
      "Joining the Fab Lab was the best decision I made. The workshops and networking opportunities have been invaluable.",
    name: "Jane Smith",
  },
  {
    quote:
      "I’ve been able to turn my ideas into reality thanks to the Fab Lab’s amazing tools and resources.",
    name: "Emily Johnson",
  },
];

const Testimonials = () => {
  const shouldReduceMotion = useReducedMotion();
  const [current, setCurrent] = useState(0);

  const nextTestimonial = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrent((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

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
          backgroundColor: "#f9f9f9",
          textAlign: "center",
        }}
      >
        {/* Section Title */}
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: "bold",
            marginBottom: "2rem",
          }}
        >
          What Our Members Are Saying
        </Typography>

        {/* Testimonial Card */}
        <Paper
          elevation={3}
          sx={{
            padding: "2rem",
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
          }}
        >
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="body1"
              gutterBottom
              sx={{ fontSize: "1.2rem", lineHeight: "1.8", marginBottom: "1rem" }}
            >
              &quot;{testimonials[current].quote}&quot;
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "bold", color: "#4f46e5" }}
            >
              – {testimonials[current].name}
            </Typography>
          </motion.div>
        </Paper>

        {/* Navigation Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            marginTop: "2rem",
          }}
        >
          <Typography
            onClick={prevTestimonial}
            sx={{
              cursor: "pointer",
              fontWeight: "bold",
              color: "#4f46e5",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Previous
          </Typography>
          <Typography
            onClick={nextTestimonial}
            sx={{
              cursor: "pointer",
              fontWeight: "bold",
              color: "#4f46e5",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Next
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
};

export default Testimonials;
