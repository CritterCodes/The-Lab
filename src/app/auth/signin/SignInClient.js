"use client";
import React, { useState } from "react";
import { SignInPage } from "@toolpad/core/SignInPage";
import { Link, Snackbar, Alert, Box, Typography } from "@mui/material";
import { useSearchParams } from 'next/navigation';
import { signIn } from "next-auth/react";
import { AppProvider } from "@toolpad/core/AppProvider";
import theme from "../../../../theme";

const ForgotPasswordLink = () => (
    <Link href="/auth/forgot-password" underline="hover" sx={{ color: 'primary.main' }}>
        Forgot password?
    </Link>
);

const CreateAnAccount = () => {
    return (
        <Typography variant="body2" sx={{ color: 'primary.main' }}>
            Need an account? 
        <Link href="/auth/register" variant="body2">
            Sign up
        </Link>
        </Typography>
    );
}

const SignInClient = ({ providers }) => {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [error, setError] = useState("");

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };


    const Title = () => {
        return <h2 style={{ marginBottom: 8 }}>Login</h2>;
    }

    const handleSignIn = async (provider, formData) => {
        try {
            if (provider.id === 'credentials') {
                const response = await signIn("credentials", {
                    redirect: false,
                    identifier: formData.get('identifier'),
                    password: formData.get('password'),
                    callbackUrl
                });
                if (response.error) {
                    throw new Error(response.error);
                }
                window.location.href = response.url || callbackUrl;
                return response;
            } else {
                return signIn(provider.id, { callbackUrl });
            }
        } catch (error) {
            console.error("SignIn Error:", error);
            let errorMessage = error.message || "An unknown error occurred during sign-in.";
            // Map the generic NextAuth Credentials error to a detailed user-friendly message.
            if (errorMessage === "CredentialsSignin") {
                errorMessage =
                    "Invalid credentials. Please double-check your email/username and password.";
            }
            setError(errorMessage);
            setSnackbarOpen(true);
        }
    };

    return (
        <AppProvider theme={theme}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    backgroundColor: theme.palette.background.default,
                    color: theme.palette.text.primary,
                    padding: '2rem',
                }}
            >
                <Alert severity="warning" sx={{ mb: 3, maxWidth: '400px', width: '100%' }}>
                    <Typography variant="body2">
                        <strong>Notice:</strong> Inactive accounts without a paid membership have been removed. If you cannot sign in, please <Link href="/auth/register">create a new account</Link>.
                    </Typography>
                </Alert>

                <SignInPage
                    signIn={handleSignIn}
                    providers={providers}
                    slots={{ // change from 'components' back to 'slots'
                        title: Title,
                        forgotPasswordLink: ForgotPasswordLink,
                        signUpLink: CreateAnAccount
                    }}
                    slotProps={{
                        emailField: { autoFocus: true, type: 'text', label: 'Email or Username', name: 'identifier' }
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

export default SignInClient;
