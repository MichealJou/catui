<template>
  <div class="demo-table-container">
    <CTable
      :columns="columns"
      :data="data"
      :stripe="true"
      :selectable="true"
      :selectable-type="'multiple'"
      :loading="loading"
      @cell-click="handleCellClick"
      @row-click="handleRowClick"
      @selection-change="handleSelectionChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CTable from '@catui/ctable'
import { getTableData, addTableRow, type MockDataItem } from '../api/mock'

const columns = [
  { key: 'id', title: 'ID', dataIndex: 'id', width: 80, align: 'center' },
  { key: 'name', title: '姓名', dataIndex: 'name' },
  { key: 'age', title: '年龄', dataIndex: 'age', width: 100, align: 'center' },
  { key: 'address', title: '地址', dataIndex: 'address' },
  { key: 'email', title: '邮箱', dataIndex: 'email' },
  { key: 'role', title: '角色', dataIndex: 'role', width: 120, align: 'center' },
  { key: 'status', title: '状态', dataIndex: 'status', width: 100, align: 'center' }
]

const data = ref<MockDataItem[]>([])
const loading = ref(false)
const selectedRows = ref<any[]>([])

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

onMounted(async () => {
  loading.value = true
  try {
    const initialData = await getTableData(10000)
    data.value = initialData
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.demo-table-container {
  width: 100%;
  height: 100%;
}
</style>
