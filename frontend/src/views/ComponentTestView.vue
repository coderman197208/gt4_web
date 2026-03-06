<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { IndicatorLight } from '@/components/ui/indicator-light';
import { Tube } from '@/components/ui/tube';
import { SelectSwitch } from '@/components/ui/select-switch';
import { ConveyorRoller } from '@/components/ui/conveyor-roller';
import { TubeBasket } from '@/components/ui/tube-basket';

// 所有组件共用的7种颜色
const COLORS = ['green', 'red', 'amber', 'blue', 'orange', 'cyan', 'white'] as const;

// 每个组件区域的独立 active 状态
const indicatorLightActive = ref(true);
const tubeActive = ref(true);
const selectSwitchActive = ref(true);
const conveyorRollerActive = ref(true);
const tubeBasketActive = ref(true);
</script>

<template>
  <div class="h-full overflow-y-auto space-y-6 pb-8">
    <!-- 页面标题 -->
    <h1 class="text-2xl font-bold">HMI 组件测试</h1>
    <p class="text-muted-foreground text-sm">
      以下展示所有自定义 HMI 组件的各种属性变体。点击每个区域右上角的按钮切换 active 状态。
    </p>

    <!-- ===== 1. IndicatorLight 指示灯 ===== -->
    <Card>
      <CardHeader>
        <CardTitle>1. IndicatorLight 指示灯</CardTitle>
        <CardAction>
          <Button
            :variant="indicatorLightActive ? 'default' : 'outline'"
            size="sm"
            @click="indicatorLightActive = !indicatorLightActive"
          >
            {{ indicatorLightActive ? 'ON' : 'OFF' }}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- 1a. 颜色展示 -->
        <div>
          <h4 class="text-sm font-medium mb-3">颜色展示（圆形，默认尺寸 16px）</h4>
          <div class="flex items-center gap-4">
            <div v-for="c in COLORS" :key="c" class="flex flex-col items-center gap-1">
              <IndicatorLight :active="indicatorLightActive" :color="c" />
              <span class="text-xs text-muted-foreground">{{ c }}</span>
            </div>
          </div>
        </div>

        <Separator />

        <!-- 1b. 形状变体 -->
        <div>
          <h4 class="text-sm font-medium mb-3">形状变体</h4>
          <div class="flex items-center gap-6">
            <div class="flex flex-col items-center gap-1">
              <IndicatorLight :active="indicatorLightActive" shape="circle" :size="24" />
              <span class="text-xs text-muted-foreground">circle</span>
            </div>
            <div class="flex flex-col items-center gap-1">
              <IndicatorLight :active="indicatorLightActive" shape="square" :size="24" />
              <span class="text-xs text-muted-foreground">square</span>
            </div>
          </div>
        </div>

        <Separator />

        <!-- 1c. 发光效果 -->
        <div>
          <h4 class="text-sm font-medium mb-3">发光效果（glow，仅 active=true 时可见）</h4>
          <div class="flex items-center gap-4">
            <div v-for="c in COLORS" :key="c" class="flex flex-col items-center gap-1">
              <IndicatorLight :active="indicatorLightActive" :color="c" :glow="true" :size="20" />
              <span class="text-xs text-muted-foreground">{{ c }}</span>
            </div>
          </div>
        </div>

        <Separator />

        <!-- 1d. 尺寸变体 -->
        <div>
          <h4 class="text-sm font-medium mb-3">尺寸变体</h4>
          <div class="flex items-end gap-4">
            <div
              v-for="s in [8, 12, 16, 24, 32, 48]"
              :key="s"
              class="flex flex-col items-center gap-1"
            >
              <IndicatorLight :active="indicatorLightActive" color="green" :size="s" />
              <span class="text-xs text-muted-foreground">{{ s }}px</span>
            </div>
          </div>
        </div>

        <Separator />

        <!-- 1e. offColor 变体 -->
        <div>
          <h4 class="text-sm font-medium mb-3">关灯颜色（offColor，切换为 OFF 查看效果）</h4>
          <div class="flex items-center gap-4">
            <div
              v-for="c in [...COLORS, 'gray'] as const"
              :key="c"
              class="flex flex-col items-center gap-1"
            >
              <IndicatorLight :active="indicatorLightActive" :off-color="c" :size="20" />
              <span class="text-xs text-muted-foreground">{{ c }}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- ===== 2. Tube 管子 ===== -->
    <Card>
      <CardHeader>
        <CardTitle>2. Tube 管子</CardTitle>
        <CardAction>
          <Button
            :variant="tubeActive ? 'default' : 'outline'"
            size="sm"
            @click="tubeActive = !tubeActive"
          >
            {{ tubeActive ? 'ON' : 'OFF' }}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- 2a. 颜色展示 -->
        <div>
          <h4 class="text-sm font-medium mb-3">颜色展示（默认尺寸 50px）</h4>
          <div class="flex items-center gap-4">
            <div v-for="c in COLORS" :key="c" class="flex flex-col items-center gap-1">
              <Tube :active="tubeActive" :color="c" />
              <span class="text-xs text-muted-foreground">{{ c }}</span>
            </div>
          </div>
        </div>

        <Separator />

        <!-- 2b. 尺寸变体 -->
        <div>
          <h4 class="text-sm font-medium mb-3">尺寸变体</h4>
          <div class="flex items-end gap-4">
            <div v-for="s in [30, 50, 70, 100]" :key="s" class="flex flex-col items-center gap-1">
              <Tube :active="tubeActive" color="green" :size="s" />
              <span class="text-xs text-muted-foreground">{{ s }}px</span>
            </div>
          </div>
        </div>

        <Separator />

        <!-- 2c. offColor 变体 -->
        <div>
          <h4 class="text-sm font-medium mb-3">关闭颜色（offColor，切换为 OFF 查看效果）</h4>
          <div class="flex items-center gap-4">
            <div
              v-for="c in [...COLORS, 'gray'] as const"
              :key="c"
              class="flex flex-col items-center gap-1"
            >
              <Tube :active="tubeActive" :off-color="c" />
              <span class="text-xs text-muted-foreground">{{ c }}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- ===== 3. SelectSwitch 选择开关 ===== -->
    <Card>
      <CardHeader>
        <CardTitle>3. SelectSwitch 选择开关</CardTitle>
        <CardAction>
          <Button
            :variant="selectSwitchActive ? 'default' : 'outline'"
            size="sm"
            @click="selectSwitchActive = !selectSwitchActive"
          >
            {{ selectSwitchActive ? 'ON' : 'OFF' }}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- 3a. 颜色展示 -->
        <div>
          <h4 class="text-sm font-medium mb-3">颜色展示（默认尺寸 48px）</h4>
          <div class="flex items-center gap-4">
            <div v-for="c in COLORS" :key="c" class="flex flex-col items-center gap-1">
              <SelectSwitch :active="selectSwitchActive" :color="c" />
              <span class="text-xs text-muted-foreground">{{ c }}</span>
            </div>
          </div>
        </div>

        <Separator />

        <!-- 3b. 尺寸变体 -->
        <div>
          <h4 class="text-sm font-medium mb-3">尺寸变体</h4>
          <div class="flex items-end gap-4">
            <div v-for="s in [32, 48, 64, 96]" :key="s" class="flex flex-col items-center gap-1">
              <SelectSwitch :active="selectSwitchActive" color="green" :size="s" />
              <span class="text-xs text-muted-foreground">{{ s }}px</span>
            </div>
          </div>
        </div>

        <Separator />

        <!-- 3c. offColor 变体 -->
        <div>
          <h4 class="text-sm font-medium mb-3">关闭颜色（offColor，切换为 OFF 查看效果）</h4>
          <div class="flex items-center gap-4">
            <div
              v-for="c in [...COLORS, 'gray'] as const"
              :key="c"
              class="flex flex-col items-center gap-1"
            >
              <SelectSwitch :active="selectSwitchActive" :off-color="c" />
              <span class="text-xs text-muted-foreground">{{ c }}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- ===== 4. ConveyorRoller 输送辊 ===== -->
    <Card>
      <CardHeader>
        <CardTitle>4. ConveyorRoller 输送辊</CardTitle>
        <CardAction>
          <Button
            :variant="conveyorRollerActive ? 'default' : 'outline'"
            size="sm"
            @click="conveyorRollerActive = !conveyorRollerActive"
          >
            {{ conveyorRollerActive ? 'ON' : 'OFF' }}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- 4a. 颜色展示 -->
        <div>
          <h4 class="text-sm font-medium mb-3">颜色展示（默认尺寸 50px 宽, 30px 高）</h4>
          <div class="flex items-center gap-4">
            <div v-for="c in COLORS" :key="c" class="flex flex-col items-center gap-1">
              <ConveyorRoller :active="conveyorRollerActive" :color="c" />
              <span class="text-xs text-muted-foreground">{{ c }}</span>
            </div>
          </div>
        </div>

        <Separator />

        <!-- 4b. 尺寸变体 -->
        <div>
          <h4 class="text-sm font-medium mb-3">尺寸变体（宽:高 = 5:3）</h4>
          <div class="flex items-end gap-4">
            <div v-for="s in [30, 50, 80, 120]" :key="s" class="flex flex-col items-center gap-1">
              <ConveyorRoller :active="conveyorRollerActive" color="green" :size="s" />
              <span class="text-xs text-muted-foreground">{{ s }}px</span>
            </div>
          </div>
        </div>

        <Separator />

        <!-- 4c. offColor 变体 -->
        <div>
          <h4 class="text-sm font-medium mb-3">关闭颜色（offColor，切换为 OFF 查看效果）</h4>
          <div class="flex items-center gap-4">
            <div
              v-for="c in [...COLORS, 'gray'] as const"
              :key="c"
              class="flex flex-col items-center gap-1"
            >
              <ConveyorRoller :active="conveyorRollerActive" :off-color="c" />
              <span class="text-xs text-muted-foreground">{{ c }}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- ===== 5. TubeBasket 管篮 ===== -->
    <Card>
      <CardHeader>
        <CardTitle>5. TubeBasket 管篮</CardTitle>
        <CardAction>
          <Button
            :variant="tubeBasketActive ? 'default' : 'outline'"
            size="sm"
            @click="tubeBasketActive = !tubeBasketActive"
          >
            {{ tubeBasketActive ? 'ON' : 'OFF' }}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- 5a. 颜色展示 -->
        <div>
          <h4 class="text-sm font-medium mb-3">
            颜色展示（默认 topWidth=40, bottomWidth=60, height=40）
          </h4>
          <div class="flex items-center gap-4">
            <div v-for="c in COLORS" :key="c" class="flex flex-col items-center gap-1">
              <TubeBasket :active="tubeBasketActive" :color="c" />
              <span class="text-xs text-muted-foreground">{{ c }}</span>
            </div>
          </div>
        </div>

        <Separator />

        <!-- 5b. 尺寸变体 -->
        <div>
          <h4 class="text-sm font-medium mb-3">
            尺寸变体（不同 topWidth / bottomWidth / height 组合）
          </h4>
          <div class="flex items-end gap-6">
            <div class="flex flex-col items-center gap-1">
              <TubeBasket
                :active="tubeBasketActive"
                color="green"
                :top-width="30"
                :bottom-width="50"
                :height="30"
              />
              <span class="text-xs text-muted-foreground">30/50/30</span>
            </div>
            <div class="flex flex-col items-center gap-1">
              <TubeBasket
                :active="tubeBasketActive"
                color="green"
                :top-width="40"
                :bottom-width="60"
                :height="40"
              />
              <span class="text-xs text-muted-foreground">40/60/40 (默认)</span>
            </div>
            <div class="flex flex-col items-center gap-1">
              <TubeBasket
                :active="tubeBasketActive"
                color="green"
                :top-width="50"
                :bottom-width="80"
                :height="50"
              />
              <span class="text-xs text-muted-foreground">50/80/50</span>
            </div>
            <div class="flex flex-col items-center gap-1">
              <TubeBasket
                :active="tubeBasketActive"
                color="green"
                :top-width="60"
                :bottom-width="60"
                :height="50"
              />
              <span class="text-xs text-muted-foreground">60/60/50 (矩形)</span>
            </div>
            <div class="flex flex-col items-center gap-1">
              <TubeBasket
                :active="tubeBasketActive"
                color="green"
                :top-width="70"
                :bottom-width="40"
                :height="50"
              />
              <span class="text-xs text-muted-foreground">70/40/50 (倒梯形)</span>
            </div>
          </div>
        </div>

        <Separator />

        <!-- 5c. offColor 变体 -->
        <div>
          <h4 class="text-sm font-medium mb-3">关闭颜色（offColor，切换为 OFF 查看效果）</h4>
          <div class="flex items-center gap-4">
            <div
              v-for="c in [...COLORS, 'gray'] as const"
              :key="c"
              class="flex flex-col items-center gap-1"
            >
              <TubeBasket :active="tubeBasketActive" :off-color="c" />
              <span class="text-xs text-muted-foreground">{{ c }}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
