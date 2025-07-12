import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { blogService, BlogsResponse, BlogPost, BlogPostResponse } from '../services/blog.service';
import { useApiMutation } from './api.hooks';
import { API_ROUTES } from '../routes/api.routes';

// Interface for comment submission
export interface PostCommentRequest {
    postId: string;
    authorName: string;
    authorEmail: string;
    content: string;
    parentId?: string; // Optional field for comment replies
}

export interface PostCommentResponse {
    id: string;
    postId: string;
    authorName: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    parentId?: string; // Optional field for replies
}

/**
 * Hook to post a new comment on a blog post
 * @returns A mutation function for posting comments
 */
export function usePostComment() {
    const queryClient = useQueryClient();

    const mutation = useApiMutation<PostCommentResponse, PostCommentRequest>(
        API_ROUTES.BLOGS.POST_COMMENT,
        'POST'
    );

    // Wrap the mutateAsync function to invalidate cache after successful mutation
    const enhancedMutate = async (variables: PostCommentRequest, options?: any) => {
        try {
            const result = await mutation.mutateAsync(variables, options);

            // Invalidate all blog queries to force a refetch
            queryClient.invalidateQueries({ queryKey: ['blog'] });

            return result;
        } catch (error) {
            throw error;
        }
    };

    return {
        ...mutation,
        mutateAsync: enhancedMutate
    };
}

/**
 * Hook to fetch blog posts with pagination
 * @param limit Number of posts per page
 * @returns A query result with blog posts and pagination info
 */
export function useBlogs(limit: number = 10) {
    return useQuery<BlogsResponse>({
        queryKey: ['blogs', limit],
        queryFn: () => blogService.getBlogs(1, limit),
    });
}

/**
 * Hook to fetch blog posts with infinite scrolling
 * @param limit Number of posts per page
 * @returns An infinite query result with blog posts for pagination
 */
export function useInfiniteBlogs(limit: number = 10) {
    return useInfiniteQuery<BlogsResponse>({
        queryKey: ['blogs', 'infinite', limit],
        queryFn: ({ pageParam }) => {
            // Ensure pageParam is a number
            const page = typeof pageParam === 'number' ? pageParam : 1;
            return blogService.getBlogs(page, limit);
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            // Return undefined if we've reached the last page
            if (lastPage.currentPage >= lastPage.totalPages) {
                return undefined;
            }
            return lastPage.currentPage + 1;
        },
        getPreviousPageParam: (firstPage) => {
            if (firstPage.currentPage <= 1) {
                return undefined;
            }
            return firstPage.currentPage - 1;
        },
    });
}

/**
 * Hook to fetch a single blog post by ID
 * @param id The ID of the blog post to fetch
 * @returns A query result with the blog post
 */
export function useBlog(id: string) {
    return useQuery<BlogPost>({
        queryKey: ['blog', id],
        queryFn: () => blogService.getBlogById(id),
        enabled: !!id, // Only run the query if we have an ID
    });
}

/**
 * Hook to fetch a single blog post by slug
 * @param slug The slug of the blog post to fetch
 * @returns A query result with the blog post and comments
 */
export function useBlogBySlug(slug: string) {
    return useQuery<BlogPostResponse>({
        queryKey: ['blog', 'slug', slug],
        queryFn: () => blogService.getBlogBySlug(slug),
        enabled: !!slug, // Only run the query if we have a slug
        staleTime: 0, // Consider data immediately stale to force refetch
        gcTime: 0, // Don't cache between page loads
        refetchOnWindowFocus: true, // Refetch when window focuses
    });
}