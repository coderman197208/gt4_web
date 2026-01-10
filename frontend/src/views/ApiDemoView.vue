<template>
  <div class="api-demo-view p-6">
    <h1 class="text-3xl font-bold mb-6">API使用示例</h1>

    <!-- 健康检查 -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">1. 健康检查</h2>
      <Button 
        @click="testHealthCheck"
        class="mb-2"
      >
        测试健康检查
      </Button>
      <pre v-if="healthStatus" class="bg-gray-100 p-4 rounded">{{ healthStatus }}</pre>
    </section>

    <!-- 用户管理 -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">2. 用户管理</h2>
      <div class="space-x-2 mb-4">
        <Button 
          @click="testGetUsers"
          variant="default"
        >
          获取所有用户
        </Button>
        <Button 
          @click="testCreateUser"
          variant="outline"
        >
          创建用户
        </Button>
      </div>
      <div v-if="users.length > 0" class="bg-gray-100 p-4 rounded">
        <h3 class="font-semibold mb-2">用户列表 ({{ users.length }})</h3>
        <ul class="space-y-2">
          <li v-for="user in users" :key="user.id" class="border-b pb-2">
            <span class="font-medium">{{ user.username }}</span> 
            ({{ user.email }}) - 
            <span class="text-sm text-gray-600">{{ user.role }}</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- 文章管理 -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">3. 文章管理</h2>
      <div class="space-x-2 mb-4">
        <Button 
          @click="testGetPosts"
          variant="default"
        >
          获取所有文章
        </Button>
        <Button 
          @click="testGetPublishedPosts"
          variant="secondary"
        >
          获取已发布文章
        </Button>
        <Button 
          @click="testCreatePost"
          variant="outline"
        >
          创建文章
        </Button>
      </div>
      <div v-if="posts.length > 0" class="bg-gray-100 p-4 rounded">
        <h3 class="font-semibold mb-2">文章列表 ({{ posts.length }})</h3>
        <ul class="space-y-3">
          <li v-for="post in posts" :key="post.id" class="border-b pb-2">
            <div class="font-medium">{{ post.title }}</div>
            <div class="text-sm text-gray-600">{{ post.content.substring(0, 100) }}...</div>
            <div class="text-xs text-gray-500 mt-1">
              作者ID: {{ post.authorId }} | 
              状态: {{ post.published ? '已发布' : '草稿' }} | 
              创建时间: {{ new Date(post.createdAt).toLocaleString() }}
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- 评论管理 -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">4. 评论管理</h2>
      <div class="space-x-2 mb-4">
        <Button 
          @click="testGetComments"
          variant="default"
        >
          获取所有评论
        </Button>
        <Button 
          @click="testGetPostComments"
          variant="secondary"
        >
          获取文章1的评论
        </Button>
      </div>
      <div v-if="comments.length > 0" class="bg-gray-100 p-4 rounded">
        <h3 class="font-semibold mb-2">评论列表 ({{ comments.length }})</h3>
        <ul class="space-y-2">
          <li v-for="comment in comments" :key="comment.id" class="border-b pb-2">
            <div class="text-sm">{{ comment.content }}</div>
            <div class="text-xs text-gray-500">
              文章ID: {{ comment.postId }} | 用户ID: {{ comment.userId }}
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- 登录测试 -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">5. 登录测试</h2>
      <Button 
        @click="testLogin"
        variant="default"
        class="mb-2"
      >
        模拟登录
      </Button>
      <pre v-if="loginResult" class="bg-gray-100 p-4 rounded">{{ loginResult }}</pre>
    </section>

    <!-- 错误信息 -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <strong>错误：</strong> {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import {
  healthCheck,
  getUsers,
  createUser,
  getPosts,
  createPost,
  getComments,
  getPostComments,
  login,
  type User,
  type Post,
  type Comment,
} from '@/api';

const healthStatus = ref<any>(null);
const users = ref<User[]>([]);
const posts = ref<Post[]>([]);
const comments = ref<Comment[]>([]);
const loginResult = ref<any>(null);
const error = ref<string>('');

async function testHealthCheck() {
  try {
    error.value = '';
    const result = await healthCheck();
    healthStatus.value = result;
    console.log('健康检查结果:', result);
  } catch (err: any) {
    error.value = err.message || '健康检查失败';
    console.error('健康检查错误:', err);
  }
}

async function testGetUsers() {
  try {
    error.value = '';
    users.value = await getUsers();
    console.log('获取用户列表:', users.value);
  } catch (err: any) {
    error.value = err.message || '获取用户列表失败';
    console.error('获取用户错误:', err);
  }
}

async function testCreateUser() {
  try {
    error.value = '';
    const newUser = await createUser({
      username: `user_${Date.now()}`,
      email: `user${Date.now()}@example.com`,
      role: 'user',
    });
    console.log('创建用户成功:', newUser);
    // 重新获取用户列表
    await testGetUsers();
  } catch (err: any) {
    error.value = err.message || '创建用户失败';
    console.error('创建用户错误:', err);
  }
}

async function testGetPosts() {
  try {
    error.value = '';
    posts.value = await getPosts();
    console.log('获取文章列表:', posts.value);
  } catch (err: any) {
    error.value = err.message || '获取文章列表失败';
    console.error('获取文章错误:', err);
  }
}

async function testGetPublishedPosts() {
  try {
    error.value = '';
    posts.value = await getPosts({ published: true });
    console.log('获取已发布文章:', posts.value);
  } catch (err: any) {
    error.value = err.message || '获取已发布文章失败';
    console.error('获取已发布文章错误:', err);
  }
}

async function testCreatePost() {
  try {
    error.value = '';
    const newPost = await createPost({
      title: `测试文章 ${new Date().toLocaleString()}`,
      content: '这是一篇通过API创建的测试文章。',
      authorId: 1,
      published: true,
    });
    console.log('创建文章成功:', newPost);
    // 重新获取文章列表
    await testGetPosts();
  } catch (err: any) {
    error.value = err.message || '创建文章失败';
    console.error('创建文章错误:', err);
  }
}

async function testGetComments() {
  try {
    error.value = '';
    comments.value = await getComments();
    console.log('获取评论列表:', comments.value);
  } catch (err: any) {
    error.value = err.message || '获取评论列表失败';
    console.error('获取评论错误:', err);
  }
}

async function testGetPostComments() {
  try {
    error.value = '';
    comments.value = await getPostComments(1);
    console.log('获取文章1的评论:', comments.value);
  } catch (err: any) {
    error.value = err.message || '获取文章评论失败';
    console.error('获取文章评论错误:', err);
  }
}

async function testLogin() {
  try {
    error.value = '';
    const result = await login({
      username: 'admin',
      password: 'password123',
    });
    loginResult.value = result;
    console.log('登录结果:', result);
  } catch (err: any) {
    error.value = err.message || '登录失败';
    console.error('登录错误:', err);
  }
}
</script>

<style scoped>
.api-demo-view {
  max-width: 1200px;
  margin: 0 auto;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
