import React from 'react';
import { Box } from '@mui/material';

export const metadata = {
  title: 'FabLab Board',
  description: 'FabLab Digital Signage',
};

export default function BoardLayout({ children }) {
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default', 
      color: 'text.primary',
      overflow: 'hidden' // Prevent scrolling on digital signage
    }}>
      {children}
    </Box>
  );
}

