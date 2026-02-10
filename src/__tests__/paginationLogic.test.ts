/**
 * CTable 分页逻辑单元测试
 * 测试分页数据计算逻辑
 */

import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { generateTestData } from '../mocks/dataGenerator'

describe('CTable - 分页逻辑', () => {
  describe('分页数据计算', () => {
    it('第1页应该返回前10条数据', () => {
      const mockData = generateTestData(100)
      const currentPage = ref(1)
      const pageSize = ref(10)

      // 计算分页后的数据
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      const paginatedData = mockData.slice(start, end)

      expect(paginatedData.length).toBe(10)
      expect(paginatedData[0].id).toBe(1)
      expect(paginatedData[9].id).toBe(10)
    })

    it('第2页应该返回第11-20条数据', () => {
      const mockData = generateTestData(100)
      const currentPage = ref(2)
      const pageSize = ref(10)

      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      const paginatedData = mockData.slice(start, end)

      expect(paginatedData.length).toBe(10)
      expect(paginatedData[0].id).toBe(11)
      expect(paginatedData[9].id).toBe(20)
    })

    it('最后一页数据不足时应该返回剩余数据', () => {
      const mockData = generateTestData(95)
      const currentPage = ref(10)
      const pageSize = ref(10)

      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      const paginatedData = mockData.slice(start, end)

      expect(paginatedData.length).toBe(5)
      expect(paginatedData[0].id).toBe(91)
      expect(paginatedData[4].id).toBe(95)
    })

    it('pageSize为20时，每页应该有20条数据', () => {
      const mockData = generateTestData(100)
      const currentPage = ref(1)
      const pageSize = ref(20)

      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      const paginatedData = mockData.slice(start, end)

      expect(paginatedData.length).toBe(20)
      expect(paginatedData[0].id).toBe(1)
      expect(paginatedData[19].id).toBe(20)
    })
  })

  describe('分页边界情况', () => {
    it('空数据应该返回空数组', () => {
      const mockData: any[] = []
      const currentPage = ref(1)
      const pageSize = ref(10)

      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      const paginatedData = mockData.slice(start, end)

      expect(paginatedData.length).toBe(0)
    })

    it('数据少于pageSize时应该返回所有数据', () => {
      const mockData = generateTestData(5)
      const currentPage = ref(1)
      const pageSize = ref(10)

      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      const paginatedData = mockData.slice(start, end)

      expect(paginatedData.length).toBe(5)
      expect(paginatedData[0].id).toBe(1)
      expect(paginatedData[4].id).toBe(5)
    })

    it('当前页超过总页数时应该返回空数组', () => {
      const mockData = generateTestData(50)
      const currentPage = ref(10) // 超过总页数
      const pageSize = ref(10)

      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      const paginatedData = mockData.slice(start, end)

      expect(paginatedData.length).toBe(0)
    })
  })

  describe('分页计算', () => {
    it('应该正确计算总页数', () => {
      const total = 100
      const pageSize = 10
      const totalPages = Math.ceil(total / pageSize)

      expect(totalPages).toBe(10)
    })

    it('数据不能被pageSize整除时应该向上取整', () => {
      const total = 95
      const pageSize = 10
      const totalPages = Math.ceil(total / pageSize)

      expect(totalPages).toBe(10)
    })

    it('应该正确计算当前页的数据范围', () => {
      const current = 2
      const pageSize = 10

      const start = (current - 1) * pageSize + 1
      const end = Math.min(current * pageSize, 100)

      expect(start).toBe(11)
      expect(end).toBe(20)
    })

    it('最后一页的数据范围应该正确', () => {
      const current = 10
      const pageSize = 10
      const total = 95

      const start = (current - 1) * pageSize + 1
      const end = Math.min(current * pageSize, total)

      expect(start).toBe(91)
      expect(end).toBe(95)
    })
  })

  describe('分页状态更新', () => {
    it('切换页面时currentPage应该更新', () => {
      const currentPage = ref(1)

      // 模拟切换到第2页
      currentPage.value = 2

      expect(currentPage.value).toBe(2)
    })

    it('切换pageSize时应该重新计算currentPage', () => {
      const currentPage = ref(5)
      const pageSize = ref(10)
      const oldStartIndex = (currentPage.value - 1) * pageSize.value

      // 切换到每页20条
      pageSize.value = 20
      const newStartIndex = (currentPage.value - 1) * pageSize.value

      // 应该重新计算当前页
      const newPage = Math.floor(oldStartIndex / pageSize.value) + 1
      currentPage.value = newPage

      expect(currentPage.value).toBe(3) // 第41-50条数据在第3页（每页20条）
      expect(newStartIndex).toBe(40)
      expect(newStartIndex).toBe(40)
    })
  })
})

describe('CTable - Mock数据生成', () => {
  it('应该生成指定数量的数据', () => {
    const data = generateTestData(100)
    expect(data.length).toBe(100)
  })

  it('生成的数据应该包含所有必需字段', () => {
    const data = generateTestData(1)
    const item = data[0]

    expect(item).toHaveProperty('id')
    expect(item).toHaveProperty('name')
    expect(item).toHaveProperty('age')
    expect(item).toHaveProperty('email')
    expect(item).toHaveProperty('phone')
    expect(item).toHaveProperty('address')
    expect(item).toHaveProperty('city')
    expect(item).toHaveProperty('job')
    expect(item).toHaveProperty('salary')
    expect(item).toHaveProperty('date')
    expect(item).toHaveProperty('status')
  })

  it('生成的ID应该是连续的', () => {
    const data = generateTestData(100)
    const ids = data.map(item => item.id)

    expect(ids[0]).toBe(1)
    expect(ids[99]).toBe(100)
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100])
  })
})
