"use client";
import React, { useState } from "react";
import { SignInPage } from "@toolpad/core/SignInPage";
import { Link, Snackbar, Alert, Box, useTheme } from "@mui/material";
import { useSearchParams } from 'next/navigation';
import { providerMap } from "../../../../auth";
import { signIn } from "next-auth/react";
import { AppProvider } from "@toolpad/core/AppProvider";
import theme from "../../../../theme"; // Import the theme

const ForgotPasswordLink = () => {
    return (
        <Link href="/auth/forgot-password" underline="hover" sx={{ color: 'primary.main' }}>
            Forgot your password?
        </Link>
    );
};

const CreateAnAccount = () => {
    return (
        <Link href="/auth/register" underline="hover" sx={{ color: 'primary.main' }}>
            Need an account? sign up here
        </Link>
    );
}

const SignIn = () => {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
    const [error, setError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleSignIn = async (provider, formData) => {
        try {
            if (provider.id === 'credentials') {
                const response = await signIn("credentials", {
                    redirect: true,
                    email: formData.get('email'),
                    password: formData.get('password'),
                    callbackUrl
                });
                if (!response || response.error) {
                    throw new Error("Invalid credentials. Please try again.");
                }
                return response;
            } else {
                return signIn(provider.id, { callbackUrl });
            }
        } catch (error) {
            setError(error.message || "An error occurred during sign-in.");
            setSnackbarOpen(true);
        }
    };

    return (
        <AppProvider theme={theme}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    backgroundColor: theme.palette.background.default,
                    color: theme.palette.text.primary,
                    padding: '2rem',
                }}
            >
                <SignInPage
                    signIn={handleSignIn}
                    providers={providerMap}
                    slotProps={{
                        forgotPasswordLink: ForgotPasswordLink,
                        signUpLink: CreateAnAccount,
                        emailField: { autoFocus: true }
                    }}
                    sx={{
                        '& .MuiBox-root': {
                            padding: { xs: '10px', sm: '20px' },
                            backgroundColor: theme.palette.background.paper,
                            color: theme.palette.text.primary,
                            borderColor: theme.palette.primary.main,
                            borderRadius: '8px',
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.5)',
                            maxWidth: '400px',
                            width: '100%',
                        },
                        '& .MuiInputBase-root': {
                            color: theme.palette.text.primary,
                        },
                        '& .MuiInputLabel-root': {
                            color: theme.palette.text.primary,
                        },
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: theme.palette.primary.main,
                            },
                            '&:hover fieldset': {
                                borderColor: theme.palette.primary.main,
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: theme.palette.primary.main,
                            },
                        },
                        '& .MuiButton-root': {
                            color: theme.palette.primary.main,
                            borderColor: theme.palette.primary.main,
                            backgroundColor: theme.palette.background.default,
                            '&:hover': {
                                backgroundColor: theme.palette.primary.main,
                                color: theme.palette.background.default,
                            },
                        },
                        '& .MuiTypography-root': {
                            color: theme.palette.primary.main,
                        },
                    }}
                />

                {/* Snackbar for Error Handling */}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                >
                    <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
                        {error}
                    </Alert>
                </Snackbar>
            </Box>
        </AppProvider>
    );
};

export default SignIn;
