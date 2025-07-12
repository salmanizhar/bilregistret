import { API_ROUTES } from '../routes/api.routes';
import { makeAuthenticatedRequest } from '../utils/api.utils';

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featuredImage: string | null;
    authorId: string;
    status: string;
    viewCount: number;
    allowComments: boolean;
    tags: any[];
    categories: any[];
    metaTitle: string | null;
    metaDescription: string | null;
    publishedAt: string;
    createdAt: string;
    updatedAt: string;
    author: {
        id: string;
        name: string;
        customer_email: string;
    };
    commentCount: number;
}

export interface BlogsResponse {
    total: number;
    totalPages: number;
    currentPage: number;
    posts: BlogPost[];
}

// Blog Post Types
interface Author {
    id: string;
    name: string;
    customer_email: string;
    profile_picture: string | null;
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface Tag {
    id: string;
    name: string;
    slug: string;
}

interface Post {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featuredImage: string | null;
    authorId: string;
    status: "published" | "draft" | "archived";
    viewCount: number;
    allowComments: boolean;
    tags: any[]; // Empty array in the example
    categories: any[]; // Empty array in the example
    metaTitle: string | null;
    metaDescription: string | null;
    publishedAt: string;
    createdAt: string;
    updatedAt: string;
    author: Author;
    Categories: Category[];
    Tags: Tag[];
}

// Comment Types
interface Comment {
    id: string;
    postId: string;
    userId: string | null;
    parentId: string | null;
    authorName: string;
    authorEmail: string;
    content: string;
    status: "approved" | "pending" | "rejected";
    ipAddress: string;
    userAgent: string;
    createdAt: string;
    updatedAt: string;
    User: any | null; // Null in the example
    replies: Comment[]; // For nested comments
}

// Complete Response Type
export interface BlogPostResponse {
    post: Post;
    comments: Comment[];
}

export const blogService = {
    /**
     * Get a paginated list of blog posts
     * @param page The page number to fetch
     * @param limit The number of blog posts per page
     * @returns Promise with the blogs response
     */
    async getBlogs(page: number = 1, limit: number = 10): Promise<BlogsResponse> {
        try {
            const response = await makeAuthenticatedRequest(
                API_ROUTES.BLOGS.GET_BLOG_LISTS(limit, page),
                { method: 'GET' }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch blog posts');
            }

            return response.json();
        } catch (error) {
            // console.error('Error fetching blog posts:', error);
            throw error;
        }
    },

    /**
     * Get a single blog post by ID
     * @param id The ID of the blog post to fetch
     * @returns Promise with the blog post
     */
    async getBlogById(id: string): Promise<BlogPost> {
        try {
            const response = await makeAuthenticatedRequest(
                API_ROUTES.BLOGS.GET_BLOG_BY_SLUG(id),
                { method: 'GET' }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch blog post by ID');
            }

            return response.json();
        } catch (error) {
            // console.error('Error fetching blog post by ID:', error);
            throw error;
        }
    },

    /**
     * Get a single blog post by slug
     * @param slug The slug of the blog post to fetch
     * @returns Promise with the blog post
     */
    async getBlogBySlug(slug: string): Promise<BlogPostResponse> {
        try {
            const response = await makeAuthenticatedRequest(
                API_ROUTES.BLOGS.GET_BLOG_BY_SLUG(slug),
                { method: 'GET' }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch blog post');
            }

            return response.json();
        } catch (error) {
            // console.error('Error fetching blog post:', error);
            throw error;
        }
    }
};