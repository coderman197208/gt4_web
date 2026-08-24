/**
 * Mock数据 - 在开发环境中使用
 */

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: string;
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
}

// Mock 用户数据
export const mockUsers: User[] = [
  { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' },
  { id: 2, username: 'user1', email: 'user1@example.com', role: 'user' },
  { id: 3, username: 'user2', email: 'user2@example.com', role: 'user' },
];

// Mock 文章数据
export const mockPosts: Post[] = [
  {
    id: 1,
    title: 'First Post',
    content: 'This is the first post content',
    authorId: 1,
    createdAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 2,
    title: 'Second Post',
    content: 'This is the second post content',
    authorId: 2,
    createdAt: '2026-01-21T11:30:00Z',
  },
  {
    id: 3,
    title: 'Third Post',
    content: 'This is the third post content',
    authorId: 1,
    createdAt: '2026-01-22T14:15:00Z',
  },
];

// Mock 评论数据
export const mockComments: Comment[] = [
  {
    id: 1,
    postId: 1,
    userId: 2,
    content: 'Great post!',
    createdAt: '2026-01-20T11:00:00Z',
  },
  {
    id: 2,
    postId: 1,
    userId: 3,
    content: 'Thanks for sharing',
    createdAt: '2026-01-20T12:00:00Z',
  },
  {
    id: 3,
    postId: 2,
    userId: 1,
    content: 'Interesting perspective',
    createdAt: '2026-01-21T13:00:00Z',
  },
];
