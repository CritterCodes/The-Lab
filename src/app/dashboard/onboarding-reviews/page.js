"use client";
import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Chip, IconButton, Tooltip, CircularProgress,
    Container, Card, CardContent, Stack, Avatar, useTheme, useMediaQuery,
    TextField, InputAdornment
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ReviewDialog from '../../components/admin/ReviewDialog';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function OnboardingReviewsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        } else if (status === 'authenticated') {
            if (session.user.role !== 'admin') {
                router.push('/dashboard');
            } else {
                fetchApplicants();
            }
        }
    }, [status, session, router]);

    const fetchApplicants = async () => {
        try {
            const response = await fetch('/api/v1/users');
            if (response.ok) {
                const data = await response.json();
                // Filter for users who have applied (have applicationDate)
                const applicants = (data.users || []).filter(u => u.membership?.applicationDate);
                setUsers(applicants);
            }
        } catch (error) {
            console.error("Failed to fetch applicants", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewClick = (user) => {
        setSelectedUser(user);
        setDialogOpen(true);
    };

    const handleToggleReviewStatus = async (user) => {
        const newStatus = user.membership?.reviewStatus === 'reviewed' ? 'pending' : 'reviewed';
        
        // If marking as reviewed, also mark as contacted if not already
        const updateData = {
            membership: {
                reviewStatus: newStatus
            }
        };

        if (newStatus === 'reviewed' && !user.membership?.contacted) {
            updateData.membership.contacted = true;
        }
        
        try {
            const response = await fetch(`/api/v1/users?userID=${user.userID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                // Update local state
                setUsers(prev => prev.map(u => u.userID === user.userID ? {
                    ...u,
                    membership: {
                        ...u.membership,
                        reviewStatus: newStatus,
                        contacted: (newStatus === 'reviewed' && !user.membership?.contacted) ? true : u.membership.contacted
                    }
                } : u));
                setDialogOpen(false);
            }
        } catch (error) {
            console.error("Failed to update review status", error);
        }
    };

    const filteredUsers = users.filter(user => 
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        { field: 'firstName', headerName: 'First Name', flex: 1 },
        { field: 'lastName', headerName: 'Last Name', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1.5 },
        { 
            field: 'applicationDate', 
            headerName: 'Applied On', 
            flex: 1,
            valueGetter: (value, row) => {
                const date = row.membership?.applicationDate;
                return date ? new Date(date).toLocaleDateString() : 'N/A';
            }
        },
        {
            field: 'status',
            headerName: 'Status',
            flex: 1,
            renderCell: (params) => {
                const isReviewed = params.row.membership?.reviewStatus === 'reviewed';
                return (
                    <Chip 
                        icon={isReviewed ? <CheckCircleIcon /> : <PendingIcon />}
                        label={isReviewed ? "Reviewed" : "Needs Review"}
                        color={isReviewed ? "success" : "warning"}
                        variant="outlined"
                    />
                );
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 0.5,
            sortable: false,
            renderCell: (params) => (
                <Tooltip title="Review Application">
                    <IconButton onClick={() => handleReviewClick(params.row)}>
                        <VisibilityIcon />
                    </IconButton>
                </Tooltip>
            )
        }
    ];

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
                    Onboarding Reviews
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Review and approve new member applications
                </Typography>
            </Box>

            {isMobile ? (
                <Box>
                    <TextField
                        fullWidth
                        placeholder="Search applicants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ mb: 3, bgcolor: 'background.paper' }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Stack spacing={2}>
                        {filteredUsers.map((user) => {
                            const isReviewed = user.membership?.reviewStatus === 'reviewed';
                            const date = user.membership?.applicationDate ? new Date(user.membership.applicationDate).toLocaleDateString() : 'N/A';
                            
                            return (
                                <Card key={user.userID} elevation={2}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {user.firstName} {user.lastName}
                                                    </Typography>
                                                    <Chip 
                                                        icon={isReviewed ? <CheckCircleIcon /> : <PendingIcon />}
                                                        label={isReviewed ? "Reviewed" : "Needs Review"}
                                                        color={isReviewed ? "success" : "warning"}
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ mt: 0.5, height: 24 }}
                                                    />
                                                </Box>
                                            </Box>
                                            <IconButton onClick={() => handleReviewClick(user)} color="primary">
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Box>

                                        <Stack spacing={1}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                                <EmailIcon fontSize="small" />
                                                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                                    {user.email}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                                <CalendarTodayIcon fontSize="small" />
                                                <Typography variant="body2">
                                                    Applied: {date}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            );
                        })}
                        {filteredUsers.length === 0 && (
                            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                                No applicants found matching your search.
                            </Typography>
                        )}
                    </Stack>
                </Box>
            ) : (
                <Paper sx={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={users}
                        columns={columns}
                        getRowId={(row) => row.userID}
                        slots={{ toolbar: GridToolbar }}
                        slotProps={{
                            toolbar: {
                                showQuickFilter: true,
                            },
                        }}
                        disableRowSelectionOnClick
                    />
                </Paper>
            )}
            
            <ReviewDialog 
                open={dialogOpen} 
                onClose={() => setDialogOpen(false)} 
                user={selectedUser}
                onReview={handleToggleReviewStatus}
            />
        </Container>
    );
}
