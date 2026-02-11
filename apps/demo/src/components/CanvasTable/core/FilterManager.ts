export type FilterType =
  | 'equals'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'range'
  | 'list'

export interface FilterCondition {
  field: string
  type: FilterType
  value: any
  value2?: any // 用于范围筛选
  options?: any[] // 用于列表筛选
}

export class FilterManager {
  private filters: Map<string, FilterCondition> = new Map()

  /**
   * 设置筛选条件
   */
  setFilter(condition: FilterCondition) {
    if (
      condition.value === null ||
      condition.value === undefined ||
      condition.value === ''
    ) {
      this.filters.delete(condition.field)
    } else {
      this.filters.set(condition.field, condition)
    }
  }

  /**
   * 获取指定字段的筛选条件
   */
  getFilter(field: string): FilterCondition | undefined {
    return this.filters.get(field)
  }

  /**
   * 获取所有筛选条件
   */
  getAllFilters(): FilterCondition[] {
    return Array.from(this.filters.values())
  }

  /**
   * 清除指定字段的筛选
   */
  clearFilter(field: string) {
    this.filters.delete(field)
  }

  /**
   * 清除所有筛选
   */
  clearAll() {
    this.filters.clear()
  }

  /**
   * 对数据进行筛选
   */
  filterData<T extends Record<string, any>>(data: T[]): T[] {
    if (this.filters.size === 0) {
      return data
    }

    return data.filter(item => {
      for (const filter of this.filters.values()) {
        if (!this.matchFilter(item, filter)) {
          return false
        }
      }
      return true
    })
  }

  /**
   * 检查单个数据项是否匹配筛选条件
   */
  private matchFilter(
    item: Record<string, any>,
    filter: FilterCondition
  ): boolean {
    const { field, type, value, value2, options } = filter
    const itemValue = item[field]

    switch (type) {
      case 'equals':
        return itemValue == value

      case 'contains':
        return String(itemValue || '')
          .toLowerCase()
          .includes(String(value).toLowerCase())

      case 'startsWith':
        return String(itemValue || '')
          .toLowerCase()
          .startsWith(String(value).toLowerCase())

      case 'endsWith':
        return String(itemValue || '')
          .toLowerCase()
          .endsWith(String(value).toLowerCase())

      case 'greaterThan':
        return Number(itemValue) > Number(value)

      case 'lessThan':
        return Number(itemValue) < Number(value)

      case 'range':
        const numValue = Number(itemValue)
        const numStart = Number(value)
        const numEnd = Number(value2)
        return numValue >= numStart && numValue <= numEnd

      case 'list':
        if (!Array.isArray(options)) return false
        return options.includes(itemValue)

      default:
        return true
    }
  }

  /**
   * 获取唯一值列表（用于列表筛选）
   */
  getUniqueValues<T extends Record<string, any>>(
    data: T[],
    field: string
  ): any[] {
    const values = new Set<any>()
    data.forEach(item => {
      const value = item[field]
      if (value !== null && value !== undefined) {
        values.add(value)
      }
    })
    return Array.from(values).sort()
  }

  /**
   * 检查是否有激活的筛选
   */
  hasActiveFilters(): boolean {
    return this.filters.size > 0
  }

  /**
   * 获取筛选条件的数量
   */
  getFilterCount(): number {
    return this.filters.size
  }
}
