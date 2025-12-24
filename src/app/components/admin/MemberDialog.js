"use client";
import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, Box, Stepper, Step, StepLabel, StepContent,
    Checkbox, FormControlLabel, TextField, Select, MenuItem,
    InputLabel, FormControl, Chip, Divider, List, ListItem, ListItemText, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const steps = [
    { label: 'Account Created', key: 'createdAt' },
    { label: 'Application Submitted', key: 'applicationDate' },
    { label: 'Initial Contact / Reviewed', key: 'contacted' },
    { label: 'Onboarding', key: 'onboardingComplete' },
    { label: 'Probation (4 Hours)', key: 'probationComplete' },
    { label: 'Access Key Issued', key: 'accessKey' },
    { label: 'Full Access Granted', key: 'fullAccess' }
];

export default function MemberDialog({ open, onClose, user, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(null);
    const [newLog, setNewLog] = useState({ hours: '', description: '', date: new Date().toISOString().split('T')[0] });

    useEffect(() => {
        if (user) {
            setFormData({
                ...user,
                membership: {
                    status: 'registered',
                    volunteerLog: [],
                    accessKey: { issued: false, type: 'limited' },
                    ...user.membership
                }
            });
        }
    }, [user]);

    if (!user || !formData) return null;

    const handleMembershipChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            membership: {
                ...prev.membership,
                [field]: value
            }
        }));
    };

    const getStepStatus = (step, index) => {
        const m = formData.membership;
        if (step.key === 'createdAt') return true;
        if (step.key === 'applicationDate') return !!m.applicationDate;
        if (step.key === 'contacted') return !!m.contacted || m.reviewStatus === 'reviewed';
        if (step.key === 'onboardingComplete') return !!m.onboardingComplete;
        if (step.key === 'probationComplete') return totalHours >= 4;
        if (step.key === 'accessKey') return !!m.accessKey?.issued;
        if (step.key === 'fullAccess') return m.status === 'active';
        return false;
    };

    const handleAddLog = () => {
        if (!newLog.hours || !newLog.description) return;
        
        const log = {
            id: crypto.randomUUID(),
            date: newLog.date,
            hours: Number(newLog.hours),
            description: newLog.description,
            verifiedBy: 'Admin' // In a real app, use session user
        };

        setFormData(prev => ({
            ...prev,
            membership: {
                ...prev.membership,
                volunteerLog: [log, ...(prev.membership.volunteerLog || [])]
            }
        }));
        setNewLog({ hours: '', description: '', date: new Date().toISOString().split('T')[0] });
    };

    const handleDeleteLog = (logId) => {
        setFormData(prev => ({
            ...prev,
            membership: {
                ...prev.membership,
                volunteerLog: prev.membership.volunteerLog.filter(l => l.id !== logId)
            }
        }));
    };

    const totalHours = (formData.membership.volunteerLog || []).reduce((acc, log) => acc + log.hours, 0);
    const currentMonthHours = (formData.membership.volunteerLog || [])
        .filter(log => new Date(log.date).getMonth() === new Date().getMonth())
        .reduce((acc, log) => acc + log.hours, 0);

    const handleAccessKeyChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            membership: {
                ...prev.membership,
                accessKey: {
                    ...prev.membership.accessKey,
                    [field]: value
                }
            }
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/users?userID=${user.userID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    membership: formData.membership,
                    role: formData.role,
                    boardPosition: formData.boardPosition
                })
            });

            if (!response.ok) throw new Error('Failed to update user');
            
            const updatedUser = await response.json();
            onUpdate(updatedUser.user);
            onClose();
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to update user");
        } finally {
            setLoading(false);
        }
    };

    const activeStep = (() => {
        const m = formData.membership;
        if (!m.applicationDate) return 1;
        if (!m.contacted) return 2;
        if (!m.onboardingComplete) return 3;
        
        // Check subscription status (ACTIVE from Square or manually set status or waived or valid sponsorship)
        const isSponsorshipValid = m.sponsorshipExpiresAt && new Date(m.sponsorshipExpiresAt) > new Date();
        const isSubscribed = m.subscriptionStatus === 'ACTIVE' || m.isWaived || isSponsorshipValid;
        if (!isSubscribed && m.status !== 'active' && m.status !== 'probation') return 4; // Subscription
        
        // Profile Completion (Public or Private)
        if (!formData.profileCompleted && !formData.isPublic) return 5; // Public Profile
        
        if (totalHours < 4) return 6; // Volunteer Hours
        if (!m.accessKey?.issued) return 7; // Key
        if (m.status !== 'active') return 8; // Full Access
        return 9;
    })();

    const canAssignKey = (() => {
        const m = formData.membership;
        const isSponsorshipValid = m.sponsorshipExpiresAt && new Date(m.sponsorshipExpiresAt) > new Date();
        const isPaidMember = m.status === 'active' || m.status === 'probation' || m.subscriptionStatus === 'ACTIVE' || m.isWaived || isSponsorshipValid;
        const hasHours = totalHours >= 4;
        const notSuspended = m.status !== 'suspended';
        return isPaidMember && hasHours && notSuspended;
    })();

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>Manage Member: {user.firstName} {user.lastName}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, mt: 1 }}>
                    <Chip label={formData.role} color={formData.role === 'admin' ? 'secondary' : 'default'} />
                    <Chip label={formData.membership.status} color="primary" variant="outlined" />
                    <Chip label={`Total Hours: ${totalHours}`} variant="outlined" />
                    <Chip label={`This Month: ${currentMonthHours}`} color={currentMonthHours >= 4 ? "success" : "warning"} variant="outlined" />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>Membership Progress</Typography>
                        <Stepper activeStep={activeStep} orientation="vertical">
                            <Step expanded>
                                <StepLabel>Account Created</StepLabel>
                                <StepContent>
                                    <Typography variant="body2" color="text.secondary">
                                        Date: {new Date(formData.createdAt).toLocaleDateString()}
                                    </Typography>
                                </StepContent>
                            </Step>

                            <Step expanded>
                                <StepLabel>Application Submitted</StepLabel>
                                <StepContent>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={!!formData.membership.applicationDate}
                                                onChange={(e) => handleMembershipChange('applicationDate', e.target.checked ? new Date().toISOString() : null)}
                                            />
                                        }
                                        label={formData.membership.applicationDate 
                                            ? `Submitted on ${new Date(formData.membership.applicationDate).toLocaleDateString()}`
                                            : "Mark Application as Submitted"}
                                    />
                                </StepContent>
                            </Step>

                            <Step expanded>
                                <StepLabel>Initial Contact / Reviewed</StepLabel>
                                <StepContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.membership.contacted}
                                                    onChange={(e) => handleMembershipChange('contacted', e.target.checked)}
                                                />
                                            }
                                            label="Member has been contacted"
                                        />
                                        {formData.membership.reviewStatus === 'reviewed' && (
                                            <Chip label="Reviewed" color="success" size="small" />
                                        )}
                                    </Box>
                                    {!formData.membership.contacted && (
                                        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            <Button 
                                                variant="outlined" 
                                                size="small" 
                                                href={`mailto:${formData.email}`}
                                                target="_blank"
                                            >
                                                Email
                                            </Button>
                                            {formData.phoneNumber && (
                                                <Button 
                                                    variant="outlined" 
                                                    size="small" 
                                                    href={`tel:${formData.phoneNumber}`}
                                                >
                                                    Call
                                                </Button>
                                            )}
                                            {formData.discordHandle && (
                                                <Button 
                                                    variant="outlined" 
                                                    size="small"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(formData.discordHandle);
                                                        alert(`Copied Discord Handle: ${formData.discordHandle}`);
                                                    }}
                                                >
                                                    Copy Discord
                                                </Button>
                                            )}
                                        </Box>
                                    )}
                                </StepContent>
                            </Step>

                            <Step expanded>
                                <StepLabel>Onboarding</StepLabel>
                                <StepContent>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={formData.membership.onboardingComplete}
                                                onChange={(e) => handleMembershipChange('onboardingComplete', e.target.checked)}
                                            />
                                        }
                                        label="Paperwork & Orientation Complete"
                                    />
                                </StepContent>
                            </Step>

                            <Step expanded>
                                <StepLabel>Membership Subscription</StepLabel>
                                <StepContent>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Typography variant="body2" color={
                                            ['active', 'probation'].includes(formData.membership.status) || formData.membership.subscriptionStatus === 'ACTIVE' || formData.membership.isWaived || (formData.membership.sponsorshipExpiresAt && new Date(formData.membership.sponsorshipExpiresAt) > new Date())
                                            ? "success.main" : "error.main"
                                        }>
                                            {['active', 'probation'].includes(formData.membership.status) || formData.membership.subscriptionStatus === 'ACTIVE'
                                                ? "✅ Subscription Active" 
                                                : formData.membership.isWaived 
                                                    ? "✅ Dues Waived (Admin)"
                                                    : (formData.membership.sponsorshipExpiresAt && new Date(formData.membership.sponsorshipExpiresAt) > new Date())
                                                        ? `✅ Sponsored until ${new Date(formData.membership.sponsorshipExpiresAt).toLocaleDateString()}`
                                                        : "❌ Pending Payment / Subscription"}
                                        </Typography>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.membership.isWaived || false}
                                                    onChange={(e) => handleMembershipChange('isWaived', e.target.checked)}
                                                />
                                            }
                                            label="Waive Membership Dues (Permanent)"
                                        />
                                    </Box>
                                </StepContent>
                            </Step>

                            <Step expanded>
                                <StepLabel>Complete Public Profile</StepLabel>
                                <StepContent>
                                    <Typography variant="body2" color={formData.profileCompleted || formData.isPublic ? "success.main" : "warning.main"}>
                                        {formData.profileCompleted || formData.isPublic
                                            ? `✅ Profile Setup Complete (${formData.isPublic ? "Public" : "Private"})` 
                                            : "⚠️ Profile Setup Incomplete"}
                                    </Typography>
                                </StepContent>
                            </Step>

                            <Step expanded>
                                <StepLabel>First Month Volunteer Requirement</StepLabel>
                                <StepContent>
                                    <Typography variant="body2" gutterBottom>
                                        {totalHours >= 4 ? "✅ Requirement Met" : `⚠️ ${4 - totalHours} hours remaining for probation`}
                                    </Typography>
                                </StepContent>
                            </Step>

                            <Step expanded>
                                <StepLabel>Access Key Issued</StepLabel>
                                <StepContent>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={formData.membership.accessKey?.issued}
                                                        onChange={(e) => handleAccessKeyChange('issued', e.target.checked)}
                                                        disabled={!canAssignKey && !formData.membership.accessKey?.issued}
                                                    />
                                                }
                                                label="Key Issued"
                                            />
                                            <Button 
                                                variant="outlined" 
                                                size="small" 
                                                onClick={() => {
                                                    const newKey = Math.floor(100000 + Math.random() * 900000).toString();
                                                    handleAccessKeyChange('code', newKey);
                                                    handleAccessKeyChange('issued', true);
                                                }}
                                                disabled={!canAssignKey}
                                            >
                                                Generate Key
                                            </Button>
                                        </Box>
                                        
                                        {formData.membership.accessKey?.code && (
                                            <TextField
                                                label="Access Key Code"
                                                value={formData.membership.accessKey.code}
                                                size="small"
                                                fullWidth
                                                InputProps={{
                                                    readOnly: true,
                                                    endAdornment: (
                                                        <IconButton size="small" onClick={() => navigator.clipboard.writeText(formData.membership.accessKey.code)}>
                                                            <AddIcon sx={{ transform: 'rotate(45deg)' }} /> {/* Using AddIcon as copy icon for now or just text */}
                                                        </IconButton>
                                                    )
                                                }}
                                            />
                                        )}

                                        {!canAssignKey && !formData.membership.accessKey?.issued && (
                                            <Typography variant="caption" color="error">
                                                Cannot assign key: User must be active/probation, have 4+ volunteer hours, and not be suspended.
                                            </Typography>
                                        )}
                                        {formData.membership.accessKey?.issued && (
                                            <FormControl size="small" fullWidth>
                                                <InputLabel>Key Type</InputLabel>
                                                <Select
                                                    value={formData.membership.accessKey?.type || 'limited'}
                                                    label="Key Type"
                                                    onChange={(e) => handleAccessKeyChange('type', e.target.value)}
                                                >
                                                    <MenuItem value="limited">Limited (8am - 10pm)</MenuItem>
                                                    <MenuItem value="24h">24 Hour Access</MenuItem>
                                                </Select>
                                            </FormControl>
                                        )}
                                    </Box>
                                </StepContent>
                            </Step>
                        </Stepper>
                    </Box>

                    <Divider orientation="vertical" flexItem />

                    <Box sx={{ flex: 1.5 }}>
                        <Typography variant="h6" gutterBottom>Volunteer Logs</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-end' }}>
                            <TextField
                                label="Date"
                                type="date"
                                size="small"
                                value={newLog.date}
                                onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="Hours"
                                type="number"
                                size="small"
                                sx={{ width: 80 }}
                                value={newLog.hours}
                                onChange={(e) => setNewLog({ ...newLog, hours: e.target.value })}
                            />
                            <TextField
                                label="Description"
                                size="small"
                                fullWidth
                                value={newLog.description}
                                onChange={(e) => setNewLog({ ...newLog, description: e.target.value })}
                            />
                            <IconButton color="primary" onClick={handleAddLog}>
                                <AddIcon />
                            </IconButton>
                        </Box>

                        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Hours</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell align="right">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(formData.membership.volunteerLog || []).map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{log.hours}</TableCell>
                                            <TableCell>{log.description}</TableCell>
                                            <TableCell align="right">
                                                <IconButton size="small" color="error" onClick={() => handleDeleteLog(log.id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!formData.membership.volunteerLog || formData.membership.volunteerLog.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">No logs found</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" gutterBottom>Admin Actions</Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Role</InputLabel>
                                    <Select
                                        value={formData.role}
                                        label="Role"
                                        onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                    >
                                        <MenuItem value="user">User</MenuItem>
                                        <MenuItem value="admin">Admin</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel>Membership Status</InputLabel>
                                    <Select
                                        value={formData.membership.status}
                                        label="Membership Status"
                                        onChange={(e) => handleMembershipChange('status', e.target.value)}
                                    >
                                        <MenuItem value="registered">Registered</MenuItem>
                                        <MenuItem value="applicant">Applicant</MenuItem>
                                        <MenuItem value="onboarding">Onboarding</MenuItem>
                                        <MenuItem value="probation">Probation</MenuItem>
                                        <MenuItem value="active">Active Member</MenuItem>
                                        <MenuItem value="suspended">Suspended</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>

                            {formData.role === 'admin' && (
                                <TextField
                                    fullWidth
                                    label="Board Position / Title"
                                    value={formData.boardPosition || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, boardPosition: e.target.value }))}
                                    helperText="e.g. President, Treasurer, Shop Manager"
                                />
                            )}
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleSave} 
                    variant="contained" 
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
}
