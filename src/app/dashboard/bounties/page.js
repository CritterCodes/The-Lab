"use client";
import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Button, Grid, Card, CardContent, CardActions, 
    Chip, Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, MenuItem, Select, InputLabel, FormControl, 
    Tabs, Tab, Alert, LinearProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import LoopIcon from '@mui/icons-material/Loop';
import LockIcon from '@mui/icons-material/Lock';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function BountiesPage() {
    const { data: session } = useSession();
    const [bounties, setBounties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userMembership, setUserMembership] = useState(null);
    const [tabValue, setTabValue] = useState(0); // 0: All, 1: Hours, 2: Community
    const [openCreate, setOpenCreate] = useState(false);
    const [newBounty, setNewBounty] = useState({
        title: '',
        description: '',
        rewardType: 'custom', // default for users
        rewardValue: '',
        stakeValue: 0, // Default additional stake is 0
        recurrence: 'none'
    });

    useEffect(() => {
        const init = async () => {
            if (session?.user?.userID) {
                // Fetch user to check membership
                try {
                    const userRes = await fetch(`/api/v1/users?userID=${session.user.userID}`);
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        setUserMembership(userData.membership);
                    }
                } catch (e) {
                    console.error("Failed to fetch user membership", e);
                }
            }
            fetchBounties();
        };
        init();
    }, [session]);

    const fetchBounties = async () => {
        try {
            const res = await fetch('/api/v1/bounties');
            if (res.ok) {
                const data = await res.json();
                setBounties(data.bounties || []);
            }
        } catch (error) {
            console.error("Failed to fetch bounties", error);
        } finally {
            setLoading(false);
        }
    };

    // Check if user has access (Admin OR Active/Probation Membership)
    const hasAccess = session?.user?.role === 'admin' || 
                      (userMembership && (userMembership.status === 'active' || userMembership.status === 'probation'));

    if (loading) return <LinearProgress />;

    if (!hasAccess) {
        return (
            <Box sx={{ p: 4, textAlign: 'center', mt: 4 }}>
                <LockIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h4" gutterBottom>Membership Required</Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    You need an active membership to access the Bounty Board and Volunteer features.
                </Typography>
                <Button variant="contained" component={Link} href={`/dashboard/${session?.user?.userID}/membership`}>
                    View Membership Options
                </Button>
            </Box>
        );
    }

    const handleCreate = async () => {
        try {
            const res = await fetch('/api/v1/bounties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newBounty,
                    creatorID: session.user.userID
                })
            });
            if (res.ok) {
                setOpenCreate(false);
                fetchBounties();
                setNewBounty({ title: '', description: '', rewardType: 'custom', rewardValue: '', stakeValue: 0, recurrence: 'none' });
            }
        } catch (error) {
            console.error("Failed to create bounty", error);
        }
    };

    const handleClaim = async (bountyID) => {
        try {
            const res = await fetch(`/api/v1/bounties?bountyID=${bountyID}&action=assign`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID: session.user.userID })
            });
            if (res.ok) fetchBounties();
        } catch (error) {
            console.error("Failed to claim bounty", error);
        }
    };

    const filteredBounties = bounties.filter(b => {
        if (tabValue === 1) return b.rewardType === 'hours';
        if (tabValue === 2) return b.rewardType !== 'hours';
        return true;
    });

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Bounty Board</Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={() => setOpenCreate(true)}
                >
                    Create Bounty
                </Button>
            </Box>

            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
                <Tab label="All Bounties" />
                <Tab label="Volunteer Opportunities" />
                <Tab label="Community Requests" />
            </Tabs>

            {loading ? <LinearProgress /> : (
                <Grid container spacing={3}>
                    {filteredBounties.map(bounty => (
                        <Grid item xs={12} md={6} lg={4} key={bounty.bountyID}>
                            <Card sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                border: bounty.rewardType === 'hours' ? '1px solid #4caf50' : '1px solid #9c27b0'
                            }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <Chip 
                                                label={bounty.status.toUpperCase()} 
                                                color={bounty.status === 'open' ? 'success' : 'default'} 
                                                size="small" 
                                            />
                                            {bounty.recurrence && bounty.recurrence !== 'none' && (
                                                <Chip 
                                                    icon={<LoopIcon sx={{ fontSize: '1rem !important' }} />} 
                                                    label={bounty.recurrence} 
                                                    size="small" 
                                                    color="info" 
                                                    variant="outlined"
                                                    sx={{ textTransform: 'capitalize' }}
                                                />
                                            )}
                                        </Box>
                                        <Chip 
                                            icon={<StarIcon />} 
                                            label={`${bounty.stakeValue} Stake`} 
                                            color="warning" 
                                            variant="outlined" 
                                            size="small" 
                                        />
                                    </Box>
                                    <Typography variant="h6" gutterBottom>{bounty.title}</Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {bounty.description}
                                    </Typography>
                                    
                                    <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                                        {bounty.rewardType === 'hours' ? (
                                            <Chip icon={<AccessTimeIcon />} label={`${bounty.rewardValue} Hours`} color="success" />
                                        ) : (
                                            <Chip icon={<MonetizationOnIcon />} label={bounty.rewardValue} color="secondary" />
                                        )}
                                    </Box>
                                </CardContent>
                                <CardActions>
                                    {bounty.status === 'open' && (
                                        <Button size="small" variant="contained" fullWidth onClick={() => handleClaim(bounty.bountyID)}>
                                            Claim Bounty
                                        </Button>
                                    )}
                                    {bounty.status === 'assigned' && bounty.assignedTo === session?.user?.userID && (
                                        <Button size="small" variant="contained" color="warning" fullWidth>
                                            Submit Work
                                        </Button>
                                    )}
                                    {bounty.status === 'assigned' && bounty.assignedTo !== session?.user?.userID && (
                                        <Button size="small" disabled fullWidth>Assigned</Button>
                                    )}
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Bounty</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField 
                            label="Title" 
                            fullWidth 
                            value={newBounty.title}
                            onChange={(e) => setNewBounty({...newBounty, title: e.target.value})}
                        />
                        <TextField 
                            label="Description" 
                            fullWidth 
                            multiline 
                            rows={3}
                            value={newBounty.description}
                            onChange={(e) => setNewBounty({...newBounty, description: e.target.value})}
                        />
                        
                        {session?.user?.role === 'admin' && (
                            <FormControl fullWidth>
                                <InputLabel>Recurrence</InputLabel>
                                <Select
                                    value={newBounty.recurrence || 'none'}
                                    label="Recurrence"
                                    onChange={(e) => setNewBounty({...newBounty, recurrence: e.target.value})}
                                >
                                    <MenuItem value="none">None (One-time)</MenuItem>
                                    <MenuItem value="daily">Daily</MenuItem>
                                    <MenuItem value="weekly">Weekly</MenuItem>
                                    <MenuItem value="monthly">Monthly</MenuItem>
                                </Select>
                            </FormControl>
                        )}

                        <FormControl fullWidth>
                            <InputLabel>Reward Type</InputLabel>
                            <Select
                                value={newBounty.rewardType}
                                label="Reward Type"
                                onChange={(e) => setNewBounty({...newBounty, rewardType: e.target.value})}
                            >
                                <MenuItem value="custom">Custom Reward</MenuItem>
                                {session?.user?.role === 'admin' && (
                                    <MenuItem value="hours">Volunteer Hours</MenuItem>
                                )}
                            </Select>
                        </FormControl>

                        <TextField 
                            label={newBounty.rewardType === 'hours' ? "Hours Amount" : "Reward Description"}
                            fullWidth 
                            type={newBounty.rewardType === 'hours' ? "number" : "text"}
                            value={newBounty.rewardValue}
                            onChange={(e) => setNewBounty({...newBounty, rewardValue: e.target.value})}
                            helperText={newBounty.rewardType === 'hours' ? "Hours count towards monthly membership requirement" : "e.g. 0.001 BTC, Lunch, High Five"}
                        />

                        <TextField 
                            label="Additional Stake (Optional)" 
                            fullWidth 
                            type="number"
                            value={newBounty.stakeValue}
                            onChange={(e) => setNewBounty({...newBounty, stakeValue: e.target.value})}
                            helperText={`Base Stake: 3. Total Reward: ${3 + (Number(newBounty.stakeValue) || 0)} Stake.`}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
                    <Button onClick={handleCreate} variant="contained">Create Bounty</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
