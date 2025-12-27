"use client";
import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Chip, IconButton, Tooltip, 
    Card, CardContent, Grid, Avatar, useTheme, useMediaQuery, 
    Container, TextField, InputAdornment, Stack, Button 
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CheckInLogPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const theme = useTheme();
    
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        } else if (status === 'authenticated') {
            if (session.user.role !== 'admin') {
                router.push('/dashboard');
            } else {
                fetchLogs();
            }
        }
    }, [status, session, router]);

    const fetchLogs = async () => {
        try {
            const response = await fetch('/api/v1/checkin?mode=log&limit=100');
            if (response.ok) {
                const data = await response.json();
                setLogs(data.logs || []);
            }
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { field: 'userName', headerName: 'User', flex: 1 },
        { 
            field: 'checkInTime', 
            headerName: 'Check In', 
            flex: 1,
            valueFormatter: (value) => value ? new Date(value).toLocaleString() : '-'
        },
        { 
            field: 'checkOutTime', 
            headerName: 'Check Out', 
            flex: 1,
            valueFormatter: (value) => value ? new Date(value).toLocaleString() : '-'
        },
        { 
            field: 'durationMinutes', 
            headerName: 'Duration (min)', 
            width: 150,
            valueFormatter: (value) => value || '-'
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => (
                <Chip 
                    label={params.value} 
                    color={params.value === 'active' ? 'success' : 'default'} 
                    size="small" 
                />
            )
        }
    ];

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <IconButton onClick={() => router.back()}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                    Check-In Log
                </Typography>
            </Stack>

            <Paper sx={{ height: 600, width: '100%', p: 2 }}>
                <DataGrid
                    rows={logs}
                    columns={columns}
                    getRowId={(row) => row.checkInID}
                    loading={loading}
                    components={{ Toolbar: GridToolbar }}
                    initialState={{
                        sorting: {
                            sortModel: [{ field: 'checkInTime', sort: 'desc' }],
                        },
                    }}
                />
            </Paper>
        </Container>
    );
}
