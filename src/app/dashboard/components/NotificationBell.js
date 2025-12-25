"use client";
import React, { useState, useEffect } from 'react';
import { 
    IconButton, Badge, Menu, MenuItem, Typography, Box, 
    List, ListItem, ListItemText, ListItemIcon, Divider, Button 
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CircleIcon from '@mui/icons-material/Circle';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function NotificationBell() {
    const { data: session } = useSession();
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const fetchNotifications = async () => {
        if (!session?.user?.userID) return;
        try {
            const res = await fetch(`/api/v1/notifications?userID=${session.user.userID}`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, [session]);

    const handleClick = (event) => {
        fetchNotifications(); // Fetch latest on click
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMarkRead = async (notification) => {
        if (notification.read) return;
        try {
            await fetch('/api/v1/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'markRead', 
                    notificationID: notification.notificationID,
                    userID: session.user.userID 
                })
            });
            // Optimistic update
            setNotifications(prev => prev.map(n => 
                n.notificationID === notification.notificationID ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    const handleNotificationClick = (notification) => {
        handleMarkRead(notification);
        if (notification.link) {
            router.push(notification.link);
            handleClose();
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await fetch('/api/v1/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'markAllRead', 
                    userID: session.user.userID 
                })
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error("Failed to mark all read", error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircleIcon color="success" fontSize="small" />;
            case 'warning': return <WarningIcon color="warning" fontSize="small" />;
            case 'error': return <ErrorIcon color="error" fontSize="small" />;
            default: return <InfoIcon color="info" fontSize="small" />;
        }
    };

    return (
        <>
            <IconButton color="inherit" onClick={handleClick}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: { width: 360, maxHeight: 480 }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Notifications</Typography>
                    {unreadCount > 0 && (
                        <Button size="small" onClick={handleMarkAllRead}>
                            Mark all read
                        </Button>
                    )}
                </Box>
                <Divider />
                <List sx={{ p: 0 }}>
                    {notifications.length === 0 ? (
                        <ListItem>
                            <ListItemText primary="No notifications" sx={{ textAlign: 'center', color: 'text.secondary' }} />
                        </ListItem>
                    ) : (
                        notifications.map((notification) => (
                            <React.Fragment key={notification.notificationID}>
                                <ListItem 
                                    button 
                                    onClick={() => handleNotificationClick(notification)}
                                    sx={{ 
                                        bgcolor: notification.read ? 'transparent' : 'action.hover',
                                        alignItems: 'flex-start'
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40, mt: 1 }}>
                                        {getIcon(notification.type)}
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                                                    {notification.title}
                                                </Typography>
                                                {!notification.read && <CircleIcon color="primary" sx={{ fontSize: 10 }} />}
                                            </Box>
                                        }
                                        secondary={
                                            <>
                                                <Typography variant="body2" color="text.primary" sx={{ display: 'block', my: 0.5 }}>
                                                    {notification.message}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </Typography>
                                            </>
                                        }
                                    />
                                </ListItem>
                                <Divider component="li" />
                            </React.Fragment>
                        ))
                    )}
                </List>
            </Menu>
        </>
    );
}
