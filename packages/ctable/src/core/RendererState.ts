/**
 * RendererState - 渲染器状态管理基类
 *
 * 提供统一的状态管理，消除渲染器之间的重复代码
 * 所有渲染器（G2TableRenderer、G2TableRendererV2、CanvasRenderer）
 * 都应继承此基类来管理排序、筛选和选择状态
 */

import type { SortOrder } from '../types'

export class RendererState {
  // ========================================================================
  // 状态属性
  // ========================================================================

  /** 排序状态 - 字段名到排序方向的映射 */
  protected sortState: Map<string, SortOrder>

  /** 筛选状态 - 激活筛选的字段名集合 */
  protected filterState: Set<string>

  /** 选择状态 - 选中的行索引集合 */
  protected selectedRows: Set<number>

  /** 展开行状态 - 展开的行 key 列表 */
  protected expandedKeys: string[]

  constructor() {
    this.sortState = new Map()
    this.filterState = new Set()
    this.selectedRows = new Set()
    this.expandedKeys = []
  }

  // ========================================================================
  // 排序方法
  // ========================================================================

  /**
   * 设置指定字段的排序状态
   * @param field 字段名
   * @param order 排序方向
   */
  setSortState(field: string, order: SortOrder): void {
    this.sortState.set(field, order)
  }

  /**
   * 获取指定字段的排序状态
   * @param field 字段名
   * @returns 排序方向
   */
  getSortState(field: string): SortOrder | undefined {
    return this.sortState.get(field)
  }

  /**
   * 获取所有排序状态
   * @returns 排序状态的副本
   */
  getAllSortStates(): Map<string, SortOrder> {
    return new Map(this.sortState)
  }

  /**
   * 清除指定字段的排序状态
   * @param field 字段名
   */
  clearSortState(field: string): void {
    this.sortState.delete(field)
  }

  /**
   * 清除所有排序状态
   */
  clearAllSortStates(): void {
    this.sortState.clear()
  }

  /**
   * 检查是否有激活的排序
   * @returns 是否有排序
   */
  hasActiveSorts(): boolean {
    return this.sortState.size > 0
  }

  // ========================================================================
  // 筛选方法
  // ========================================================================

  /**
   * 设置指定字段的筛选状态
   * @param field 字段名
   * @param isActive 是否激活
   */
  setFilterState(field: string, isActive: boolean): void {
    if (isActive) {
      this.filterState.add(field)
    } else {
      this.filterState.delete(field)
    }
  }

  /**
   * 获取指定字段的筛选状态
   * @param field 字段名
   * @returns 是否激活筛选
   */
  getFilterState(field: string): boolean {
    return this.filterState.has(field)
  }

  /**
   * 获取所有激活筛选的字段
   * @returns 字段名数组
   */
  getActiveFilterFields(): string[] {
    return Array.from(this.filterState)
  }

  /**
   * 清除指定字段的筛选状态
   * @param field 字段名
   */
  clearFilterState(field: string): void {
    this.filterState.delete(field)
  }

  /**
   * 清除所有筛选状态
   */
  clearAllFilterStates(): void {
    this.filterState.clear()
  }

  /**
   * 检查是否有激活的筛选
   * @returns 是否有筛选
   */
  hasActiveFilters(): boolean {
    return this.filterState.size > 0
  }

  /**
   * 获取激活筛选的数量
   * @returns 筛选数量
   */
  getFilterCount(): number {
    return this.filterState.size
  }

  // ========================================================================
  // 选择方法
  // ========================================================================

  /**
   * 切换指定行的选择状态
   * @param rowIndex 行索引
   */
  toggleRowSelection(rowIndex: number): void {
    if (this.selectedRows.has(rowIndex)) {
      this.selectedRows.delete(rowIndex)
    } else {
      this.selectedRows.add(rowIndex)
    }
  }

  /**
   * 设置行的选择状态
   * @param rowIndex 行索引
   * @param selected 是否选中
   */
  setRowSelection(rowIndex: number, selected: boolean): void {
    if (selected) {
      this.selectedRows.add(rowIndex)
    } else {
      this.selectedRows.delete(rowIndex)
    }
  }

  /**
   * 检查指定行是否被选中
   * @param rowIndex 行索引
   * @returns 是否选中
   */
  isRowSelected(rowIndex: number): boolean {
    return this.selectedRows.has(rowIndex)
  }

  /**
   * 获取所有选中行的索引
   * @returns 行索引数组
   */
  getSelectedRows(): number[] {
    return Array.from(this.selectedRows)
  }

  /**
   * 根据行 key 设置选中行（用于 Ant Design Vue API 兼容）
   * @param rowKeys 行 key 列表
   * @param getRowKey 获取行 key 的函数
   * @param data 数据列表
   */
  setSelectedRows(
    rowKeys: any[],
    getRowKey: (row: any) => string,
    data: any[]
  ): void {
    this.selectedRows.clear()
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const key = getRowKey(row)
      if (rowKeys.includes(key)) {
        this.selectedRows.add(i)
      }
    }
  }

  /**
   * 全选或取消全选
   * @param selected 是否全选
   * @param data 数据列表
   */
  selectAll(selected: boolean, data: any[]): void {
    this.selectedRows.clear()
    if (selected) {
      for (let i = 0; i < data.length; i++) {
        this.selectedRows.add(i)
      }
    }
  }

  /**
   * 清除所有选择
   */
  clearSelection(): void {
    this.selectedRows.clear()
  }

  /**
   * 获取选中行的数量
   * @returns 选中行数
   */
  getSelectedCount(): number {
    return this.selectedRows.size
  }

  /**
   * 检查是否有选中的行
   * @returns 是否有选中
   */
  hasSelection(): boolean {
    return this.selectedRows.size > 0
  }

  // ========================================================================
  // 展开行方法
  // ========================================================================

  /**
   * 设置展开的行
   * @param keys 行 key 列表
   */
  setExpandedKeys(keys: string[]): void {
    this.expandedKeys = keys
  }

  /**
   * 更新展开的行（增量更新）
   * @param keys 行 key 列表
   */
  updateExpandedKeys(keys: string[]): void {
    this.expandedKeys = keys
  }

  /**
   * 切换指定行的展开状态
   * @param key 行 key
   */
  toggleExpandedKey(key: string): void {
    const index = this.expandedKeys.indexOf(key)
    if (index >= 0) {
      this.expandedKeys.splice(index, 1)
    } else {
      this.expandedKeys.push(key)
    }
  }

  /**
   * 检查指定行是否展开
   * @param key 行 key
   * @returns 是否展开
   */
  isRowExpanded(key: string): boolean {
    return this.expandedKeys.includes(key)
  }

  /**
   * 获取所有展开的行
   * @returns 行 key 数组
   */
  getExpandedKeys(): string[] {
    return [...this.expandedKeys]
  }

  /**
   * 清除所有展开行
   */
  clearExpandedKeys(): void {
    this.expandedKeys = []
  }

  /**
   * 检查是否有展开的行
   * @returns 是否有展开
   */
  hasExpandedRows(): boolean {
    return this.expandedKeys.length > 0
  }

  // ========================================================================
  // 工具方法
  // ========================================================================

  /**
   * 重置所有状态
   */
  resetAll(): void {
    this.clearAllSortStates()
    this.clearAllFilterStates()
    this.clearSelection()
    this.clearExpandedKeys()
  }

  /**
   * 获取状态摘要（用于调试）
   * @returns 状态摘要对象
   */
  getStateSummary(): {
    sortCount: number
    filterCount: number
    selectionCount: number
    expandedCount: number
  } {
    return {
      sortCount: this.sortState.size,
      filterCount: this.filterState.size,
      selectionCount: this.selectedRows.size,
      expandedCount: this.expandedKeys.length
    }
  }
}
