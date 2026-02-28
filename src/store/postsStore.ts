import { create } from 'zustand';
import { neon } from '@neondatabase/serverless';

export interface Post {
  id: number;
  user_id: number;
  title: string;
  content: string;
  image_url: string | null;
  image_public_id: string | null;
  likes_count: number;
  comments_count: number;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  user_name?: string;
  user_niveau?: string;
  user_email?: string;
  isLiked?: boolean;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  user_name?: string;
  user_niveau?: string;
}

interface PostsState {
  posts: Post[];
  comments: { [postId: number]: Comment[] };
  isLoading: boolean;
  error: string | null;
  
  fetchPosts: (userId: number) => Promise<void>;
  fetchComments: (postId: number) => Promise<void>;
  createPost: (post: {
    user_id: number;
    title: string;
    content: string;
    image_url?: string | null;
    image_public_id?: string | null;
  }) => Promise<Post | null>;
  addComment: (postId: number, userId: number, content: string) => Promise<void>;
  deleteComment: (commentId: number, postId: number) => Promise<void>;
  toggleLike: (postId: number, userId: number) => Promise<void>;
  deletePost: (postId: number) => Promise<void>;
}

const DATABASE_URL = import.meta.env.VITE_URL;
const sql = neon(DATABASE_URL, { disableWarningInBrowsers: true });

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  comments: {},
  isLoading: false,
  error: null,

  fetchPosts: async (userId: number) => {
    set({ isLoading: true, error: null });
    try {
      const posts = await sql`
        SELECT 
          p.*,
          u.name as user_name,
          u.niveau as user_niveau,
          u.email as user_email,
          CASE WHEN pl.id IS NOT NULL THEN true ELSE false END as "isLiked"
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN post_likes pl ON p.id = pl.post_id AND pl.user_id = ${userId}
        ORDER BY p.created_at DESC
      `;
      
      set({ 
        posts: posts as Post[], 
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch posts', 
        isLoading: false 
      });
    }
  },

  fetchComments: async (postId: number) => {
    try {
      const comments = await sql`
        SELECT 
          c.*,
          u.name as user_name,
          u.niveau as user_niveau
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ${postId}
        ORDER BY c.created_at ASC
      `;
      
      set(state => ({
        comments: {
          ...state.comments,
          [postId]: comments as Comment[]
        }
      }));
    } catch (error: any) {
      console.error('Error fetching comments:', error);
    }
  },

  createPost: async (post) => {
    set({ isLoading: true, error: null });
    try {
      const result = await sql`
        INSERT INTO posts (
          user_id, title, content, image_url, image_public_id
        ) VALUES (
          ${post.user_id}, ${post.title}, ${post.content}, 
          ${post.image_url || null}, ${post.image_public_id || null}
        )
        RETURNING *
      `;
      
      const newPost = (result as any[])[0];
      
      // Fetch user details
      const userResult = await sql`
        SELECT name, niveau, email FROM users WHERE id = ${post.user_id}
      `;
      const user = (userResult as any[])[0];
      
      const postWithUser = {
        ...newPost,
        user_name: user.name,
        user_niveau: user.niveau,
        user_email: user.email,
        isLiked: false,
        likes_count: 0,
        comments_count: 0
      };
      
      set(state => ({
        posts: [postWithUser, ...state.posts],
        isLoading: false
      }));
      
      return postWithUser;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to create post', 
        isLoading: false 
      });
      return null;
    }
  },

  addComment: async (postId: number, userId: number, content: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await sql`
        INSERT INTO comments (post_id, user_id, content)
        VALUES (${postId}, ${userId}, ${content})
        RETURNING *
      `;
      
      const newComment = (result as any[])[0];
      
      // Fetch user details
      const userResult = await sql`
        SELECT name, niveau FROM users WHERE id = ${userId}
      `;
      const user = (userResult as any[])[0];
      
      const commentWithUser = {
        ...newComment,
        user_name: user.name,
        user_niveau: user.niveau
      };
      
      // Update comments for this post
      set(state => ({
        comments: {
          ...state.comments,
          [postId]: [...(state.comments[postId] || []), commentWithUser]
        },
        // Update comments count in posts
        posts: state.posts.map(p => 
          p.id === postId 
            ? { ...p, comments_count: p.comments_count + 1 } 
            : p
        ),
        isLoading: false
      }));
      
      // Fetch updated comments count
      await get().fetchComments(postId);
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to add comment', 
        isLoading: false 
      });
    }
  },

  deleteComment: async (commentId: number, postId: number) => {
    set({ isLoading: true, error: null });
    try {
      await sql`
        DELETE FROM comments WHERE id = ${commentId}
      `;
      
      set(state => ({
        comments: {
          ...state.comments,
          [postId]: (state.comments[postId] || []).filter(c => c.id !== commentId)
        },
        // Update comments count in posts
        posts: state.posts.map(p => 
          p.id === postId 
            ? { ...p, comments_count: Math.max(0, p.comments_count - 1) } 
            : p
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete comment', 
        isLoading: false 
      });
    }
  },

  toggleLike: async (postId: number, userId: number) => {
    try {
      const post = get().posts.find(p => p.id === postId);
      if (!post) return;

      if (post.isLiked) {
        // Unlike
        await sql`
          DELETE FROM post_likes 
          WHERE post_id = ${postId} AND user_id = ${userId}
        `;
        
        set(state => ({
          posts: state.posts.map(p => 
            p.id === postId 
              ? { ...p, isLiked: false, likes_count: Math.max(0, p.likes_count - 1) } 
              : p
          )
        }));
      } else {
        // Like
        await sql`
          INSERT INTO post_likes (post_id, user_id)
          VALUES (${postId}, ${userId})
        `;
        
        set(state => ({
          posts: state.posts.map(p => 
            p.id === postId 
              ? { ...p, isLiked: true, likes_count: p.likes_count + 1 } 
              : p
          )
        }));
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      set({ error: error.message || 'Failed to toggle like' });
    }
  },

  deletePost: async (postId: number) => {
    set({ isLoading: true, error: null });
    try {
      await sql`
        DELETE FROM posts WHERE id = ${postId}
      `;
      
      set(state => ({
        posts: state.posts.filter(p => p.id !== postId),
        // Also remove comments for this post
        comments: Object.fromEntries(
          Object.entries(state.comments).filter(([key]) => parseInt(key) !== postId)
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete post', 
        isLoading: false 
      });
    }
  }
}));