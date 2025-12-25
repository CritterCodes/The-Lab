"use client";
import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Grid, Card, CardContent, Avatar, Chip, 
    TextField, InputAdornment, Container, CircularProgress, 
    FormControl, InputLabel, Select, MenuItem, OutlinedInput,
    useTheme, Button, Alert, Paper,
    Dialog, DialogTitle, DialogContent, DialogActions, Radio, RadioGroup, FormControlLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import LockIcon from '@mui/icons-material/Lock';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function MembersDirectory() {
    const theme = useTheme();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [hasAccess, setHasAccess] = useState(false);
    
    // Sponsorship Dialog State
    const [sponsorDialogOpen, setSponsorDialogOpen] = useState(false);
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [sponsorshipType, setSponsorshipType] = useState('one-time');
    
    // Derived lists for filters
    const [allSkills, setAllSkills] = useState([]);
    const [allInterests, setAllInterests] = useState([]);

    useEffect(() => {
        const checkAccessAndFetch = async () => {
            if (status === 'loading') return;
            
            if (status === 'unauthenticated') {
                router.push('/auth/signin');
                return;
            }

            try {
                // Check membership status
                const userRes = await fetch(`/api/v1/users?userID=${session.user.userID}`);
                if (userRes.ok) {
                    const userData = await userRes.json();
                    const memberStatus = userData.user?.membership?.status;
                    
                    if (memberStatus === 'active' || memberStatus === 'probation' || session.user.role === 'admin') {
                        setHasAccess(true);
                        await fetchMembers();
                    } else {
                        setHasAccess(false);
                        setLoading(false);
                    }
                }
            } catch (error) {
                console.error("Error checking access:", error);
                setLoading(false);
            }
        };

        checkAccessAndFetch();
    }, [status, session, router]);

    const fetchMembers = async () => {
        try {
            const res = await fetch('/api/v1/users?isPublic=true');
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
                
                // Extract unique skills and interests
                const skills = new Set();
                const interests = new Set();
                
                (data.users || []).forEach(user => {
                    (user.skills || []).forEach(skill => skills.add(skill));
                    (user.creatorType || []).forEach(type => interests.add(type));
                });
                
                setAllSkills(Array.from(skills).sort());
                setAllInterests(Array.from(interests).sort());
            }
        } catch (error) {
            console.error("Failed to fetch members", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSponsorClick = (user) => {
        setSelectedRecipient(user);
        setSponsorshipType('one-time'); // Default
        setSponsorDialogOpen(true);
    };

    const handleConfirmSponsorship = async () => {
        if (!selectedRecipient) return;
        
        try {
            const res = await fetch('/api/v1/sponsorship/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    recipientId: selectedRecipient.userID,
                    donorId: session?.user?.userID,
                    type: sponsorshipType
                })
            });
            
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Failed to create sponsorship link.");
            }
        } catch (error) {
            console.error("Sponsorship Error:", error);
            alert("An error occurred.");
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (
            (user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.lastName || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        const matchesSkills = selectedSkills.length === 0 || 
            selectedSkills.every(skill => (user.skills || []).includes(skill));

        const matchesInterests = selectedInterests.length === 0 || 
            selectedInterests.every(interest => (user.creatorType || []).includes(interest));

        return matchesSearch && matchesSkills && matchesInterests;
    });

    const handleCardClick = (username) => {
        if (username) {
            router.push(`/members/${username}`);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!hasAccess) {
        return (
            <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
                <Box sx={{ p: 4, border: '1px solid #333', borderRadius: 2, bgcolor: 'background.paper' }}>
                    <LockIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h4" gutterBottom>
                        Membership Required
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        The Member Directory is exclusive to active members. 
                        Please upgrade your membership to connect with the community.
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        component={Link} 
                        href={`/dashboard/${session?.user?.userID}/membership`}
                        sx={{ mt: 2 }}
                    >
                        View Membership Options
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 6, textAlign: 'center' }}>
                <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="primary">
                    Member Directory
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Connect with other makers, creators, and innovators in our community.
                </Typography>
            </Box>

            {/* Filters & Search */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }} elevation={2}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            placeholder="Search members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Filter by Skills</InputLabel>
                            <Select
                                multiple
                                value={selectedSkills}
                                onChange={(e) => setSelectedSkills(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                                input={<OutlinedInput label="Filter by Skills" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} size="small" />
                                        ))}
                                    </Box>
                                )}
                            >
                                {allSkills.map((skill) => (
                                    <MenuItem key={skill} value={skill}>
                                        {skill}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Filter by Interests</InputLabel>
                            <Select
                                multiple
                                value={selectedInterests}
                                onChange={(e) => setSelectedInterests(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                                input={<OutlinedInput label="Filter by Interests" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} size="small" />
                                        ))}
                                    </Box>
                                )}
                            >
                                {allInterests.map((interest) => (
                                    <MenuItem key={interest} value={interest}>
                                        {interest}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {/* Results Grid */}
            <Grid container spacing={3}>
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={user.userID}>
                            <Card 
                                sx={{ 
                                    height: '100%', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease-in-out',
                                    border: `1px solid ${theme.palette.divider}`,
                                    backgroundColor: 'rgba(0, 255, 0, 0.02)',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: `0 4px 20px rgba(0, 255, 0, 0.25)`,
                                        borderColor: theme.palette.primary.main
                                    }
                                }}
                                onClick={() => handleCardClick(user.username)}
                            >
                                <Box sx={{ 
                                    height: 60, 
                                    background: `linear-gradient(180deg, ${theme.palette.action.hover} 0%, transparent 100%)`,
                                    mb: -5
                                }} />
                                <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 0 }}>
                                    <Avatar
                                        src={user.image || "/default-avatar.png"}
                                        sx={{ 
                                            width: 100, 
                                            height: 100, 
                                            mx: 'auto', 
                                            mb: 2, 
                                            border: `2px solid ${theme.palette.primary.main}`,
                                            bgcolor: theme.palette.background.paper
                                        }}
                                    />
                                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                                        {user.username || `${user.firstName} ${user.lastName}`}
                                    </Typography>
                                    
                                    {user.role === 'admin' && (
                                        <Chip 
                                            label={user.boardPosition || "Admin"} 
                                            color="secondary" 
                                            size="small" 
                                            sx={{ mt: 1, mb: 2, fontWeight: 'bold' }} 
                                        />
                                    )}
                                    
                                    <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5 }}>
                                        {(user.creatorType || []).slice(0, 3).map((type) => (
                                            <Chip 
                                                key={type} 
                                                label={type} 
                                                size="small" 
                                                variant="outlined" 
                                                color="primary"
                                            />
                                        ))}
                                        {(user.creatorType || []).length > 3 && (
                                            <Chip label={`+${user.creatorType.length - 3}`} size="small" variant="outlined" color="primary" />
                                        )}
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{ 
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        mb: 2,
                                        minHeight: '3em' // Ensure consistent height for bio area
                                    }}>
                                        {user.bio || "No bio provided."}
                                    </Typography>

                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5 }}>
                                        {(user.skills || []).slice(0, 4).map((skill) => (
                                            <Chip 
                                                key={skill} 
                                                label={skill} 
                                                size="small" 
                                                sx={{ 
                                                    bgcolor: 'rgba(0, 255, 0, 0.1)',
                                                    border: '1px solid rgba(0, 255, 0, 0.2)',
                                                    color: theme.palette.text.primary
                                                }} 
                                            />
                                        ))}
                                        {(user.skills || []).length > 4 && (
                                            <Chip 
                                                label={`+${user.skills.length - 4}`} 
                                                size="small" 
                                                sx={{ bgcolor: 'rgba(0, 255, 0, 0.1)' }} 
                                            />
                                        )}
                                    </Box>
                                </CardContent>
                                <Box sx={{ p: 2, pt: 0 }}>
                                    <Button 
                                        fullWidth 
                                        variant="outlined" 
                                        color="primary" 
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSponsorClick(user);
                                        }}
                                        sx={{
                                            borderRadius: 2,
                                            '&:hover': {
                                                bgcolor: 'rgba(0, 255, 0, 0.1)'
                                            }
                                        }}
                                    >
                                        Sponsor Member
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="h6" color="text.secondary">
                                No members found matching your criteria.
                            </Typography>
                            <Button 
                                variant="text" 
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedSkills([]);
                                    setSelectedInterests([]);
                                }}
                                sx={{ mt: 2 }}
                            >
                                Clear Filters
                            </Button>
                        </Box>
                    </Grid>
                )}
            </Grid>

            {/* Sponsorship Dialog */}
            <Dialog open={sponsorDialogOpen} onClose={() => setSponsorDialogOpen(false)}>
                <DialogTitle>Sponsor {selectedRecipient?.firstName} {selectedRecipient?.lastName}</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        Choose how you would like to sponsor this member.
                    </Typography>
                    <RadioGroup
                        value={sponsorshipType}
                        onChange={(e) => setSponsorshipType(e.target.value)}
                    >
                        <FormControlLabel 
                            value="one-time" 
                            control={<Radio />} 
                            label="One-Time Gift ($45 for 30 Days)" 
                        />
                        <FormControlLabel 
                            value="subscription" 
                            control={<Radio />} 
                            label="Monthly Sponsorship ($45/month, Recurring)" 
                        />
                    </RadioGroup>
                    <Alert severity="info" sx={{ mt: 2 }}>
                        {sponsorshipType === 'one-time' 
                            ? "This will grant the member 30 days of access (Basic Membership). It is a single payment."
                            : "You will be billed $45 monthly. The member will have access as long as your subscription is active."
                        }
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSponsorDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirmSponsorship} variant="contained" color="primary">
                        Proceed to Checkout
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
