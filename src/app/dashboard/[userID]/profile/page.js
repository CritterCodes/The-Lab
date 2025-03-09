"use client";
import React, { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Box, Typography, Button, Breadcrumbs, Link, Snackbar, useTheme } from '@mui/material';
import UserHeader from '@/app/components/profile/header';
import UserDetailsForm from '@/app/components/profile/details';
import UserImage from '@/app/components/profile/image';
import UsersService from '@/services/users';
import MembershipTab from '@/app/components/profile/tabs/membership';
import LoadingTerminal from '@/app/components/LoadingTerminal';

const ViewUserPage = ({ params }) => {
    const { data: session } = useSession();
    const resolvedParams = use(params);
    const searchParams = useSearchParams();
    const [userID, setUserID] = useState(resolvedParams?.userID);
    const [user, setUser] = useState(null);
    const [updatedUser, setUpdatedUser] = useState({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('info');
    const [hasChanges, setHasChanges] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(parseInt(searchParams.get('tab')) || 0);
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const theme = useTheme();

    const loadingSteps = [
        'Initializing...',
        'Loading user data...',
        'Fetching membership plans...',
        'Connecting to database...',
        'Retrieving session information...',
        'Finalizing setup...',
        'Almost there...'
    ];

    useEffect(() => {
        const fetchUser = async () => {
            if (userID) {
                try {
                    console.log("🔍 Fetching User Data for ID:", userID);
                    const query = {
                        property: 'userID',
                        value: userID
                    }
                    const fetchedUser = await UsersService.getUserByQuery(query);
                    console.log("✅ Fetched User Data:", fetchedUser);
                    setUser(fetchedUser);
                    setUpdatedUser(fetchedUser);
                    setLoading(false);
                } catch (error) {
                    console.error("❌ Failed to fetch user:", error);
                }
            }
        };

        fetchUser();
    }, [userID]);

    const handleTabChange = (event, newValue) => {
        console.log("🟡 Tab Changed:", newValue);
        setActiveTab(newValue);
    };

    const handleEditChange = (field, value) => {
        console.log(`✏️ Editing Field: ${field}, Value: ${value}`);
        setUpdatedUser(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
        setSnackbarMessage("⚠️ Unsaved changes detected! Please save.");
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
    };

    const handleSaveChanges = async () => {
        try {
            if (!userID) {
                console.error("❌ Missing User ID");
                setSnackbarMessage("❌ User ID is missing.");
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
                return;
            }

            setLoading(true);
            console.log("📦 Saving Updated User Data:", updatedUser);
            await UsersService.updateUser(userID, updatedUser);

            setSnackbarMessage("✅ User saved successfully!");
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            setHasChanges(false);
        } catch (error) {
            console.error("❌ Error Saving User:", error);
            setSnackbarMessage(`❌ Error saving user: ${error.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleNewRepair = (newRepair) => {
        console.log("🛠️ New Repair Added:", newRepair);
        setRepairs((prev) => [...prev, newRepair]);
    };

    if (loading) {
        console.log("⏳ Loading User Data...");
        return <LoadingTerminal steps={loadingSteps} />;
    }

    return (
        <Box sx={{ padding: { xs: '10px', sm: '20px' }, backgroundColor: theme.palette.background.default, color: theme.palette.text.primary }}>
            {/* Breadcrumbs */}
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, color: theme.palette.text.primary }}>
                <Link underline="hover" color="inherit" onClick={() => router.push('/dashboard')} sx={{ cursor: 'pointer', color: theme.palette.text.primary }}>
                    Dashboard
                </Link>
                <Typography sx={{ color: theme.palette.primary }}>Profile</Typography>
            </Breadcrumbs>

            {/* User Header with Tabs Integrated */}
            <UserHeader
                onSave={handleSaveChanges}
                hasChanges={hasChanges}
                user={updatedUser}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            {/* Tab Content Handling */}
            {/* User Details Tab */}
            {activeTab === 0 && (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mt: 3 }}>
                    <UserImage picture={session?.user?.image} />
                    <UserDetailsForm user={updatedUser} onEdit={handleEditChange} />
                </Box>
            )}
            {/* Membership Tab */}
            {activeTab === 1 && (
                <Box sx={{ mt: 3 }}>
                  <MembershipTab user={user} />
                </Box>
            )}
            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                ContentProps={{
                    sx: {
                        backgroundColor: snackbarSeverity === "success"
                            ? "green"
                            : snackbarSeverity === "error"
                                ? "red"
                                : "orange",
                        color: "white",
                        fontWeight: "bold"
                    }
                }}
                action={
                    hasChanges && snackbarSeverity === "warning" ? (
                        <Button color="inherit" size="small" onClick={handleSaveChanges}>
                            Save Now
                        </Button>
                    ) : (
                        <Button color="inherit" size="small" onClick={() => setSnackbarOpen(false)}>
                            Close
                        </Button>
                    )
                }
            />
        </Box>
    );
};

export default ViewUserPage;
