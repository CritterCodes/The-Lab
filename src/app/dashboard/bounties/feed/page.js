"use client";
import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Grid, Card, CardContent, CardMedia, 
    Container, Button, TextField, IconButton, Avatar, 
    CircularProgress, Chip, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function BountiesFeedPage() {
    const { data: session } = useSession();
    const router = useRouter();
    
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState('latest');
    const [commentText, setCommentText] = useState({});

    useEffect(() => {
        fetchItems();
    }, [sort]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            // Currently API doesn't support sort param for bounties, but we can add it later
            // For now just fetch all
            const res = await fetch(`/api/v1/bounties?limit=20`);
            if (res.ok) {
                const data = await res.json();
                let bounties = data.bounties || [];
                
                // Client-side sort for now until backend supports it
                if (sort === 'trending') {
                    bounties.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
                } else {
                    bounties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                }
                
                setItems(bounties);
            }
        } catch (error) {
            console.error("Failed to fetch bounties:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (id) => {
        if (!session) return;
        
        // Optimistic update
        setItems(prev => prev.map(item => {
            if (item.bountyID === id) {
                const isLiked = item.likes?.includes(session.user.userID);
                const newLikes = isLiked 
                    ? item.likes.filter(uid => uid !== session.user.userID)
                    : [...(item.likes || []), session.user.userID];
                return { ...item, likes: newLikes };
            }
            return item;
        }));

        try {
            await fetch(`/api/v1/bounties?bountyID=${id}&action=like`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID: session.user.userID })
            });
        } catch (error) {
            console.error("Error liking bounty:", error);
            fetchItems(); // Revert on error
        }
    };

    const handleCommentSubmit = async (id) => {
        if (!session || !commentText[id]?.trim()) return;
        
        const text = commentText[id];
        
        // Optimistic update
        const newComment = {
            id: crypto.randomUUID(),
            userID: session.user.userID,
            text,
            createdAt: new Date().toISOString(),
            user: {
                firstName: session.user.firstName,
                lastName: session.user.lastName,
                image: session.user.image
            }
        };

        setItems(prev => prev.map(item => {
            if (item.bountyID === id) {
                return { ...item, comments: [...(item.comments || []), newComment] };
            }
            return item;
        }));
        
        setCommentText(prev => ({ ...prev, [id]: '' }));

        try {
            await fetch(`/api/v1/bounties?bountyID=${id}&action=comment`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userID: session.user.userID,
                    text 
                })
            });
        } catch (error) {
            console.error("Error posting comment:", error);
            fetchItems(); // Revert
        }
    };

    return (
        <Container maxWidth={false} disableGutters sx={{ py: { xs: 0, md: 4 } }}>
            <Box sx={{ mb: 4, textAlign: 'center', display: { xs: 'none', md: 'block' } }}>
                <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                    Bounty Feed
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Discover opportunities to earn rewards!
                </Typography>
            </Box>

            {/* Mobile Sort Toggle */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, mt: { xs: 2, md: 0 } }}>
                <ToggleButtonGroup
                    value={sort}
                    exclusive
                    onChange={(e, newSort) => {
                        if (newSort) setSort(newSort);
                    }}
                    aria-label="feed sort"
                    size="small"
                >
                    <ToggleButton value="latest" aria-label="latest">
                        <AccessTimeIcon sx={{ mr: 1 }} /> Latest
                    </ToggleButton>
                    <ToggleButton value="trending" aria-label="trending">
                        <WhatshotIcon sx={{ mr: 1 }} /> Trending
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={0} justifyContent="center">
                    {items.map((item) => (
                        <Grid item xs={12} sm={8} md={6} lg={5} key={item.bountyID} sx={{ mb: { xs: 0, md: 4 } }}>
                            <Card sx={{ 
                                width: '100%', 
                                borderRadius: { xs: 0, md: 1 },
                                boxShadow: { xs: 'none', md: 1 },
                                borderBottom: { xs: '1px solid #eee', md: 'none' }
                            }}>
                                {/* Header */}
                                <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Avatar 
                                            src={item.creatorImage} // Assuming backend provides this or we need to fetch
                                            sx={{ width: 32, height: 32, border: '1px solid #eee' }} 
                                        >
                                            {item.creatorUsername?.[0]}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.9rem' }}>
                                                {item.creatorUsername || 'Unknown'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {item.isInfinite ? 'Infinite Bounty' : 'Single Claim'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <IconButton size="small" onClick={() => router.push(`/dashboard/bounties/${item.bountyID}`)}>
                                        <MoreHorizIcon />
                                    </IconButton>
                                </Box>

                                {/* Image or Placeholder */}
                                {item.imageUrl ? (
                                    <CardMedia
                                        component="img"
                                        image={item.imageUrl}
                                        alt={item.title}
                                        sx={{ 
                                            width: '100%', 
                                            height: 'auto',
                                            maxHeight: '80vh',
                                            objectFit: 'contain',
                                            cursor: 'pointer',
                                            bgcolor: 'black'
                                        }}
                                        onClick={() => router.push(`/dashboard/bounties/${item.bountyID}`)}
                                    />
                                ) : (
                                    <Box 
                                        sx={{ 
                                            width: '100%', 
                                            aspectRatio: '16/9', 
                                            bgcolor: 'grey.100', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            p: 4
                                        }}
                                        onClick={() => router.push(`/dashboard/bounties/${item.bountyID}`)}
                                    >
                                        <Typography variant="h5" fontWeight="bold" align="center" color="text.secondary">
                                            {item.title}
                                        </Typography>
                                    </Box>
                                )}

                                {/* Actions */}
                                <Box sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <IconButton onClick={() => handleLike(item.bountyID)} color={item.likes?.includes(session?.user?.userID) ? "error" : "default"}>
                                            {item.likes?.includes(session?.user?.userID) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                        </IconButton>
                                        <IconButton>
                                            <ChatBubbleOutlineIcon />
                                        </IconButton>
                                        <IconButton sx={{ transform: 'rotate(-30deg)', mt: -0.5 }}>
                                            <SendIcon />
                                        </IconButton>
                                    </Box>
                                    <Chip 
                                        icon={item.rewardType === 'cash' ? <MonetizationOnIcon /> : <AccessAlarmIcon />} 
                                        label={`${item.rewardValue} ${item.rewardType}`} 
                                        color="success" 
                                        variant="outlined" 
                                        size="small"
                                    />
                                </Box>

                                {/* Likes Count */}
                                <Box sx={{ px: 2, mb: 1 }}>
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.9rem' }}>
                                        {item.likes?.length || 0} likes
                                    </Typography>
                                </Box>

                                {/* Caption */}
                                <Box sx={{ px: 2, mb: 1 }}>
                                    <Typography variant="body2" component="span" fontWeight="bold" sx={{ mr: 1 }}>
                                        {item.creatorUsername}
                                    </Typography>
                                    <Typography variant="body2" component="span">
                                        {item.description}
                                    </Typography>
                                </Box>

                                {/* Comments Section */}
                                <Box sx={{ px: 2, pb: 2 }}>
                                    {(item.comments || []).length > 0 && (
                                        <Box sx={{ mb: 1 }}>
                                            {(item.comments || []).length > 2 && (
                                                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', mb: 0.5, display: 'block' }}>
                                                    View all {(item.comments || []).length} comments
                                                </Typography>
                                            )}
                                            {(item.comments || []).slice(-2).map(comment => (
                                                <Typography key={comment.id} variant="body2" sx={{ mb: 0.5 }}>
                                                    <Box component="span" fontWeight="bold" sx={{ mr: 1 }}>
                                                        {comment.user?.firstName}
                                                    </Box>
                                                    {comment.text}
                                                </Typography>
                                            ))}
                                        </Box>
                                    )}
                                    
                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                                    </Typography>

                                    {/* Add Comment */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', borderTop: '1px solid #efefef', pt: 1.5 }}>
                                        <TextField 
                                            placeholder="Add a comment..." 
                                            variant="standard" 
                                            fullWidth 
                                            size="small"
                                            value={commentText[item.bountyID] || ''}
                                            onChange={(e) => setCommentText({ ...commentText, [item.bountyID]: e.target.value })}
                                            InputProps={{ disableUnderline: true, style: { fontSize: '0.9rem' } }}
                                        />
                                        {commentText[item.bountyID] && (
                                            <Button 
                                                size="small" 
                                                sx={{ minWidth: 'auto', fontWeight: 'bold' }}
                                                onClick={() => handleCommentSubmit(item.bountyID)}
                                            >
                                                Post
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}
