import type { SorterConfig, SortOrder } from '../types'

export class SortManager {
  private sortConfigs: Map<string, SorterConfig> = new Map()

  /**
   * 设置排序配置
   */
  setSort(
    field: string,
    order: SortOrder,
    sorter?: (a: any, b: any) => number
  ) {
    if (order === null) {
      this.sortConfigs.delete(field)
    } else {
      this.sortConfigs.set(field, { field, order, sorter })
    }
  }

  /**
   * 获取指定字段的排序配置
   */
  getSort(field: string): SorterConfig | undefined {
    return this.sortConfigs.get(field)
  }

  /**
   * 获取指定字段的排序状态（仅返回排序顺序）
   */
  getSortState(field: string): SortOrder {
    const config = this.sortConfigs.get(field)
    return config?.order || null
  }

  /**
   * 获取所有排序配置
   */
  getAllSorts(): SorterConfig[] {
    return Array.from(this.sortConfigs.values())
  }

  /**
   * 清除所有排序
   */
  clearAll() {
    this.sortConfigs.clear()
  }

  /**
   * 对数据进行排序
   */
  sortData<T extends Record<string, any>>(data: T[]): T[] {
    if (this.sortConfigs.size === 0) {
      return data
    }

    const sorts = this.getAllSorts()

    // 创建数据副本以避免修改原数据
    const sortedData = [...data]

    sortedData.sort((a, b) => {
      for (const sortConfig of sorts) {
        const { field, order, sorter } = sortConfig

        let result = 0

        // 如果提供了自定义排序函数，使用自定义函数
        if (sorter) {
          result = sorter(a, b)
        } else {
          // 默认排序逻辑
          const aVal = a[field]
          const bVal = b[field]

          // 处理 null/undefined
          if (aVal == null && bVal == null) {
            result = 0
          } else if (aVal == null) {
            result = -1
          } else if (bVal == null) {
            result = 1
          } else {
            // 数字排序
            if (typeof aVal === 'number' && typeof bVal === 'number') {
              result = aVal - bVal
            }
            // 字符串排序
            else if (typeof aVal === 'string' && typeof bVal === 'string') {
              result = aVal.localeCompare(bVal, 'zh-CN')
            }
            // 日期排序
            else if (aVal instanceof Date && bVal instanceof Date) {
              result = aVal.getTime() - bVal.getTime()
            }
            // 其他类型尝试转换为字符串比较
            else {
              result = String(aVal).localeCompare(String(bVal), 'zh-CN')
            }
          }
        }

        // 根据排序方向调整结果
        if (result !== 0) {
          return order === 'asc' ? result : -result
        }
      }

      return 0
    })

    return sortedData
  }

  /**
   * 切换排序状态（null -> asc -> desc -> null）
   */
  toggleSort(field: string, sorter?: (a: any, b: any) => number): SortOrder {
    const current = this.getSort(field)
    let newOrder: SortOrder

    if (!current) {
      newOrder = 'asc'
    } else if (current.order === 'asc') {
      newOrder = 'desc'
    } else {
      newOrder = null
    }

    this.setSort(field, newOrder, sorter)
    return newOrder
  }
}
