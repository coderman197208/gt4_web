<template>
  <div class="h-full flex items-center justify-center bg-background">
    <Card class="w-full max-w-md">
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold text-center">登录</CardTitle>
        <CardDescription class="text-center"> 输入您的账号信息以登录系统 </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <p v-if="errorMessage" class="text-sm text-destructive">
            {{ errorMessage }}
          </p>
          <div class="space-y-2">
            <Label for="username">用户名</Label>
            <Input
              id="username"
              v-model="formData.username"
              type="text"
              placeholder="请输入用户名"
              required
              autocomplete="username"
            />
          </div>
          <div class="space-y-2">
            <Label for="password">密码</Label>
            <Input
              id="password"
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
              required
              autocomplete="current-password"
            />
          </div>
          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="formData.rememberMe" type="checkbox" class="rounded border-input" />
              <span class="text-muted-foreground">记住我</span>
            </label>
            <a href="#" class="text-primary hover:underline"> 忘记密码？ </a>
          </div>
          <Button type="submit" class="w-full" :disabled="isLoading">
            <span v-if="isLoading">登录中...</span>
            <span v-else>登录</span>
          </Button>
        </form>
      </CardContent>
      <CardFooter class="flex flex-col space-y-4">
        <div class="relative w-full">
          <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t"></span>
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-card px-2 text-muted-foreground"> 或 </span>
          </div>
        </div>
        <div class="text-center text-sm text-muted-foreground">
          还没有账号？
          <a href="#" class="text-primary hover:underline font-medium"> 立即注册 </a>
        </div>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { login, saveAuthInfo } from '@/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWebSocket } from '@/services/websocket';
import { useAlarmCenterStore } from '@/stores/alarmCenter';

const router = useRouter();
const alarmCenterStore = useAlarmCenterStore();

const formData = reactive({
  username: '',
  password: '',
  rememberMe: false,
});

const isLoading = ref(false);
const errorMessage = ref('');

// LoginView不需要订阅WebSocket数据，在挂载时清空订阅
const { refreshAuth, subscribe } = useWebSocket();
onMounted(() => {
  subscribe([]);
  console.log('[LoginView] 已清空所有订阅');
});

const handleSubmit = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const result = await login({
      username: formData.username.trim(),
      password: formData.password,
    });

    saveAuthInfo(result.token, result.user);
    refreshAuth();
    await alarmCenterStore.initialize(true);

    // 登录成功后跳转到首页
    router.push('/');
  } catch (error) {
    console.error('登录失败:', error);
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'data' in error.response
    ) {
      const responseData = error.response.data as { message?: string };
      errorMessage.value = responseData.message ?? '登录失败，请检查用户名和密码';
    } else if (error instanceof Error) {
      errorMessage.value = error.message;
    } else {
      errorMessage.value = '登录失败，请稍后重试';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>
