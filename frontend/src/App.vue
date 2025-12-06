<template>
  <RouterView />
  <!-- <div>
    <Button as-child>
      <a href="https://www.google.com">Google</a>
    </Button>
  </div> -->
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useRouter } from 'vue-router';
// import { Button } from '@/components/ui/button'

const router = useRouter();
router.push('/login');
</script>
