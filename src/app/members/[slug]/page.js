"use client";
import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Avatar, Grid, Chip, Paper, IconButton, 
    Divider, Container, CircularProgress, Alert, Button, Snackbar 
} from '@mui/material';
import { FaDiscord } from 'react-icons/fa';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import LanguageIcon from '@mui/icons-material/Language';
import InstagramIcon from '@mui/icons-material/Instagram';
import EmailIcon from '@mui/icons-material/Email';
import StarIcon from '@mui/icons-material/Star';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';

export default function PublicProfilePage() {
    const { slug } = useParams();
    const { data: session } = useSession();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleDiscordClick = () => {
        if (user.discordId) {
            window.open(`https://discord.com/users/${user.discordId}`, '_blank');
        } else if (user.discordHandle) {
            navigator.clipboard.writeText(user.discordHandle);
            setSnackbarOpen(true);
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Try fetching by username first
                let res = await fetch(`/api/v1/users?username=${slug}`);
                
                // If not found, try fetching by userID (backward compatibility)
                if (!res.ok && res.status === 404) {
                    res = await fetch(`/api/v1/users?userID=${slug}`);
                }

                if (res.ok) {
                    const data = await res.json();
                    const userProfile = data.user;
                    
                    if (!userProfile) {
                        setError("User not found.");
                        return;
                    }

                    // Check if profile is public or if viewer is admin/self
                    const isSelf = session?.user?.userID === userProfile.userID;
                    const isAdmin = session?.user?.role === 'admin';
                    const isActiveMember = ['active', 'probation'].includes(userProfile.membership?.status);
                    
                    if ((userProfile.isPublic && isActiveMember) || isSelf || isAdmin) {
                        setUser(userProfile);
                    } else {
                        setError("This profile is private or unavailable.");
                    }
                } else {
                    setError("User not found.");
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchUser();
    }, [slug, session]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Container maxWidth="md" sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
    if (!user) return null;

    const SocialLink = ({ icon, url }) => {
        if (!url) return null;
        // Ensure URL has protocol
        const href = url.startsWith('http') ? url : `https://${url}`;
        return (
            <IconButton component="a" href={href} target="_blank" color="primary">
                {icon}
            </IconButton>
        );
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 4, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 4 }}>
                    <Avatar 
                        src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || user.firstName)}&background=random`} 
                        sx={{ width: 150, height: 150, border: '4px solid #4caf50' }}
                    />
                    <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap' }}>
                            <Typography variant="h4" fontWeight="bold">
                                {user.username || `${user.firstName} ${user.lastName}`}
                            </Typography>
                            {user.role === 'admin' && user.boardPosition && (
                                <Chip 
                                    label={user.boardPosition} 
                                    color="secondary" 
                                    size="small" 
                                    sx={{ fontWeight: 'bold' }}
                                />
                            )}
                            <Chip 
                                icon={<StarIcon />} 
                                label={`${user.stake || 0} Stake`} 
                                color="warning" 
                                size="small" 
                                variant="outlined"
                            />
                            {!user.isPublic && (
                                <Chip 
                                    label="Private View" 
                                    color="error" 
                                    size="small" 
                                    variant="outlined"
                                    title="Visible only to you and admins"
                                />
                            )}
                        </Box>
                        
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                            {user.role === 'admin' ? 'Administrator' : 'Member'} • Joined {new Date(user.createdAt).toLocaleDateString()}
                        </Typography>

                        <Box sx={{ mt: 1 }}>
                            {(user.creatorType || []).map(type => (
                                <Chip key={type} label={type} size="small" sx={{ mr: 1, mb: 1 }} />
                            ))}
                        </Box>

                        <Box sx={{ mt: 2 }}>
                            <SocialLink icon={<GitHubIcon />} url={user.socials?.github} />
                            <SocialLink icon={<LinkedInIcon />} url={user.socials?.linkedin} />
                            <SocialLink icon={<TwitterIcon />} url={user.socials?.twitter} />
                            <SocialLink icon={<InstagramIcon />} url={user.socials?.instagram} />
                            <SocialLink icon={<LanguageIcon />} url={user.socials?.website} />
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ my: 4 }} />

                <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                        <Typography variant="h6" gutterBottom>About</Typography>
                        <Typography variant="body1" paragraph>
                            {user.bio || "No bio provided."}
                        </Typography>

                        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Skills</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {(user.skills || []).length > 0 ? (
                                user.skills.map(skill => (
                                    <Chip key={skill} label={skill} variant="outlined" />
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary">No skills listed.</Typography>
                            )}
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                            <Typography variant="subtitle2" gutterBottom>Contact</Typography>
                            {user.isPublic ? (
                                <>
                                    {(user.privacy?.showEmail ?? true) && (
                                        <Button 
                                            startIcon={<EmailIcon />} 
                                            fullWidth 
                                            variant="contained" 
                                            href={`mailto:${user.email}`}
                                        >
                                            Send Email
                                        </Button>
                                    )}
                                    {(user.privacy?.showDiscord ?? true) && user.discordHandle && (
                                        <Button 
                                            startIcon={<FaDiscord />} 
                                            fullWidth 
                                            variant="outlined" 
                                            sx={{ mt: 1, borderColor: '#5865F2', color: '#5865F2' }}
                                            onClick={handleDiscordClick}
                                        >
                                            {user.discordId ? "Add on Discord" : "Copy Discord Handle"}
                                        </Button>
                                    )}
                                    {!(user.privacy?.showEmail ?? true) && (!(user.privacy?.showDiscord ?? true) || !user.discordHandle) && (
                                        <Typography variant="body2" color="text.secondary">
                                            No contact information shared.
                                        </Typography>
                                    )}
                                </>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    Contact info is private.
                                </Typography>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                message={`Discord handle copied: ${user?.discordHandle}`}
            />
        </Container>
    );
}
