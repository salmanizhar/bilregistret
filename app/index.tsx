import React from 'react';
import { Redirect } from 'expo-router';

export default function Index() {
    // 🚀 INSTANT REDIRECT - No auth loading check
    // Auth will be handled non-blocking in the background
    return <Redirect href="/(main)" />;
}