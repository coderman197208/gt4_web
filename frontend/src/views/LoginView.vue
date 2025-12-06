<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-4">
    <Card class="w-full max-w-md">
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold text-center">登录</CardTitle>
        <CardDescription class="text-center"> 输入您的账号信息以登录系统 </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="email">邮箱</Label>
            <Input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="请输入邮箱"
              required
              autocomplete="email"
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
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
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

const router = useRouter();

const formData = reactive({
  email: '',
  password: '',
  rememberMe: false,
});

const isLoading = ref(false);

const handleSubmit = async () => {
  isLoading.value = true;

  try {
    // TODO: 实现实际的登录逻辑
    // 示例：调用登录 API
    // await loginAPI(formData.email, formData.password);

    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('登录信息:', formData);

    // 登录成功后跳转到首页
    router.push('/');
  } catch (error) {
    console.error('登录失败:', error);
    // TODO: 显示错误提示
  } finally {
    isLoading.value = false;
  }
};
</script>
