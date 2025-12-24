"use client";
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ReviewDialog from '../../components/admin/ReviewDialog';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function OnboardingReviewsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

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
        <Box sx={{ height: '100%', width: '100%' }}>
            <Typography variant="h4" gutterBottom>Onboarding Reviews</Typography>
            <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={users}
                    columns={columns}
                    getRowId={(row) => row.userID}
                    slots={{ toolbar: GridToolbar }}
                    disableRowSelectionOnClick
                />
            </Paper>
            
            <ReviewDialog 
                open={dialogOpen} 
                onClose={() => setDialogOpen(false)} 
                user={selectedUser}
                onReview={handleToggleReviewStatus}
            />
        </Box>
    );
}
