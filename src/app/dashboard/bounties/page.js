"use client";
import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Button, Grid, Card, CardContent, CardActions, 
    Chip, Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, MenuItem, Select, InputLabel, FormControl, 
    Tabs, Tab, Alert, LinearProgress, IconButton, Tooltip, Fab, Zoom, useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import LoopIcon from '@mui/icons-material/Loop';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';
import UndoIcon from '@mui/icons-material/Undo';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function BountiesPage() {
    const { data: session } = useSession();
    const theme = useTheme();
    const [bounties, setBounties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userMembership, setUserMembership] = useState(null);
    const [tabValue, setTabValue] = useState(0); // 0: All, 1: Hours, 2: Community, 3: Completed
    const [openCreate, setOpenCreate] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingBountyId, setEditingBountyId] = useState(null);
    const [openSubmit, setOpenSubmit] = useState(false);
    const [submissionNote, setSubmissionNote] = useState('');
    const [submittingBountyId, setSubmittingBountyId] = useState(null);
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

    const handleOpenCreate = () => {
        setEditMode(false);
        setEditingBountyId(null);
        setNewBounty({ title: '', description: '', rewardType: 'custom', rewardValue: '', stakeValue: 0, recurrence: 'none' });
        setOpenCreate(true);
    };

    const handleOpenEdit = (bounty) => {
        setEditMode(true);
        setEditingBountyId(bounty.bountyID);
        setNewBounty({
            title: bounty.title,
            description: bounty.description,
            rewardType: bounty.rewardType,
            rewardValue: bounty.rewardValue,
            stakeValue: bounty.stakeValue,
            recurrence: bounty.recurrence || 'none'
        });
        setOpenCreate(true);
    };

    const handleSubmitBounty = async () => {
        try {
            let url = '/api/v1/bounties';
            let method = 'POST';
            let body = {
                ...newBounty,
                creatorID: session.user.userID
            };

            if (editMode) {
                url = `/api/v1/bounties?bountyID=${editingBountyId}&action=edit`;
                method = 'PUT';
                body = {
                    userID: session.user.userID,
                    updateData: newBounty
                };
            }

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                setOpenCreate(false);
                fetchBounties();
                setNewBounty({ title: '', description: '', rewardType: 'custom', rewardValue: '', stakeValue: 0, recurrence: 'none' });
            }
        } catch (error) {
            console.error("Failed to save bounty", error);
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

    const handleClawback = async (bountyID) => {
        if (!confirm("Are you sure you want to unassign this bounty? It will be set back to 'Open' status.")) return;
        try {
            const res = await fetch(`/api/v1/bounties?bountyID=${bountyID}&action=clawback`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID: session.user.userID })
            });
            if (res.ok) fetchBounties();
        } catch (error) {
            console.error("Failed to clawback bounty", error);
        }
    };

    const handleOpenSubmit = (bountyID) => {
        setSubmittingBountyId(bountyID);
        setSubmissionNote('');
        setOpenSubmit(true);
    };

    const handleSubmitWork = async () => {
        try {
            const res = await fetch(`/api/v1/bounties?bountyID=${submittingBountyId}&action=submit`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userID: session.user.userID,
                    submission: { note: submissionNote }
                })
            });
            if (res.ok) {
                setOpenSubmit(false);
                fetchBounties();
            }
        } catch (error) {
            console.error("Failed to submit work", error);
        }
    };

    const handleVerify = async (bountyID) => {
        try {
            const res = await fetch(`/api/v1/bounties?bountyID=${bountyID}&action=verify`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verifierID: session.user.userID })
            });
            if (res.ok) fetchBounties();
        } catch (error) {
            console.error("Failed to verify bounty", error);
        }
    };

    const filteredBounties = bounties.filter(b => {
        if (tabValue === 3) return b.status === 'completed' || b.status === 'verified';
        if (b.status === 'completed' || b.status === 'verified') return false; // Don't show completed in other tabs
        if (tabValue === 1) return b.rewardType === 'hours';
        if (tabValue === 2) return b.rewardType !== 'hours';
        return true;
    });

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, pb: { xs: 10, md: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>Bounty Board</Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={handleOpenCreate}
                    sx={{ display: { xs: 'none', md: 'flex' } }}
                >
                    Create Bounty
                </Button>
            </Box>

            <Tabs 
                value={tabValue} 
                onChange={(e, v) => setTabValue(v)} 
                sx={{ mb: 3 }}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
            >
                <Tab label="All Open" />
                <Tab label="Volunteer Opportunities" />
                <Tab label="Community Requests" />
                <Tab label="Completed" />
            </Tabs>

            {loading ? <LinearProgress /> : (
                <Grid container spacing={3}>
                    {filteredBounties.map(bounty => {
                        const isCreator = bounty.creatorID === session?.user?.userID;
                        const isAdmin = session?.user?.role === 'admin';
                        const canEdit = isCreator || isAdmin;
                        const canClawback = (isCreator || isAdmin) && bounty.status === 'assigned';

                        return (
                            <Grid item xs={12} md={6} lg={4} key={bounty.bountyID}>
                                <Card sx={{ 
                                    height: '100%', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    border: bounty.rewardType === 'hours' ? '1px solid #4caf50' : '1px solid #9c27b0',
                                    opacity: bounty.status === 'completed' ? 0.8 : 1
                                }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <Chip 
                                                    label={bounty.status === 'completed' ? 'PENDING VERIFICATION' : bounty.status.toUpperCase()} 
                                                    color={
                                                        bounty.status === 'open' ? 'success' : 
                                                        bounty.status === 'completed' ? 'info' : 
                                                        bounty.status === 'verified' ? 'success' : 
                                                        'default'
                                                    } 
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
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <Chip 
                                                    icon={<StarIcon />} 
                                                    label={`${bounty.stakeValue} Stake`} 
                                                    color="warning" 
                                                    variant="outlined" 
                                                    size="small" 
                                                />
                                                {canEdit && (
                                                    <Tooltip title="Edit Bounty">
                                                        <IconButton size="small" onClick={() => handleOpenEdit(bounty)}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </Box>
                                        <Typography variant="h6" gutterBottom>{bounty.title}</Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            {bounty.description}
                                        </Typography>
                                        
                                        <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                            {bounty.rewardType === 'hours' ? (
                                                <Chip icon={<AccessTimeIcon />} label={`${bounty.rewardValue} Hours`} color="success" size="small" />
                                            ) : (
                                                <Chip icon={<MonetizationOnIcon />} label={bounty.rewardValue} color="secondary" size="small" />
                                            )}
                                            
                                            {bounty.assignedTo && (
                                                <Chip 
                                                    icon={<PersonIcon />} 
                                                    label={`Claimed by: ${bounty.assignedToUsername || bounty.assignedTo}`} 
                                                    variant="outlined" 
                                                    size="small"
                                                />
                                            )}
                                        </Box>
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: 'space-between' }}>
                                        <Box sx={{ width: '100%' }}>
                                            {bounty.status === 'open' && (
                                                <Button size="small" variant="contained" fullWidth onClick={() => handleClaim(bounty.bountyID)}>
                                                    Claim Bounty
                                                </Button>
                                            )}
                                            {bounty.status === 'assigned' && bounty.assignedTo === session?.user?.userID && (
                                                <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                                                    <Button 
                                                        size="small" 
                                                        variant="contained" 
                                                        color="warning" 
                                                        fullWidth
                                                        onClick={() => handleOpenSubmit(bounty.bountyID)}
                                                    >
                                                        Submit Work
                                                    </Button>
                                                    {canClawback && (
                                                        <Tooltip title="Unassign User (Clawback)">
                                                            <Button 
                                                                size="small" 
                                                                color="error" 
                                                                variant="outlined" 
                                                                onClick={() => handleClawback(bounty.bountyID)}
                                                            >
                                                                <UndoIcon />
                                                            </Button>
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            )}
                                            {bounty.status === 'assigned' && bounty.assignedTo !== session?.user?.userID && (
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button size="small" disabled fullWidth variant="outlined">Assigned</Button>
                                                    {canClawback && (
                                                        <Tooltip title="Unassign User (Clawback)">
                                                            <Button 
                                                                size="small" 
                                                                color="error" 
                                                                variant="outlined" 
                                                                onClick={() => handleClawback(bounty.bountyID)}
                                                            >
                                                                <UndoIcon />
                                                            </Button>
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            )}
                                            {bounty.status === 'completed' && (
                                                canEdit ? (
                                                    <Button 
                                                        size="small" 
                                                        variant="contained" 
                                                        color="success" 
                                                        fullWidth 
                                                        onClick={() => handleVerify(bounty.bountyID)}
                                                    >
                                                        Verify & Award
                                                    </Button>
                                                ) : (
                                                    <Button size="small" disabled fullWidth startIcon={<CheckCircleIcon />}>
                                                        Pending Verification
                                                    </Button>
                                                )
                                            )}
                                            {bounty.status === 'verified' && (
                                                <Button size="small" disabled fullWidth startIcon={<CheckCircleIcon />}>
                                                    Verified
                                                </Button>
                                            )}
                                        </Box>
                                    </CardActions>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* Mobile Create FAB */}
            <Zoom in={!loading}>
                <Fab 
                    color="primary" 
                    aria-label="add" 
                    onClick={handleOpenCreate}
                    sx={{ 
                        position: 'fixed', 
                        bottom: 24, 
                        right: 24, 
                        display: { xs: 'flex', md: 'none' } 
                    }}
                >
                    <AddIcon />
                </Fab>
            </Zoom>

            <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editMode ? 'Edit Bounty' : 'Create New Bounty'}</DialogTitle>
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
                    <Button onClick={handleSubmitBounty} variant="contained">
                        {editMode ? 'Save Changes' : 'Create Bounty'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openSubmit} onClose={() => setOpenSubmit(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Submit Work</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
                        Provide a brief description of the work you completed, or a link to the pull request/document.
                    </Typography>
                    <TextField 
                        label="Submission Notes / Link" 
                        fullWidth 
                        multiline 
                        rows={4}
                        value={submissionNote}
                        onChange={(e) => setSubmissionNote(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSubmit(false)}>Cancel</Button>
                    <Button onClick={handleSubmitWork} variant="contained" color="success">
                        Submit for Verification
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
