import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, Box, CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

export default function NudgeConfirmDialog({ open, onClose, onConfirm, nudgeDetails, loading }) {
    if (!nudgeDetails) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Send Nudge Notification</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <Typography variant="subtitle1">
                        Recipient: <strong>{nudgeDetails.recipient}</strong>
                    </Typography>
                    
                    <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            Step: {nudgeDetails.step}
                        </Typography>
                        <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                            "{nudgeDetails.message}"
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Button variant="outlined" size="small" disabled>
                                {nudgeDetails.actionText}
                            </Button>
                            <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                                (Links to: {nudgeDetails.actionLink})
                            </Typography>
                        </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                        This will send an email notification to the user immediately.
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button 
                    onClick={onConfirm} 
                    variant="contained" 
                    endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    disabled={loading}
                >
                    Send Email
                </Button>
            </DialogActions>
        </Dialog>
    );
}
