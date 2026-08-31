import { onMounted, onUnmounted } from 'vue';
import { useWebSocket } from '@/services/websocket';

export function useAlarmRefresh(refresh: () => Promise<void>): { requestRefresh: () => void } {
  const { onAlarmChanged, offAlarmChanged, onConnected, offConnected } = useWebSocket();
  let running = false;
  let pending = false;
  let mounted = false;
  let intervalId: ReturnType<typeof setInterval> | undefined;
  let deferredRefreshId: ReturnType<typeof setTimeout> | undefined;

  async function runRefresh(): Promise<void> {
    if (!mounted) return;

    if (running) {
      pending = true;
      return;
    }

    running = true;
    pending = false;
    await refresh();
    if (pending) {
      pending = false;
      await refresh();
    }
    running = false;

    if (mounted && pending && !deferredRefreshId) {
      pending = false;
      deferredRefreshId = setTimeout(() => {
        deferredRefreshId = undefined;
        requestRefresh();
      }, 250);
    }
  }

  function requestRefresh(): void {
    void runRefresh();
  }

  function handleVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      requestRefresh();
    }
  }

  onMounted(() => {
    mounted = true;
    onAlarmChanged(requestRefresh);
    onConnected(requestRefresh);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        requestRefresh();
      }
    }, 30_000);
    requestRefresh();
  });

  onUnmounted(() => {
    mounted = false;
    offAlarmChanged(requestRefresh);
    offConnected(requestRefresh);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    if (intervalId) {
      clearInterval(intervalId);
    }
    if (deferredRefreshId) {
      clearTimeout(deferredRefreshId);
    }
  });

  return { requestRefresh };
}
