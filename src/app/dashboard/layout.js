"use client";
import React from 'react';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { useTheme, Box } from '@mui/material';

export default function Layout({ children }) {
  const theme = useTheme();

  return (
    <DashboardLayout>
      <Box
        sx={{
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          minHeight: "100vh",
          height: "100%",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <PageContainer sx={{ flex: 1 }}>{children}</PageContainer>
      </Box>
    </DashboardLayout>
  );
}
