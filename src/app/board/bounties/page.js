"use client";
import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Grid, Card, CardContent, Chip, 
    LinearProgress, useTheme, Dialog, DialogContent, IconButton,
    CardActionArea, Button
} from '@mui/material';
import { motion, AnimatePresence } from 'motion/react';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LoopIcon from '@mui/icons-material/Loop';
import Link from 'next/link';

const MotionGrid = motion(Grid);

export default function BoardBountiesPage() {
    const theme = useTheme();
    const [bounties, setBounties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [baseUrl, setBaseUrl] = useState('');
    const [selectedBounty, setSelectedBounty] = useState(null);

    useEffect(() => {
        setBaseUrl(window.location.origin);
        const fetchBounties = async () => {
            try {
                const res = await fetch('/api/v1/bounties');
                if (res.ok) {
                    const data = await res.json();
                    // Filter for open bounties only
                    const openBounties = (data.bounties || []).filter(b => b.status === 'open');
                    setBounties(openBounties);
                }
            } catch (error) {
                console.error("Failed to fetch bounties", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBounties();
        
        // Refresh every 5 minutes
        const interval = setInterval(fetchBounties, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const handleCardClick = (bounty) => {
        setSelectedBounty(bounty);
    };

    const handleClose = () => {
        setSelectedBounty(null);
    };

    if (loading) return <LinearProgress />;

    return (
        <Box sx={{ p: 4, height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button 
                        component={Link} 
                        href="/board" 
                        startIcon={<ArrowBackIcon />}
                        size="large"
                        sx={{ color: 'text.primary' }}
                    >
                        Back
                    </Button>
                    <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Available Bounties
                    </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h5" color="text.secondary">
                        Tap for Details
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        FabLab Fort Smith
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ flexGrow: 1, alignContent: 'flex-start', overflowY: 'auto' }}>
                <AnimatePresence>
                    {bounties.map((bounty, index) => (
                        <MotionGrid 
                            item xs={12} md={6} lg={4} key={bounty._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            layout
                        >
                            <Card sx={{ 
                                height: '100%', 
                                border: '1px solid rgba(0, 255, 0, 0.2)',
                                boxShadow: '0 0 10px rgba(0, 255, 0, 0.1)',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'scale(1.02)', boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)' }
                            }}>
                                <CardActionArea onClick={() => handleCardClick(bounty)} sx={{ height: '100%', p: 2 }}>
                                    <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        <Typography variant="h4" component="div" gutterBottom sx={{ fontWeight: 'bold' }}>
                                            {bounty.title}
                                        </Typography>
                                        
                                        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                                            {bounty.rewardType === 'hours' ? (
                                                <Chip 
                                                    icon={<AccessTimeIcon />} 
                                                    label={`${bounty.rewardValue} Hours`} 
                                                    color="success" 
                                                    variant="outlined"
                                                    sx={{ fontSize: '1.1rem', py: 2 }}
                                                />
                                            ) : (
                                                <Chip 
                                                    icon={<MonetizationOnIcon />} 
                                                    label={bounty.rewardValue} 
                                                    color="success" 
                                                    variant="outlined"
                                                    sx={{ fontSize: '1.1rem', py: 2 }}
                                                />
                                            )}
                                            
                                            {bounty.stakeValue > 0 && (
                                                <Chip 
                                                    icon={<StarIcon />} 
                                                    label={`+${bounty.stakeValue} Stake`} 
                                                    color="warning" 
                                                    variant="outlined"
                                                    sx={{ fontSize: '1.1rem', py: 2 }}
                                                />
                                            )}

                                            {bounty.recurrence && bounty.recurrence !== 'none' && (
                                                <Chip 
                                                    icon={<LoopIcon />} 
                                                    label={bounty.recurrence} 
                                                    color="info" 
                                                    variant="outlined"
                                                    sx={{ fontSize: '1.1rem', py: 2, textTransform: 'capitalize' }}
                                                />
                                            )}
                                        </Box>

                                        <Typography variant="h6" color="text.secondary" sx={{ 
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                        }}>
                                            {bounty.description}
                                        </Typography>
                                        
                                        <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                            <Typography variant="button" color="primary">
                                                Tap to Claim &rarr;
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </MotionGrid>
                    ))}
                </AnimatePresence>
                
                {bounties.length === 0 && (
                    <Box sx={{ width: '100%', textAlign: 'center', mt: 10 }}>
                        <Typography variant="h4" color="text.secondary">
                            No active bounties at the moment.
                        </Typography>
                    </Box>
                )}
            </Grid>

            {/* Detail Modal */}
            <Dialog 
                open={!!selectedBounty} 
                onClose={handleClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        border: `2px solid ${theme.palette.primary.main}`,
                        bgcolor: 'background.paper',
                        backgroundImage: 'none'
                    }
                }}
            >
                {selectedBounty && (
                    <DialogContent sx={{ p: 6, textAlign: 'center' }}>
                        <IconButton 
                            onClick={handleClose}
                            sx={{ position: 'absolute', right: 16, top: 16 }}
                        >
                            <CloseIcon fontSize="large" />
                        </IconButton>

                        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
                            {selectedBounty.title}
                        </Typography>

                        <Grid container spacing={4}>
                            <Grid item xs={12} md={8} sx={{ textAlign: 'left' }}>
                                <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                                    {selectedBounty.rewardType === 'hours' ? (
                                        <Chip 
                                            icon={<AccessTimeIcon />} 
                                            label={`${selectedBounty.rewardValue} Hours`} 
                                            color="success" 
                                            variant="filled"
                                            sx={{ fontSize: '1.2rem', py: 3, px: 1 }}
                                        />
                                    ) : (
                                        <Chip 
                                            icon={<MonetizationOnIcon />} 
                                            label={selectedBounty.rewardValue} 
                                            color="success" 
                                            variant="filled"
                                            sx={{ fontSize: '1.2rem', py: 3, px: 1 }}
                                        />
                                    )}
                                    
                                    {selectedBounty.stakeValue > 0 && (
                                        <Chip 
                                            icon={<StarIcon />} 
                                            label={`+${selectedBounty.stakeValue} Stake`} 
                                            color="warning" 
                                            variant="filled"
                                            sx={{ fontSize: '1.2rem', py: 3, px: 1 }}
                                        />
                                    )}

                                    {selectedBounty.recurrence && selectedBounty.recurrence !== 'none' && (
                                        <Chip 
                                            icon={<LoopIcon />} 
                                            label={selectedBounty.recurrence} 
                                            color="info" 
                                            variant="filled"
                                            sx={{ fontSize: '1.2rem', py: 3, px: 1, textTransform: 'capitalize' }}
                                        />
                                    )}
                                </Box>
                                <Typography variant="h5" paragraph>
                                    {selectedBounty.description}
                                </Typography>
                                <Typography variant="h6" color="text.secondary" sx={{ mt: 4 }}>
                                    Requirements:
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    • Must be an active member<br/>
                                    • Must have relevant safety training<br/>
                                    • Completion verified by staff
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <Box sx={{ 
                                    p: 2, 
                                    bgcolor: 'white', 
                                    borderRadius: 2,
                                    boxShadow: '0 0 20px rgba(255,255,255,0.2)'
                                }}>
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${baseUrl}/dashboard/bounties?highlight=${selectedBounty.bountyID}`)}&bgcolor=ffffff&color=000000`} 
                                        alt="Scan to claim" 
                                        style={{ width: 200, height: 200 }} 
                                    />
                                </Box>
                                <Typography variant="h5" sx={{ mt: 3, fontWeight: 'bold', color: 'primary.main' }}>
                                    SCAN TO CLAIM
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Open camera & scan
                                </Typography>
                            </Grid>
                        </Grid>
                    </DialogContent>
                )}
            </Dialog>
        </Box>
    );
}
