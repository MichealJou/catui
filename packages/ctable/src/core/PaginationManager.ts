/**
 * PaginationManager - 分页管理器
 * 处理表格的分页逻辑
 */

export interface PaginationConfig {
  current?: number
  pageSize?: number
  total?: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: (total: number) => string
  pageSizeOptions?: number[]
  onChange?: (page: number, pageSize: number) => void
  onShowSizeChange?: (current: number, size: number) => void
}

export interface PaginationState {
  current: number
  pageSize: number
  total: number
}

export class PaginationManager {
  private config: PaginationConfig
  private state: PaginationState
  private data: any[] = []

  constructor(config: PaginationConfig = {}, data: any[] = []) {
    this.config = config
    this.data = data
    this.state = {
      current: config.current || 1,
      pageSize: config.pageSize || 10,
      total: config.total || data.length
    }
  }

  /**
   * 更新配置
   */
  setConfig(config: PaginationConfig) {
    this.config = { ...this.config, ...config }

    // 更新状态
    if (config.current !== undefined) {
      this.state.current = config.current
    }
    if (config.pageSize !== undefined) {
      this.state.pageSize = config.pageSize
    }
    if (config.total !== undefined) {
      this.state.total = config.total
    }
  }

  /**
   * 设置数据
   */
  setData(data: any[]) {
    this.data = data
    this.state.total = data.length
  }

  /**
   * 获取当前页数据
   */
  getPageData(): any[] {
    const { current, pageSize } = this.state
    const start = (current - 1) * pageSize
    const end = start + pageSize
    return this.data.slice(start, end)
  }

  /**
   * 获取总页数
   */
  getTotalPages(): number {
    const { total, pageSize } = this.state
    return Math.ceil(total / pageSize)
  }

  /**
   * 切换到指定页
   */
  goToPage(page: number) {
    const totalPages = this.getTotalPages()

    // 边界检查
    if (page < 1) page = 1
    if (page > totalPages && totalPages > 0) page = totalPages

    this.state.current = page

    // 触发 onChange 回调
    if (this.config.onChange) {
      this.config.onChange(page, this.state.pageSize)
    }
  }

  /**
   * 修改每页条数
   */
  changePageSize(size: number) {
    const oldPageSize = this.state.pageSize
    this.state.pageSize = size

    // 重新计算当前页（保持数据在视野中）
    const startIndex = (this.state.current - 1) * oldPageSize
    this.state.current = Math.floor(startIndex / size) + 1

    // 触发 onShowSizeChange 回调
    if (this.config.onShowSizeChange) {
      this.config.onShowSizeChange(this.state.current, size)
    }

    // 触发 onChange 回调
    if (this.config.onChange) {
      this.config.onChange(this.state.current, size)
    }
  }

  /**
   * 上一页
   */
  prevPage() {
    if (this.state.current > 1) {
      this.goToPage(this.state.current - 1)
    }
  }

  /**
   * 下一页
   */
  nextPage() {
    const totalPages = this.getTotalPages()
    if (this.state.current < totalPages) {
      this.goToPage(this.state.current + 1)
    }
  }

  /**
   * 获取当前状态
   */
  getState(): PaginationState {
    return { ...this.state }
  }

  /**
   * 获取配置
   */
  getConfig(): PaginationConfig {
    return { ...this.config }
  }

  /**
   * 重置到第一页
   */
  reset() {
    this.state.current = 1
  }
}
