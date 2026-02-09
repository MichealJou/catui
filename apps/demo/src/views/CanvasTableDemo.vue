<template>
  <div class="canvas-table-demo">
    <h1>Canvas Table Demo</h1>
    
    <div class="controls">
      <button @click="theme = 'default'">Default Theme</button>
      <button @click="theme = 'dark'">Dark Theme</button>
      <button @click="addRow">Add Row</button>
      <button @click="clearSelection">Clear Selection</button>
    </div>
    
    <div class="stats">
      <p>Total Rows: {{ data.length }}</p>
      <p>Selected Rows: {{ selectedRows.length }}</p>
    </div>
    
    <CanvasTable
      :columns="columns"
      :data="data"
      :width="1200"
      :height="600"
      :theme="currentTheme"
      :virtual-scroll="true"
      :selectable="true"
      :selectable-type="'multiple'"
      @cell-click="handleCellClick"
      @row-click="handleRowClick"
      @selection-change="handleSelectionChange"
      @scroll="handleScroll"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CanvasTable from '../components/CanvasTable/CanvasTable.vue'
import { DEFAULT_THEME, DARK_THEME } from '../components/CanvasTable/core/ThemeManager'

const columns = [
  { key: 'id', title: 'ID', dataIndex: 'id', width: 80, align: 'center' },
  { key: 'name', title: 'Name', dataIndex: 'name', width: 150 },
  { key: 'age', title: 'Age', dataIndex: 'age', width: 100, align: 'center' },
  { key: 'address', title: 'Address', dataIndex: 'address', width: 300 },
  { key: 'email', title: 'Email', dataIndex: 'email', width: 250 },
  { key: 'role', title: 'Role', dataIndex: 'role', width: 120 },
  { key: 'status', title: 'Status', dataIndex: 'status', width: 100 }
]

const data = ref<any[]>([])

for (let i = 1; i <= 1000; i++) {
  data.value.push({
    id: i,
    name: `User ${i}`,
    age: Math.floor(Math.random() * 50) + 20,
    address: `Address ${i}`,
    email: `user${i}@example.com`,
    role: ['Admin', 'User', 'Editor'][i % 3],
    status: ['Active', 'Inactive', 'Pending'][i % 3]
  })
}

const theme = ref<'default' | 'dark'>('default')
const selectedRows = ref<any[]>([])

const currentTheme = computed(() => {
  return theme.value === 'dark' ? DARK_THEME : DEFAULT_THEME
})

const handleCellClick = (event: any) => {
  console.log('Cell clicked:', event.cell, event.data)
}

const handleRowClick = (event: any) => {
  console.log('Row clicked:', event.row, event.data)
}

const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
  console.log('Selection changed:', selection)
}

const handleScroll = (event: any) => {
  console.log('Scroll event:', event)
}

const addRow = () => {
  const newRow = {
    id: data.value.length + 1,
    name: `User ${data.value.length + 1}`,
    age: Math.floor(Math.random() * 50) + 20,
    address: `Address ${data.value.length + 1}`,
    email: `user${data.value.length + 1}@example.com`,
    role: 'User',
    status: 'Active'
  }
  data.value.push(newRow)
}

const clearSelection = () => {
  selectedRows.value = []
}
</script>

<style scoped>
.canvas-table-demo {
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
  color: #333;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.controls button {
  padding: 8px 16px;
  background: #1677ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.controls button:hover {
  background: #0958d9;
}

.stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}

.stats p {
  margin: 0;
  font-size: 14px;
}
</style>
