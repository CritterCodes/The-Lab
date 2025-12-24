"use client";
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip, IconButton, Tooltip, LinearProgress, Button } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import MemberDialog from '../../components/admin/MemberDialog';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function VolunteersPage() {
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

    const handleLogAction = async (user, logId, action) => {
        try {
            const updatedLogs = user.membership.volunteerLog.map(log => {
                if (log.id === logId) {
                    return {
                        ...log,
                        status: action === 'approve' ? 'approved' : 'rejected',
                        verifiedBy: session.user.firstName
                    };
                }
                return log;
            });

            const response = await fetch(`/api/v1/users?userID=${user.userID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    membership: {
                        ...user.membership,
                        volunteerLog: updatedLogs
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                handleUserUpdate(data.user);
            }
        } catch (error) {
            console.error("Failed to update log status", error);
        }
    };

    const getMonthlyHours = (user) => {
        const logs = user.membership?.volunteerLog || [];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return logs
            .filter(log => {
                const d = new Date(log.date);
                // Only count approved logs
                const isApproved = !log.status || log.status === 'approved';
                return isApproved && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .reduce((acc, log) => acc + (log.hours || 0), 0);
    };

    // Extract pending logs
    const pendingLogs = users.flatMap(user => 
        (user.membership?.volunteerLog || [])
            .filter(log => log.status === 'pending')
            .map(log => ({ ...log, user }))
    );

    const columns = [
        { 
            field: 'fullName', 
            headerName: 'Member', 
            flex: 1,
            valueGetter: (value, row) => `${row.firstName} ${row.lastName}`
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
            field: 'monthlyHours',
            headerName: 'Current Month',
            width: 130,
            valueGetter: (value, row) => getMonthlyHours(row),
            renderCell: (params) => {
                const hours = params.value;
                const target = 4;
                const progress = Math.min((hours / target) * 100, 100);
                const isComplete = hours >= target;
                
                return (
                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flex: 1 }}>
                            <LinearProgress 
                                variant="determinate" 
                                value={progress} 
                                color={isComplete ? "success" : "warning"}
                                sx={{ height: 8, borderRadius: 4 }}
                            />
                        </Box>
                        <Typography variant="caption" sx={{ minWidth: 35 }}>{hours}/{target}</Typography>
                    </Box>
                );
            }
        },
        {
            field: 'hoursNeeded',
            headerName: 'Needed',
            width: 100,
            valueGetter: (value, row) => {
                const hours = getMonthlyHours(row);
                return Math.max(0, 4 - hours);
            },
            renderCell: (params) => {
                return params.value > 0 ? (
                    <Typography color="error.main" fontWeight="bold">{params.value} hrs</Typography>
                ) : (
                    <CheckCircleIcon color="success" fontSize="small" />
                );
            }
        },
        {
            field: 'lastVolunteerDate',
            headerName: 'Last Active',
            width: 150,
            valueGetter: (value, row) => {
                const logs = row.membership?.volunteerLog || [];
                if (logs.length === 0) return null;
                // Sort by date desc
                const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
                return sorted[0].date;
            },
            renderCell: (params) => {
                if (!params.value) return <Typography variant="caption" color="text.secondary">Never</Typography>;
                return new Date(params.value).toLocaleDateString();
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            sortable: false,
            renderCell: (params) => (
                <Box>
                    <Tooltip title="Contact Member">
                        <IconButton 
                            size="small" 
                            href={`mailto:${params.row.email}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <EmailIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Manage Member">
                        <IconButton size="small" onClick={() => handleEditClick(params.row)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Volunteer Compliance</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Track monthly volunteer hours and manage member status. Requirement: 4 hours/month.
            </Typography>

            {pendingLogs.length > 0 && (
                <Paper sx={{ mb: 4, p: 2, border: '1px solid #ed6c02' }}>
                    <Typography variant="h6" color="warning.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningIcon /> Pending Approvals ({pendingLogs.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {pendingLogs.map((item) => (
                            <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                                <Box>
                                    <Typography variant="subtitle2">{item.user.firstName} {item.user.lastName}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.hours} hrs on {new Date(item.date).toLocaleDateString()} - "{item.description}"
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button 
                                        size="small" 
                                        variant="contained" 
                                        color="success" 
                                        startIcon={<CheckIcon />}
                                        onClick={() => handleLogAction(item.user, item.id, 'approve')}
                                    >
                                        Approve
                                    </Button>
                                    <Button 
                                        size="small" 
                                        variant="outlined" 
                                        color="error" 
                                        startIcon={<CloseIcon />}
                                        onClick={() => handleLogAction(item.user, item.id, 'reject')}
                                    >
                                        Reject
                                    </Button>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Paper>
            )}

            <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={users}
                    columns={columns}
                    getRowId={(row) => row.userID}
                    loading={loading}
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{
                        toolbar: {
                            showQuickFilter: true,
                        },
                    }}
                    initialState={{
                        sorting: {
                            sortModel: [{ field: 'hoursNeeded', sort: 'desc' }],
                        },
                        filter: {
                            filterModel: {
                                items: [
                                    { field: 'membershipStatus', operator: 'isAnyOf', value: ['active', 'probation'] }
                                ]
                            }
                        }
                    }}
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
