import { Box, Typography } from "@mui/material";

const Footer = () => (
  <Box
    sx={{
      textAlign: "center",
      padding: "2rem 1rem",
      backgroundColor: "#222",
      color: "#fff",
    }}
  >
    <Typography variant="body2">
      © 2024 Fab Lab Fort Smith. All rights reserved.
    </Typography>
  </Box>
);

export default Footer;
