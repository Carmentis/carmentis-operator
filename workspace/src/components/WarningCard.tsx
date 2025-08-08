import React from 'react';
import { Alert, AlertTitle, Box, Card, Typography } from '@mui/material';

interface WarningCardProps {
  title: string;
  message: string;
  severity?: 'warning' | 'error' | 'info';
  children?: React.ReactNode;
}

/**
 * A reusable warning card component that displays a warning message with an icon.
 * 
 * @param title - The title of the warning
 * @param message - The warning message
 * @param severity - The severity of the warning (warning, error, info)
 * @param children - Optional additional content or actions
 */
export default function WarningCard({ 
  title, 
  message, 
  severity = 'warning',
  children 
}: WarningCardProps) {
  return (
      <Alert
          severity={severity}
          variant="outlined"
      >
        <Typography variant="body2">
          {message}
        </Typography>
        {children && (
            <Box mt={2}>
              {children}
            </Box>
        )}
      </Alert>
  );
}