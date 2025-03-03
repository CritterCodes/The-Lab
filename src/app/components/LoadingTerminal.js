import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

const LoadingTerminal = ({ steps }) => {
  const [lines, setLines] = useState([]);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : ''));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < steps.length) {
        setLines((prevLines) => [...prevLines, steps[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [steps]);

  return (
    <Box
      sx={{
        backgroundColor: '#000000',
        color: '#00ff00',
        fontFamily: 'Roboto Mono, monospace',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        minHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      {lines.map((line, index) => (
        <Typography key={index} variant="body2">
          {line}
        </Typography>
      ))}
      <Typography variant="body2">Loading{dots}</Typography>
    </Box>
  );
};

export default LoadingTerminal;
