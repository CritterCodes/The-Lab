import React from 'react';
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom color="primary">
                    About Fab Lab Fort Smith
                </Typography>
                
                <Typography variant="body1" paragraph>
                    Fab Lab Fort Smith is a community workshop that provides access to tools, technology, and knowledge for makers, inventors, artists, and learners of all ages.
                </Typography>

                <Typography variant="body1" paragraph>
                    We are part of the global Fab Lab network, a distributed community of small-scale workshops with digital fabrication equipment.
                </Typography>

                <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom>Our Values</Typography>
                    <Typography variant="body1" paragraph>
                        We believe in open access to technology, collaborative learning, and the power of making.
                    </Typography>
                </Box>

                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        component={Link} 
                        href="/code-of-conduct"
                    >
                        View Code of Conduct
                    </Button>
                    <Button 
                        variant="outlined" 
                        color="primary" 
                        component={Link} 
                        href="/auth/register"
                    >
                        Join Us
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}
