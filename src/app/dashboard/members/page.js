"use client";
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip, IconButton, Tooltip } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import MemberDialog from '../../components/admin/MemberDialog';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function MembersPage() {
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
                router.push('/dashboard'); // Redirect non-admins
            } else {
                fetchUsers();
            }
        }
    }, [status, session, router]);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/v1/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setDialogOpen(true);
    };

    const handleUserUpdate = (updatedUser) => {
        setUsers(prev => prev.map(u => u.userID === updatedUser.userID ? updatedUser : u));
    };

    const columns = [
        { field: 'firstName', headerName: 'First Name', flex: 1 },
        { field: 'lastName', headerName: 'Last Name', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1.5 },
        { 
            field: 'role', 
            headerName: 'Role', 
            width: 100,
            renderCell: (params) => (
                <Chip 
                    label={params.value} 
                    color={params.value === 'admin' ? 'secondary' : 'default'} 
                    size="small" 
                />
            )
        },
        {
            field: 'membershipStatus',
            headerName: 'Status',
            width: 120,
            valueGetter: (value, row) => row.membership?.status || 'N/A',
            renderCell: (params) => {
                const status = params.value;
                let color = 'default';
                if (status === 'active') color = 'success';
                if (status === 'probation') color = 'warning';
                if (status === 'suspended') color = 'error';
                return <Chip label={status} color={color} size="small" variant="outlined" />;
            }
        },
        {
            field: 'volunteerHours',
            headerName: 'Hours (Total)',
            width: 120,
            valueGetter: (value, row) => {
                const logs = row.membership?.volunteerLog || [];
                return logs.reduce((acc, log) => acc + (log.hours || 0), 0);
            },
        },
        {
            field: 'currentMonthHours',
            headerName: 'Hours (Month)',
            width: 120,
            valueGetter: (value, row) => {
                const logs = row.membership?.volunteerLog || [];
                const currentMonth = new Date().getMonth();
                return logs
                    .filter(log => new Date(log.date).getMonth() === currentMonth)
                    .reduce((acc, log) => acc + (log.hours || 0), 0);
            },
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            sortable: false,
            renderCell: (params) => (
                <Tooltip title="Manage Member">
                    <IconButton onClick={() => handleEditClick(params.row)} color="primary">
                        <EditIcon />
                    </IconButton>
                </Tooltip>
            )
        }
    ];

    if (status === 'loading' || loading) {
        return <Typography>Loading...</Typography>;
    }

    if (session?.user?.role !== 'admin') {
        return <Typography color="error">Access Denied</Typography>;
    }

    return (
        <Box sx={{ height: '100%', width: '100%', p: 2 }}>
            <Typography variant="h4" gutterBottom>Member Management</Typography>
            <Paper sx={{ height: 'calc(100vh - 200px)', width: '100%' }}>
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

            <MemberDialog 
                open={dialogOpen} 
                onClose={() => setDialogOpen(false)} 
                user={selectedUser} 
                onUpdate={handleUserUpdate}
            />
        </Box>
    );
}
