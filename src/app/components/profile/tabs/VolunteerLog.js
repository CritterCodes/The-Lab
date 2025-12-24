"use client";
import React, { useState } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Button, 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, Chip, Alert 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export default function VolunteerLog({ user, onUpdate }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        hours: '',
        description: ''
    });

    const logs = user?.membership?.volunteerLog || [];
    
    // Sort logs by date desc
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

    const handleSubmit = async () => {
        if (!formData.hours || !formData.description) return;
        setLoading(true);

        try {
            const newLog = {
                id: crypto.randomUUID(),
                date: formData.date,
                hours: Number(formData.hours),
                description: formData.description,
                status: 'pending', // Default to pending
                verifiedBy: null
            };

            const updatedLogs = [newLog, ...logs];

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
                onUpdate(data.user);
                setOpen(false);
                setFormData({
                    date: new Date().toISOString().split('T')[0],
                    hours: '',
                    description: ''
                });
            }
        } catch (error) {
            console.error("Failed to log hours", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Volunteer Log</Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={() => setOpen(true)}
                    size="small"
                >
                    Log Hours
                </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Hours</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedLogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">No volunteer hours logged.</TableCell>
                            </TableRow>
                        ) : (
                            sortedLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{log.hours}</TableCell>
                                    <TableCell>{log.description}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={log.status || 'approved'} // Backwards compatibility
                                            color={
                                                log.status === 'pending' ? 'warning' : 
                                                log.status === 'rejected' ? 'error' : 'success'
                                            }
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Log Volunteer Hours</DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Hours must be approved by an admin.
                    </Alert>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Hours"
                            type="number"
                            value={formData.hours}
                            onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                            fullWidth
                            inputProps={{ min: 0.5, step: 0.5 }}
                        />
                        <TextField
                            label="Description"
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            fullWidth
                            placeholder="What did you work on?"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
