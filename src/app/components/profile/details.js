import React, { useEffect } from 'react';
import { Box, TextField, Grid, useTheme } from '@mui/material';

const roles = ["admin", "client", "wholesaler"];

const UserDetailsForm = ({ user, onEdit }) => {

    const theme = useTheme();

    useEffect(() => {
        console.log("User: ", user);
    }, [user]);

    return (
        <Box sx={{ flex: 1, padding: 3, backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}>
            {/* Grid layout for better spacing and structure */}
            <Grid container spacing={2}>

                {/* User Information Form */}
                <Grid item xs={12} sm={8}>
                    <Grid container spacing={2}>
                        {/* Name Fields */}
                        <Grid item xs={6}>
                            <TextField
                                label="First Name"
                                value={user.firstName || ''}
                                onChange={(e) => onEdit("firstName", e.target.value)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Last Name"
                                value={user.lastName || ''}
                                onChange={(e) => onEdit("lastName", e.target.value)}
                                fullWidth
                            />
                        </Grid>

                        {/* Username Field */}
                        <Grid item xs={12}>
                            <TextField
                                label="@"
                                value={user.username || ''}
                                onChange={(e) => onEdit("username", e.target.value)}
                                fullWidth
                            />
                        </Grid>

                        {/* Contact Information */}
                        <Grid item xs={6}>
                            <TextField
                                label="Email"
                                value={user.email || ''}
                                onChange={(e) => onEdit("email", e.target.value)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Phone Number"
                                value={user.phoneNumber || ''}
                                onChange={(e) => onEdit("phoneNumber", e.target.value)}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};

export default UserDetailsForm;
