<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import type { CSSProperties, HTMLAttributes } from 'vue';
import WinTableShell from '@/components/custom/WinTableShell.vue';
import { Table, TableHead, TableHeader, TableRow } from '@/components/ui/table';

defineOptions({
  inheritAttrs: false,
});

interface WinTableColumn {
  key?: string;
  label: string;
  width?: string;
  weight?: number;
  headClass?: HTMLAttributes['class'];
}

interface Props {
  columns: readonly WinTableColumn[];
  tableClass?: HTMLAttributes['class'];
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
  tableClass: 'table-fixed',
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

const attrs = useAttrs();

const unresolvedColumns = computed(() => props.columns.filter((column) => !column.width));

const totalWeight = computed(() =>
  unresolvedColumns.value.reduce((total, column) => total + (column.weight ?? 1), 0),
);

function getColumnWidth(column: WinTableColumn): string | undefined {
  if (column.width) {
    return column.width;
  }

  if (totalWeight.value <= 0) {
    return undefined;
  }

  return `${(((column.weight ?? 1) / totalWeight.value) * 100).toFixed(6)}%`;
}

function getColumnStyle(column: WinTableColumn): CSSProperties | undefined {
  const width = getColumnWidth(column);
  return width ? { width } : undefined;
}

function getColumnKey(column: WinTableColumn, index: number): string {
  return column.key ?? `${column.label}-${index}`;
}
</script>

<template>
  <WinTableShell
    v-bind="attrs"
    :striped="striped"
    :sticky-header="stickyHeader"
    :border-color="borderColor"
    :shell-background="shellBackground"
    :header-background="headerBackground"
    :header-text-color="headerTextColor"
    :cell-border-color="cellBorderColor"
    :cell-text-color="cellTextColor"
    :plain-row-background="plainRowBackground"
    :odd-row-background="oddRowBackground"
    :even-row-background="evenRowBackground"
    :selected-row-background="selectedRowBackground"
  >
    <Table :class="tableClass">
      <colgroup>
        <col
          v-for="(column, index) in columns"
          :key="getColumnKey(column, index)"
          :style="getColumnStyle(column)"
        />
      </colgroup>
      <TableHeader>
        <TableRow>
          <TableHead
            v-for="(column, index) in columns"
            :key="getColumnKey(column, index)"
            :class="column.headClass"
          >
            {{ column.label }}
          </TableHead>
        </TableRow>
      </TableHeader>
      <slot />
    </Table>
  </WinTableShell>
</template>
