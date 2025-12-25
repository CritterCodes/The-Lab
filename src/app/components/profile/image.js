import React from 'react';
import { Box, Avatar } from '@mui/material';

const UserImage = ({ picture }) => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar
                src={picture || '/default-avatar.png'}
                sx={{ width: { xs: 200, sm: 250, md: 350 }, height: { xs: 200, sm: 250, md: 350 } }}
            />
        </Box>
    );
};

export default UserImage;
