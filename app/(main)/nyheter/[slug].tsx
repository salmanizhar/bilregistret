import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import BlogDetails from '../BlogDetails';

// This is a dynamic route wrapper that passes the slug parameter to the BlogDetails component
export default function BlogDetailsPage() {
    return <BlogDetails />;
}