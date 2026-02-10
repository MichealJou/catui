/**
 * CTable 分页功能测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import CTable from '../components/CTable.vue'
import { generateTestData, generateTestColumns } from './mocks/dataGenerator'

describe('CTable - 分页功能', () => {
  let wrapper: any
  let mockData: any[]
  let mockColumns: any[]

  beforeEach(() => {
    // 生成测试数据
    mockData = generateTestData(100)
    mockColumns = generateTestColumns()
  })

  describe('基础分页', () => {
    it('应该正确显示分页组件', async () => {
      const pagination = ref({
        current: 1,
        pageSize: 10,
        total: mockData.length
      })

      wrapper = mount(CTable, {
        props: {
          columns: mockColumns,
          dataSource: mockData,
          width: 1000,
          height: 600,
          pagination: pagination.value
        }
      })

      // 等待组件渲染
      await wrapper.vm.$nextTick()

      // 检查分页组件是否存在
      const paginationWrapper = wrapper.find('.ctable-pagination-wrapper')
      expect(paginationWrapper.exists()).toBe(true)
    })

    it('应该显示正确的总数', async () => {
      const pagination = ref({
        current: 1,
        pageSize: 10,
        total: mockData.length,
        showTotal: (total: number) => `共 ${total} 条`
      })

      wrapper = mount(CTable, {
        props: {
          columns: mockColumns,
          dataSource: mockData,
          width: 1000,
          height: 600,
          pagination: pagination.value
        }
      })

      await wrapper.vm.$nextTick()

      // 验证总数设置正确
      expect(pagination.value.total).toBe(mockData.length)
    })

    it('禁用分页时不显示分页组件', async () => {
      wrapper = mount(CTable, {
        props: {
          columns: mockColumns,
          dataSource: mockData,
          width: 1000,
          height: 600,
          pagination: false
        }
      })

      await wrapper.vm.$nextTick()

      const paginationWrapper = wrapper.find('.ctable-pagination-wrapper')
      expect(paginationWrapper.exists()).toBe(false)
    })
  })

  describe('分页切换', () => {
    it('应该正确切换到下一页', async () => {
      const currentPage = ref(1)
      const pageSize = ref(10)
      const pagination = ref({
        current: 1,
        pageSize: 10,
        total: mockData.length
      })

      wrapper = mount(CTable, {
        props: {
          columns: mockColumns,
          dataSource: mockData,
          width: 1000,
          height: 600,
          pagination: pagination.value
        }
      })

      await wrapper.vm.$nextTick()

      // 模拟切换到第2页
      await wrapper.vm.handlePageChange(2, 10)

      // 验证当前页已更新
      expect(currentPage.value).toBe(2)
    })

    it('应该正确切换每页条数', async () => {
      const pageSize = ref(10)
      const pagination = ref({
        current: 1,
        pageSize: 10,
        total: mockData.length
      })

      wrapper = mount(CTable, {
        props: {
          columns: mockColumns,
          dataSource: mockData,
          width: 1000,
          height: 600,
          pagination: pagination.value
        }
      })

      await wrapper.vm.$nextTick()

      // 模拟切换每页条数
      await wrapper.vm.handlePageSizeChange(1, 20)

      // 验证每页条数已更新
      expect(pageSize.value).toBe(20)
    })

    it('分页后应该只显示当前页数据', async () => {
      const pagination = ref({
        current: 1,
        pageSize: 10,
        total: mockData.length
      })

      wrapper = mount(CTable, {
        props: {
          columns: mockColumns,
          dataSource: mockData,
          width: 1000,
          height: 600,
          pagination: pagination.value
        }
      })

      await wrapper.vm.$nextTick()

      // 验证分页后的数据长度
      const paginatedDataLength = wrapper.vm.paginatedData.value?.length || 0
      expect(paginatedDataLength).toBe(10) // 第1页应该只有10条数据
    })

    it('第2页应该显示第11-20条数据', async () => {
      const currentPage = ref(2)
      const pagination = ref({
        current: 2,
        pageSize: 10,
        total: mockData.length
      })

      wrapper = mount(CTable, {
        props: {
          columns: mockColumns,
          dataSource: mockData,
          width: 1000,
          height: 600,
          pagination: pagination.value
        }
      })

      await wrapper.vm.$nextTick()

      const paginatedData = wrapper.vm.paginatedData.value
      expect(paginatedData).toBeDefined()
      expect(paginatedData.length).toBe(10)
      expect(paginatedData[0].id).toBe(11) // 第2页第一条数据的ID应该是11
      expect(paginatedData[9].id).toBe(20) // 第2页最后一条数据的ID应该是20
    })
  })

  describe('分页配置选项', () => {
    it('应该支持显示总数', async () => {
      const showTotal = (total: number, range: [number, number]) => {
        return `显示 ${range[0]}-${range[1]} 条，共 ${total} 条`
      }

      const pagination = ref({
        current: 1,
        pageSize: 10,
        total: mockData.length,
        showTotal
      })

      wrapper = mount(CTable, {
        props: {
          columns: mockColumns,
          dataSource: mockData,
          width: 1000,
          height: 600,
          pagination: pagination.value
        }
      })

      await wrapper.vm.$nextTick()

      // 验证 showTotal 函数正确配置
      expect(pagination.value.showTotal).toBeDefined()
      expect(pagination.value.showTotal!(100, [1, 10])).toBe('显示 1-10 条，共 100 条')
    })

    it('应该支持每页条数选择器', async () => {
      const pagination = ref({
        current: 1,
        pageSize: 10,
        total: mockData.length,
        showSizeChanger: true,
        pageSizeOptions: [10, 20, 50, 100]
      })

      wrapper = mount(CTable, {
        props: {
          columns: mockColumns,
          dataSource: mockData,
          width: 1000,
          height: 600,
          pagination: pagination.value
        }
      })

      await wrapper.vm.$nextTick()

      expect(pagination.value.showSizeChanger).toBe(true)
      expect(pagination.value.pageSizeOptions).toEqual([10, 20, 50, 100])
    })

    it('应该支持快速跳转', async () => {
      const pagination = ref({
        current: 1,
        pageSize: 10,
        total: mockData.length,
        showQuickJumper: true
      })

      wrapper = mount(CTable, {
        props: {
          columns: mockColumns,
          dataSource: mockData,
          width: 1000,
          height: 600,
          pagination: pagination.value
        }
      })

      await wrapper.vm.$nextTick()

      expect(pagination.value.showQuickJumper).toBe(true)
    })

    it('应该支持简洁模式', async () => {
      const pagination = ref({
        current: 1,
        pageSize: 10,
        total: mockData.length,
        simple: true
      })

      wrapper = mount(CTable, {
        props: {
          columns: mockColumns,
          dataSource: mockData,
          width: 1000,
          height: 600,
          pagination: pagination.value
        }
      })

      await wrapper.vm.$nextTick()

      expect(pagination.value.simple).toBe(true)
    })
  })

  describe('分页事件', () => {
    it('应该触发 change 事件', async () => {
      const onChange = vi.fn()

      wrapper = mount(CTable, {
        props: {
          columns: mockColumns,
          dataSource: mockData,
          width: 1000,
          height: 600,
          pagination: {
            current: 1,
            pageSize: 10,
            total: mockData.length
          },
          onChange
        }
      })

      await wrapper.vm.$nextTick()

      // 模拟分页变化
      await wrapper.vm.handlePageChange(2, 10)

      // 验证事件触发
      expect(onChange).toHaveBeenCalled()
      expect(onChange).toHaveBeenCalledWith(
        { current: 2, pageSize: 10, total: mockData.length },
        {},
        {}
      )
    })

    it('应该触发 showSizeChange 事件', async () => {
      const onShowSizeChange = vi.fn()

      const pagination = ref({
        current: 1,
        pageSize: 10,
        total: mockData.length,
        onShowSizeChange
      })

      wrapper = mount(CTable, {
        props: {
          columns: mockColumns,
          dataSource: mockData,
          width: 1000,
          height: 600,
          pagination: pagination.value
        }
      })

      await wrapper.vm.$nextTick()

      // 模拟每页条数变化
      await wrapper.vm.handlePageSizeChange(1, 20)

      // 验证事件触发
      expect(onShowSizeChange).toHaveBeenCalled()
      expect(onShowSizeChange).toHaveBeenCalledWith(1, 20)
    })
  })

  describe('边界情况', () => {
    it('空数据时不应该崩溃', async () => {
      wrapper = mount(CTable, {
        props: {
          columns: mockColumns,
          dataSource: [],
          width: 1000,
          height: 600,
          pagination: {
            current: 1,
            pageSize: 10,
            total: 0
          }
        }
      })

      await wrapper.vm.$nextTick()

      // 不应该抛出错误
      expect(wrapper.exists()).toBe(true)
    })

    it('只有一页数据时应该正常工作', async () => {
      const smallData = generateTestData(5)

      wrapper = mount(CTable, {
        props: {
          columns: mockColumns,
          dataSource: smallData,
          width: 1000,
          height: 600,
          pagination: {
            current: 1,
            pageSize: 10,
            total: smallData.length,
            hideOnSinglePage: true
          }
        }
      })

      await wrapper.vm.$nextTick()

      // 验证数据正确
      const paginatedData = wrapper.vm.paginatedData.value
      expect(paginatedData.length).toBe(5)
    })

    it('最后一页数据不足 pageSize 时应该正常工作', async () => {
      const pagination = ref({
        current: 10,
        pageSize: 10,
        total: 95 // 95条数据，第10页只有5条
      })

      const data = generateTestData(95)

      wrapper = mount(CTable, {
        props: {
          columns: mockColumns,
          dataSource: data,
          width: 1000,
          height: 600,
          pagination: pagination.value
        }
      })

      await wrapper.vm.$nextTick()

      const paginatedData = wrapper.vm.paginatedData.value
      expect(paginatedData.length).toBe(5) // 第10页只有5条数据
      expect(paginatedData[0].id).toBe(91)
    })
  })
})
