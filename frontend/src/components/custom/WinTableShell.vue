<script setup lang="ts">
import { computed } from 'vue';
import type { CSSProperties } from 'vue';

interface Props {
  striped?: boolean;
  stickyHeader?: boolean;
  borderColor?: string;
  shellBackground?: string;
  headerBackground?: string;
  headerTextColor?: string;
  cellBorderColor?: string;
  cellTextColor?: string;
  plainRowBackground?: string;
  oddRowBackground?: string;
  evenRowBackground?: string;
  selectedRowBackground?: string;
}

const props = withDefaults(defineProps<Props>(), {
  striped: true,
  stickyHeader: true,
  borderColor: '#8a8a8a',
  shellBackground: '#c0c0c0',
  headerBackground: '#dcdcdc',
  headerTextColor: '#1d47a4',
  cellBorderColor: '#9d9d9d',
  cellTextColor: '#262626',
  plainRowBackground: '#ececec',
  oddRowBackground: '#ececec',
  evenRowBackground: '#d7d7d7',
  selectedRowBackground: '#9fc5ff',
});

const shellClass = computed(() => ({
  'win-table-shell': true,
  'win-table-shell--striped': props.striped,
  'win-table-shell--sticky-header': props.stickyHeader,
}));

const cssVars = computed<CSSProperties>(() => ({
  '--win-table-border-color': props.borderColor,
  '--win-table-shell-background': props.shellBackground,
  '--win-table-header-background': props.headerBackground,
  '--win-table-header-text-color': props.headerTextColor,
  '--win-table-cell-border-color': props.cellBorderColor,
  '--win-table-cell-text-color': props.cellTextColor,
  '--win-table-row-plain-background': props.plainRowBackground,
  '--win-table-row-odd-background': props.oddRowBackground,
  '--win-table-row-even-background': props.evenRowBackground,
  '--win-table-selected-row-background': props.selectedRowBackground,
}));
</script>

<template>
  <div :class="shellClass" :style="cssVars">
    <slot />
  </div>
</template>

<style scoped>
.win-table-shell {
  border: 1px solid var(--win-table-border-color);
  background: var(--win-table-shell-background);
}

.win-table-shell :deep(table) {
  width: 100%;
}

.win-table-shell :deep(th) {
  height: 30px;
  border-right: 1px solid var(--win-table-border-color);
  border-bottom: 1px solid var(--win-table-border-color);
  padding: 4px 8px;
  background: var(--win-table-header-background);
  color: var(--win-table-header-text-color);
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
}

.win-table-shell--sticky-header :deep(th) {
  position: sticky;
  top: 0;
  z-index: 1;
}

.win-table-shell :deep(td) {
  border-right: 1px solid var(--win-table-cell-border-color);
  border-bottom: 1px solid var(--win-table-cell-border-color);
  padding: 4px 8px;
  color: var(--win-table-cell-text-color);
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
}

.win-table-shell :deep(th:last-child),
.win-table-shell :deep(td:last-child) {
  border-right: 0;
}

.win-table-shell--striped :deep(tbody tr:nth-child(odd) td) {
  background: var(--win-table-row-odd-background);
}

.win-table-shell--striped :deep(tbody tr:nth-child(even) td) {
  background: var(--win-table-row-even-background);
}

.win-table-shell:not(.win-table-shell--striped) :deep(tbody td) {
  background: var(--win-table-row-plain-background);
}

.win-table-shell :deep(.win-table-row--selected td) {
  background: var(--win-table-selected-row-background) !important;
}
</style>
