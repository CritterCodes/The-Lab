'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Container } from '@mui/material';
import LoadingTerminal from '../../components/LoadingTerminal';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const isRegistered = searchParams.get('registered');
    const [steps, setSteps] = useState([]);

    useEffect(() => {
        // If coming from registration without a token, show a static message
        if (!token && isRegistered) {
            setSteps([
                'A verification email has been sent to your inbox.',
                'Please click on the link in your email to verify your account.'
            ]);
            return;
        }
        if (!token) {
            setSteps(['Verification token is missing.']);
            return;
        }
        // Start the verification process
        setSteps(prev => [...prev, 'Retrieving token...']);
        // Give a short delay to simulate process
        setTimeout(() => {
            setSteps(prev => [...prev, 'Sending token to server...']);
            (async () => {
                try {
                    const res = await fetch(`/api/auth/verify-email?token=${token}`);
                    const data = await res.json();
                    if (res.ok) {
                        setSteps(prev => [...prev, 'Email verified successfully.']);
                    } else {
                        setSteps(prev => [...prev, data.error || 'Verification failed.']);
                    }
                } catch (error) {
                    setSteps(prev => [...prev, 'An error occurred during verification.']);
                }
            })();
        }, 1000);
    }, [token, isRegistered]);

    useEffect(() => {
        if (steps.length && steps[steps.length - 1] === 'Email verified successfully.') {
            setTimeout(() => {
                router.push('/auth/signin');
            }, 3000);
        }
    }, [steps, router]);

    return (
        <Container component="main" maxWidth="sm" sx={{ minHeight: '100vh', py: 4 }}>
            <LoadingTerminal steps={steps} />
        </Container>
    );
}
