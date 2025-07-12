import React from 'react';
import { Redirect } from 'expo-router';
import PasswordAndSecurity from '@/app/(main)/PasswordAndSecurity';
import { useAuth } from '@/Services/api/context/auth.context';

export default function PasswordAndSecurityPage() {
    const { isAuthenticated } = useAuth();

    // Redirect to home if not authenticated
    if (!isAuthenticated) {
        return <Redirect href="/(main)" />;
    }

    return <PasswordAndSecurity />;
} 