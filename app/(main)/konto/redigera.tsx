import React from 'react';
import { Redirect } from 'expo-router';
import UserProfile from '@/app/(main)/UserProfile';
import { useAuth } from '@/Services/api/context/auth.context';

export default function EditProfile() {
    const { isAuthenticated } = useAuth();

    // Redirect to home if not authenticated
    if (!isAuthenticated) {
        return <Redirect href="/(main)" />;
    }

    return <UserProfile />;
} 