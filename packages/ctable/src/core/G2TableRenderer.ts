/**
 * G2TableRenderer - 基于 G2 5.x Mark/View API 的表格渲染器
 * 真正使用 G2 的声明式渲染系统
 */
import { Chart } from '@antv/g2'
import type { Column, ThemeConfig, Cell, SortOrder } from '../types'
import { CheckboxRenderer } from '../renderers/CheckboxRenderer'

// ============================================================================
// G2TableRenderer 类
// ============================================================================

export class G2TableRenderer {
  private chart: Chart | null = null
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D | null = null
  private width: number
  private height: number
  private theme: ThemeConfig
  private columns: Column[] = []
  private data: any[] = []
  private visibleRows: any[] = []
  private startIndex: number = 0
  private endIndex: number = 0
  private selectable: boolean = false
  private selectedRows: Set<number> = new Set()
  private highlightedCell: Cell | null = null
  private sortState: Map<string, SortOrder> = new Map()
  private filterState: Set<string> = new Set()
  private scrollLeft: number = 0  // 横向滚动位置

  // 单元格选中状态
  private cellSelection: {
    visible: boolean
    startRow: number
    startCol: number
    endRow: number
    endCol: number
  } | null = null

  // 图标动画状态
  private iconAnimations: Map<string, {
    progress: number  // 0 到 1
    targetOpacity: number
    currentOpacity: number
    startOpacity: number
    scale: number
  }> = new Map()

  private animationFrameId: number | null = null

  // 跟踪上次渲染的状态，避免重复动画
  private lastRenderedFilterStates: Map<string, boolean> = new Map()
  private lastRenderedSortStates: Map<string, SortOrder> = new Map()

  // 复选框渲染器
  private checkboxRenderer: CheckboxRenderer = new CheckboxRenderer(16)

  // ========== 增量更新优化 ==========
  // 脏区域标记
  private dirtyRegions: Array<{ x: number; y: number; width: number; height: number }> = []
  private isHeaderDirty: boolean = false
  private isGridDirty: boolean = false

  // 上次渲染的可见数据（用于变化检测）
  private lastVisibleData: Map<string, any> = new Map()
  private lastScrollTop: number = 0
  private lastScrollLeft: number = 0

  // ========== 展开行功能 ==========
  private expandConfig: {
    enabled: boolean
    expandedKeys: string[]
    expandedRowRender?: (record: any) => any
    expandRowByClick: boolean
  } = {
    enabled: false,
    expandedKeys: [],
    expandRowByClick: false
  }

  // ========== 树形数据支持 ==========
  private treeConfig: {
    enabled: boolean
    indentSize: number
    rowLevelMap: Map<number, number>  // rowIndex -> level
  } = {
    enabled: false,
    indentSize: 20,
    rowLevelMap: new Map()
  }

  constructor(canvas: HTMLCanvasElement, width: number, height: number, theme: ThemeConfig, selectable: boolean = false) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.width = width
    this.height = height
    this.theme = theme
    this.selectable = selectable

    // 暂时使用原生 Canvas 渲染，G2 Mark API 需要进一步研究
    this.initCanvas()
  }

  /**
   * 初始化 Canvas（原生模式，G2 集成待完善）
   */
  private initCanvas() {
    const dpr = window.devicePixelRatio || 1
    this.canvas.width = this.width * dpr
    this.canvas.height = this.height * dpr
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`
    if (this.ctx) {
      this.ctx.scale(dpr, dpr)
    }
  }

  /**
   * 初始化 G2 Chart（保留接口，待完善）
   */
  private initChart() {
    // G2 Chart 初始化代码待完善
    // 当前使用原生 Canvas 作为降级方案
  }

  resize(width: number, height: number) {
    this.width = width
    this.height = height
    const dpr = window.devicePixelRatio || 1

    // 重置 canvas 尺寸（这会清空 canvas 和重置 transform）
    this.canvas.width = this.width * dpr
    this.canvas.height = this.height * dpr
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`

    // 重新应用缩放
    if (this.ctx) {
      this.ctx.scale(dpr, dpr)
    }

    // 重要：canvas 尺寸重置会清空内容，必须立即重新渲染
    // 这是 Canvas API 的标准行为
    this.render()
  }

  setTheme(theme: ThemeConfig) {
    this.theme = theme
    this.render()
  }

  setData(data: any[], columns: Column[]) {
    this.data = data
    this.columns = columns
  }

  setExpandConfig(config: {
    expandedKeys: string[]
    expandedRowRender?: (record: any) => any
    expandRowByClick: boolean
  }) {
    this.expandConfig = {
      enabled: true,
      expandedKeys: config.expandedKeys,
      expandedRowRender: config.expandedRowRender,
      expandRowByClick: config.expandRowByClick
    }
    this.render()
  }

  updateExpandedKeys(expandedKeys: string[]) {
    this.expandConfig.expandedKeys = expandedKeys
    this.render()
  }

  isRowExpanded(rowKey: string): boolean {
    return this.expandConfig.expandedKeys.includes(rowKey)
  }

  setTreeConfig(enabled: boolean, indentSize: number = 20) {
    this.treeConfig = {
      enabled,
      indentSize,
      rowLevelMap: new Map()
    }
  }

  setRowLevel(rowIndex: number, level: number) {
    if (this.treeConfig.enabled) {
      this.treeConfig.rowLevelMap.set(rowIndex, level)
    }
  }

  getRowLevel(rowIndex: number): number {
    return this.treeConfig.rowLevelMap.get(rowIndex) || 0
  }

  setVisibleData(startIndex: number, endIndex: number) {
    const oldStartIndex = this.startIndex
    const oldEndIndex = this.endIndex

    this.startIndex = startIndex
    this.endIndex = endIndex
    this.visibleRows = this.data.slice(startIndex, endIndex)

    // 计算滚动距离，用于优化渲染策略
    const scrollDelta = Math.abs(startIndex - oldStartIndex)

    // 如果滚动距离很小（小于缓冲区），只标记脏区域
    if (scrollDelta < 5) {
      // 小幅滚动，只标记变化的区域
      const headerHeight = this.theme.spacing.header
      const cellHeight = this.theme.spacing.cell

      if (startIndex > oldStartIndex) {
        // 向下滚动，上面的行移出，下面的行进入
        const newRowsY = headerHeight + (endIndex - oldEndIndex) * cellHeight
        this.markDirtyRegion(0, newRowsY, this.width, this.height - newRowsY)
      } else {
        // 向上滚动，下面的行移出，上面的行进入
        const newRowsHeight = (oldStartIndex - startIndex) * cellHeight
        this.markDirtyRegion(0, headerHeight, this.width, newRowsHeight)
      }
    } else {
      // 大幅滚动，将在 render() 中通过 detectChanges() 决定是否完全重绘
      // 不需要做特殊处理
    }

    this.render()
  }

  setScrollLeft(scrollLeft: number) {
    this.scrollLeft = scrollLeft
    // 不立即渲染，由调用方决定何时渲染
  }

  setScrollTop(scrollTop: number) {
    this.lastScrollTop = scrollTop
    // 不立即渲染，由调用方决定何时渲染
  }

  /**
   * 主渲染方法 - 使用原生 Canvas（G2 Mark API 待完善）
   * 支持增量更新优化
   */
  render() {
    if (!this.ctx) {
      return
    }

    // 更新动画
    this.updateAnimations()

    const headerHeight = this.theme.spacing.header
    const cellHeight = this.theme.spacing.cell

    // 检测是否需要完全重绘
    const needsFullRender = this.detectChanges()

    if (needsFullRender) {
      // 完全重绘（初始化或数据变化）
      this.fullRender(headerHeight, cellHeight)
    } else {
      // 增量更新（只重绘变化的部分）
      this.incrementalRender(headerHeight, cellHeight)
    }

    // 如果有动画在进行，继续下一帧
    if (this.iconAnimations.size > 0) {
      this.animationFrameId = requestAnimationFrame(() => this.render())
    }
  }

  /**
   * 完全重绘（用于初始化或数据大幅变化）
   */
  private fullRender(headerHeight: number, cellHeight: number) {
    // 清除画布（跳过表头区域，因为使用 HTML 表头）
    this.ctx!.clearRect(0, headerHeight, this.width, this.height - headerHeight)

    // 设置裁剪区域（只裁剪数据区域）
    this.ctx!.save()
    this.ctx!.beginPath()
    this.ctx!.rect(0, headerHeight, this.width, this.height - headerHeight)
    this.ctx!.clip()

    // 绘制数据内容（不绘制表头）
    this.renderVisibleRows(headerHeight, cellHeight)
    this.renderGrid(headerHeight, cellHeight)

    // 恢复裁剪状态
    this.ctx!.restore()

    // 重置脏标记
    this.dirtyRegions = []
    this.isHeaderDirty = false
    this.isGridDirty = false
  }

  /**
   * 增量更新（只重绘变化的部分）
   */
  private incrementalRender(headerHeight: number, cellHeight: number) {
    if (!this.ctx) return

    // 表头不再使用 Canvas 渲染，跳过
    this.isHeaderDirty = false

    // 如果有脏区域，重绘这些区域
    this.dirtyRegions.forEach(region => {
      // 跳过表头区域的脏区域
      if (region.y < headerHeight) {
        return
      }

      this.ctx.clearRect(region.x, region.y, region.width, region.height)

      // 计算受影响的行
      const startRow = Math.floor((region.y - headerHeight) / cellHeight)
      const endRow = Math.ceil((region.y + region.height - headerHeight) / cellHeight)

      // 只重绘受影响的行
      for (let row = startRow; row <= endRow && row < this.visibleRows.length; row++) {
        const y = headerHeight + row * cellHeight
        this.renderRow(row, y, cellHeight)
      }
    })

    this.dirtyRegions = []
  }

  /**
   * 标记脏区域（需要重绘的区域）
   */
  private markDirtyRegion(x: number, y: number, width: number, height: number) {
    // 合并相邻或重叠的脏区域，减少重绘次数
    const merged = this.dirtyRegions.some(region => {
      const xOverlap = Math.max(0, Math.min(region.x + region.width, x + width) - Math.max(region.x, x))
      const yOverlap = Math.max(0, Math.min(region.y + region.height, y + height) - Math.max(region.y, y))

      // 如果有重叠，合并区域
      if (xOverlap > 0 && yOverlap > 0) {
        region.x = Math.min(region.x, x)
        region.y = Math.min(region.y, y)
        region.width = Math.max(region.x + region.width, x + width) - region.x
        region.height = Math.max(region.y + region.height, y + height) - region.y
        return true
      }
      return false
    })

    // 如果没有合并，添加新区域
    if (!merged) {
      this.dirtyRegions.push({ x, y, width, height })
    }
  }

  /**
   * 检测变化，决定是否需要完全重绘
   */
  private detectChanges(): boolean {
    // 检查数据是否大幅变化（超过50%的可见数据变化）
    const currentVisibleDataStr = JSON.stringify(this.visibleRows)
    const lastVisibleDataStr = JSON.stringify(Array.from(this.lastVisibleData.values()))

    if (currentVisibleDataStr !== lastVisibleDataStr) {
      // 计算变化比例
      const currentKeys = new Set(this.visibleRows.map(row => JSON.stringify(row)))
      const lastKeys = new Set(this.lastVisibleData.keys())

      let changedCount = 0
      currentKeys.forEach(key => {
        if (!lastKeys.has(key)) changedCount++
      })

      const changeRatio = changedCount / Math.max(currentKeys.size, 1)

      // 如果变化超过50%，完全重绘
      if (changeRatio > 0.5) {
        // 更新缓存
        this.lastVisibleData.clear()
        this.visibleRows.forEach(row => {
          this.lastVisibleData.set(JSON.stringify(row), row)
        })
        return true
      }
    }

    // 检查滚动位置是否大幅变化（超过一页）
    const scrollDelta = Math.abs(this.lastScrollTop - (this.startIndex * this.theme.spacing.cell))

    // 如果滚动变化超过一页高度，强制完全重绘
    const pageHeight = this.height - this.theme.spacing.header
    if (scrollDelta > pageHeight) {
      return true
    }

    // 检查 scrollTop 是否改变（即使小幅变化也需要重绘，因为滚动偏移量会改变）
    if (scrollDelta > 0) {
      return true  // 任何滚动变化都触发完全重绘，避免内容重叠
    }

    return false
  }

  /**
   * 更新图标动画状态
   */
  private updateAnimations() {
    const animationSpeed = 0.15  // 动画速度
    const completedAnimations: string[] = []

    this.iconAnimations.forEach((anim, key) => {
      // 更新进度
      anim.progress += animationSpeed

      if (anim.progress >= 1) {
        anim.progress = 1
        completedAnimations.push(key)
      }

      // 计算当前透明度（淡入淡出）
      anim.currentOpacity = anim.startOpacity + (anim.targetOpacity - anim.startOpacity) * this.easeOutCubic(anim.progress)

      // 计算缩放效果（轻微的弹性）
      const scaleProgress = this.easeOutBack(anim.progress)
      anim.scale = 0.95 + 0.05 * scaleProgress
    })

    // 移除已完成的动画
    completedAnimations.forEach(key => this.iconAnimations.delete(key))
  }

  /**
   * 缓动函数：Ease Out Cubic
   */
  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3)
  }

  /**
   * 缓动函数：Ease Out Back
   */
  private easeOutBack(t: number): number {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  }

  /**
   * 启动图标动画
   */
  private startIconAnimation(key: string, targetOpacity: number, startOpacity: number = 1) {
    const existing = this.iconAnimations.get(key)

    // 如果已有动画，调整目标
    if (existing) {
      existing.targetOpacity = targetOpacity
      existing.startOpacity = existing.currentOpacity
      existing.progress = 0
    } else {
      this.iconAnimations.set(key, {
        progress: 0,
        targetOpacity,
        currentOpacity: startOpacity,
        startOpacity,
        scale: 1
      })
    }

    // 确保动画循环在运行
    if (!this.animationFrameId) {
      this.animationFrameId = requestAnimationFrame(() => this.render())
    }
  }

  /**
   * 渲染表头
   */
  private renderHeader(headerHeight: number) {
    const { colors, fonts, spacing } = this.theme

    let originalTotalWidth = 0
    for (const col of this.columns) {
      originalTotalWidth += col.width || 120
    }

    this.columns.forEach((col, colIndex) => {
      const x = this.getColumnX(colIndex) - this.scrollLeft
      let width = col.width || 120

      // 如果列完全在可视区域外，跳过绘制
      if (x + width <= 0 || x >= this.width) {
        return
      }

      if (colIndex === this.columns.length - 1 && originalTotalWidth < this.width) {
        width = this.width - (this.getColumnX(colIndex) - this.scrollLeft)
      }

      const visibleWidth = Math.min(width, this.width - x)

      // 绘制表头背景
      this.ctx.fillStyle = colors.header
      this.ctx.fillRect(x, 0, visibleWidth, headerHeight)

      // 绘制表头边框
      this.ctx.strokeStyle = colors.border
      this.ctx.lineWidth = spacing.border
      this.ctx.strokeRect(x, 0, visibleWidth, headerHeight)

      // 表头底部加粗线
      this.ctx.beginPath()
      this.ctx.moveTo(x, headerHeight)
      this.ctx.lineTo(x + visibleWidth, headerHeight)
      this.ctx.lineWidth = 2
      this.ctx.strokeStyle = colors.border
      this.ctx.stroke()

      // 检查是否是复选框列
      if (col.key === '__checkbox__') {
        // 绘制全选复选框
        const checkboxX = x + (visibleWidth - 16) / 2
        const checkboxY = (headerHeight - 16) / 2
        // 检查是否所有可见行都被选中
        const allSelected = this.visibleRows.length > 0 &&
          this.visibleRows.every((_, index) => this.selectedRows.has(this.startIndex + index))
        this.checkboxRenderer.draw(this.ctx, checkboxX, checkboxY, allSelected)
      } else {
        // 绘制表头文字
      this.ctx.font = `normal ${fonts.header.weight} ${parseInt(fonts.header.size)}px "PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
      this.ctx.fillStyle = colors.text
      this.ctx.textBaseline = 'middle'

      const hasSort = col.sortable
      const hasFilter = col.filterable
      const align = col.align || 'left'

      // 计算图标占用的总宽度（包含间距）
      const iconPadding = 8  // 右侧留白
      const iconGap = 4      // 图标之间的间距
      const sortIconWidth = hasSort ? 12 : 0
      const filterIconWidth = hasFilter ? 14 : 0
      const totalIconWidth = iconPadding + sortIconWidth + (hasFilter && hasSort ? iconGap + filterIconWidth : filterIconWidth)

      // 根据对齐方式计算文字位置和最大宽度
      let textX: number
      let maxWidth: number

      if (align === 'left') {
        // 左对齐：从左padding开始，为右侧图标留出空间
        textX = x + spacing.padding
        maxWidth = visibleWidth - spacing.padding * 2 - totalIconWidth
        this.ctx.textAlign = 'left'
      } else if (align === 'center') {
        // 居中对齐：考虑图标空间，文字略偏左
        textX = x + visibleWidth / 2 - totalIconWidth / 4
        maxWidth = visibleWidth - spacing.padding * 2 - totalIconWidth / 2
        this.ctx.textAlign = 'center'
      } else {
        // 右对齐：文字靠近图标
        textX = x + visibleWidth - spacing.padding - totalIconWidth
        maxWidth = visibleWidth - spacing.padding * 2 - totalIconWidth
        this.ctx.textAlign = 'right'
      }

      // 绘制文字（自动截断以适应可用空间）
      const text = this.fitText(col.title, maxWidth)
      this.ctx.fillText(text, textX, headerHeight / 2)

      // 绘制图标（从右向左排列，紧贴右边缘）
      let currentIconX = x + visibleWidth - iconPadding

      // 筛选图标（最右侧）
      if (hasFilter) {
        this.renderFilterIcon(currentIconX - filterIconWidth / 2, headerHeight / 2, this.filterState.has(col.key), col.key)
        currentIconX -= filterIconWidth + iconGap
      }

      // 排序图标（筛选图标左侧）
      if (hasSort) {
        const sortOrder = this.sortState.get(col.key)
        this.renderSortIcon(currentIconX - sortIconWidth / 2, headerHeight / 2, sortOrder, col.key)
      }
      }
    })
  }

  /**
   * 渲染单行（用于增量更新）
   */
  private renderRow(rowIndex: number, y: number, cellHeight: number) {
    const row = this.visibleRows[rowIndex]
    if (!row || !this.ctx) return

    const actualRowIndex = this.startIndex + rowIndex
    const { colors, fonts, spacing } = this.theme

    let originalTotalWidth = 0
    for (const col of this.columns) {
      originalTotalWidth += col.width || 120
    }

    const isStripe = colors.stripe && actualRowIndex % 2 === 1

    // ========== 树形数据支持 ==========
    const level = this.treeConfig.enabled ? this.getRowLevel(actualRowIndex) : 0
    const indent = this.treeConfig.enabled ? level * this.treeConfig.indentSize : 0

    // ========== 展开行渲染 ==========
    // 检查该行是否展开
    const rowKey = String(row.id || row.key || actualRowIndex)
    const isExpanded = this.expandConfig.enabled && this.expandConfig.expandedKeys.includes(rowKey)

    this.columns.forEach((col, colIndex) => {
      const x = this.getColumnX(colIndex) - this.scrollLeft
      let width = col.width || 120

      // 如果列完全在可视区域外，跳过绘制
      if (x + width <= 0 || x >= this.width) {
        return
      }

      if (colIndex === this.columns.length - 1 && originalTotalWidth < this.width) {
        width = this.width - (this.getColumnX(colIndex) - this.scrollLeft)
      }

      const visibleWidth = Math.min(width, this.width - x)

      // 绘制单元格背景
      this.ctx.fillStyle = isStripe ? (colors.stripe || colors.background) : colors.background
      this.ctx.fillRect(x, y, visibleWidth, cellHeight)

      // 绘制单元格边框
      this.ctx.strokeStyle = colors.border
      this.ctx.lineWidth = spacing.border
      this.ctx.strokeRect(x, y, visibleWidth, cellHeight)

      // 在第一列绘制展开图标
      if (colIndex === 0) {
        const hasExpandIcon = this.expandConfig.enabled || this.treeConfig.enabled
        if (hasExpandIcon) {
          // 计算展开图标位置（考虑缩进）
          const iconX = x + indent + 8
          const iconY = y + (cellHeight - 12) / 2
          const hasChildren = this.treeConfig.enabled && (row as any).hasChildren
          const showExpandIcon = this.expandConfig.enabled || hasChildren

          if (showExpandIcon) {
            this.renderExpandIcon(iconX, iconY, cellHeight, isExpanded)
          }
        }
      }

      // 检查是否是复选框列
      if (col.key === '__checkbox__') {
        // 绘制复选框
        const checkboxX = x + (visibleWidth - 16) / 2
        const checkboxY = y + (cellHeight - 16) / 2
        const isChecked = this.selectedRows.has(actualRowIndex)
        this.checkboxRenderer.draw(this.ctx, checkboxX, checkboxY, isChecked)
      } else {
        // 绘制文字
        this.ctx.font = `normal ${fonts.cell.weight} ${parseInt(fonts.cell.size)}px "PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
        this.ctx.fillStyle = colors.text
        this.ctx.textAlign = col.align || 'left'
        this.ctx.textBaseline = 'middle'

        const dataValue = row[col.dataIndex || col.key]
        const text = col.render ? col.render(row, actualRowIndex, col) : String(dataValue ?? '')

        // 计算文字偏移（展开图标 + 缩进）
        let textOffset = 0
        if (colIndex === 0) {
          if (this.expandConfig.enabled || this.treeConfig.enabled) {
            textOffset = indent + 24  // 缩进 + 图标宽度 + padding
          }
        }

        const fittedText = this.fitText(text, visibleWidth - spacing.padding * 2 - textOffset)
        const textX = this.getTextX(x, visibleWidth, col.align || 'left', spacing.padding) + textOffset
        this.ctx.fillText(fittedText, textX, y + cellHeight / 2)
      }
    })

    // 如果展开且配置了渲染函数，渲染展开内容
    if (isExpanded && this.expandConfig.expandedRowRender) {
      this.renderExpandedRow(rowIndex, y + cellHeight, row)
    }
  }

  /**
   * 渲染数据行
   */
  private renderVisibleRows(headerHeight: number, cellHeight: number) {
    const { colors, fonts, spacing } = this.theme

    let originalTotalWidth = 0
    for (const col of this.columns) {
      originalTotalWidth += col.width || 120
    }

    // 计算滚动偏移量：scrollTop 可能不在单元格边界上
    const scrollTop = this.lastScrollTop
    const scrollOffset = scrollTop % cellHeight

    // 计算当前滚动位置对应的第一个可见行（相对于整个数据集）
    const firstVisibleRowIndex = Math.floor(scrollTop / cellHeight)

    // visibleRows 的起始行是 startIndex，所以第一行（rowIndex=0）对应第 startIndex 行
    // 第一个真正可见的行在 visibleRows 中的索引是：firstVisibleRowIndex - startIndex
    const firstVisibleRowOffset = firstVisibleRowIndex - this.startIndex

    this.visibleRows.forEach((row: any, rowIndex: number) => {
      const actualRowIndex = this.startIndex + rowIndex

      // 计算当前行相对于第一个可见行的偏移
      // 例如：如果 firstVisibleRowOffset = 10，当前 rowIndex = 10，则 relativeOffset = 0
      const relativeOffset = rowIndex - firstVisibleRowOffset

      // 计算 Y 坐标：从表头下方开始，加上相对偏移，减去滚动偏移
      // 调整：让第一行从 headerHeight 开始，实现平滑滚动
      const y = headerHeight - scrollOffset + relativeOffset * cellHeight

      // 跳过完全在表头上方的行
      if (y + cellHeight <= headerHeight) {
        return
      }

      // 跳过完全超出底部的行
      if (y >= this.height) {
        return
      }

      // 处理部分在表头内的行：保持完整高度，让行平滑滚动
      // Canvas 会自动裁剪表头区域外的内容
      const actualY = y
      const actualHeight = cellHeight

      const isStripe = colors.stripe && actualRowIndex % 2 === 1

      this.columns.forEach((col, colIndex) => {
        const x = this.getColumnX(colIndex) - this.scrollLeft
        let width = col.width || 120

        // 如果列完全在可视区域外，跳过绘制
        if (x + width <= 0 || x >= this.width) {
          return
        }

        if (colIndex === this.columns.length - 1 && originalTotalWidth < this.width) {
          width = this.width - (this.getColumnX(colIndex) - this.scrollLeft)
        }

        const visibleWidth = Math.min(width, this.width - x)

        // 绘制单元格背景
        this.ctx.fillStyle = isStripe ? (colors.stripe || colors.background) : colors.background
        this.ctx.fillRect(x, actualY, visibleWidth, actualHeight)

        // 绘制单元格边框
        this.ctx.strokeStyle = colors.border
        this.ctx.lineWidth = spacing.border
        this.ctx.strokeRect(x, actualY, visibleWidth, actualHeight)

        // 检查是否是复选框列
        if (col.key === '__checkbox__') {
          // 绘制复选框
          const checkboxX = x + (visibleWidth - 16) / 2
          const checkboxY = actualY + (actualHeight - 16) / 2
          const isChecked = this.selectedRows.has(actualRowIndex)
          this.checkboxRenderer.draw(this.ctx, checkboxX, checkboxY, isChecked)
        } else {
          // 绘制文字
          this.ctx.font = `normal ${fonts.cell.weight} ${parseInt(fonts.cell.size)}px "PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
          this.ctx.fillStyle = colors.text
          this.ctx.textAlign = col.align || 'left'
          this.ctx.textBaseline = 'middle'

          const dataValue = row[col.dataIndex || col.key]
          const text = col.render ? col.render(row, actualRowIndex, col) : String(dataValue ?? '')

          const fittedText = this.fitText(text, visibleWidth - spacing.padding * 2)
          const textX = this.getTextX(x, visibleWidth, col.align || 'left', spacing.padding)
          this.ctx.fillText(fittedText, textX, actualY + actualHeight / 2)
        }
      })
    })
  }

  /**
   * 渲染网格线
   */
  private renderGrid(headerHeight: number, cellHeight: number) {
    const { colors, spacing } = this.theme

    const totalWidth = this.getTotalColumnsWidth()
    const gridLineWidth = Math.min(totalWidth, this.width)
    const maxVisibleY = this.height

    // 获取滚动偏移量
    const scrollTop = this.lastScrollTop
    const scrollOffset = scrollTop % cellHeight

    // 计算当前滚动位置对应的第一个可见行（相对于整个数据集）
    const firstVisibleRowIndex = Math.floor(scrollTop / cellHeight)

    // visibleRows 的起始行是 startIndex
    const firstVisibleRowOffset = firstVisibleRowIndex - this.startIndex

    // 只绘制可视区域内的网格线
    // 计算可视区域最多能显示多少行
    const visibleRowCount = Math.ceil((this.height - headerHeight) / cellHeight)

    for (let i = 0; i < visibleRowCount; i++) {
      // 计算网格线的 Y 坐标
      const relativeOffset = i - firstVisibleRowOffset
      const y = headerHeight + (i + 1) * cellHeight - scrollOffset

      // 跳过被表头遮挡的线
      if (y < headerHeight) continue

      // 跳过超出可视区域的线
      if (y >= maxVisibleY) continue

      this.ctx.strokeStyle = colors.border
      this.ctx.lineWidth = spacing.border
      this.ctx.beginPath()
      // 应用横向滚动偏移
      this.ctx.moveTo(-this.scrollLeft, y)
      this.ctx.lineTo(gridLineWidth - this.scrollLeft, y)
      this.ctx.stroke()
    }

    // 表格底部边框 - 只在数据行未填满整个容器时显示
    const lastVisibleRowOffset = this.visibleRows.length - 1 - firstVisibleRowOffset
    const bottomY = headerHeight + (lastVisibleRowOffset + 1) * cellHeight - scrollOffset
    if (bottomY < this.height && bottomY >= headerHeight) {
      this.ctx.strokeStyle = colors.border
      this.ctx.lineWidth = spacing.border
      this.ctx.beginPath()
      // 应用横向滚动偏移
      this.ctx.moveTo(-this.scrollLeft, bottomY)
      this.ctx.lineTo(gridLineWidth - this.scrollLeft, bottomY)
      this.ctx.stroke()
    }

    // 绘制选中框的网格线
    this.renderCellSelectionGrid(headerHeight, cellHeight)
  }

  /**
   * 绘制单元格选中框的网格线
   */
  private renderCellSelectionGrid(headerHeight: number, cellHeight: number) {
    if (!this.cellSelection || !this.cellSelection.visible) {
      return
    }

    const { startRow, startCol, endRow, endCol } = this.cellSelection

    // 确保 startRow/Col <= endRow/Col
    const minRow = Math.min(startRow, endRow)
    const maxRow = Math.max(startRow, endRow)
    const minCol = Math.min(startCol, endCol)
    const maxCol = Math.max(startCol, endCol)

    // 计算选中区域的起始位置
    const scrollTop = this.lastScrollTop

    // 计算顶部 Y 坐标
    const topY = headerHeight + (minRow * cellHeight) - scrollTop
    const totalHeight = (maxRow - minRow + 1) * cellHeight

    // 计算起始 X 坐标
    let startX = -this.scrollLeft
    for (let i = 0; i < minCol; i++) {
      const colWidth = typeof this.columns[i]?.width === 'number'
        ? this.columns[i]?.width as number
        : 120
      startX += colWidth
    }

    // 绘制垂直网格线（在列之间）
    let currentX = startX
    for (let i = minCol; i <= maxCol; i++) {
      const colWidth = typeof this.columns[i]?.width === 'number'
        ? this.columns[i]?.width as number
        : 120
      currentX += colWidth

      // 在列与列之间的边界上添加垂直网格线（不包括最右侧）
      if (i < maxCol) {
        this.ctx.strokeStyle = 'rgba(24, 144, 255, 0.4)'
        this.ctx.lineWidth = 1
        this.ctx.beginPath()
        this.ctx.moveTo(currentX, topY)
        this.ctx.lineTo(currentX, topY + totalHeight)
        this.ctx.stroke()
      }
    }

    // 绘制水平网格线（在行之间）
    for (let i = minRow; i < maxRow; i++) {
      const lineY = topY + (i - minRow + 1) * cellHeight

      this.ctx.strokeStyle = 'rgba(24, 144, 255, 0.4)'
      this.ctx.lineWidth = 1
      this.ctx.beginPath()

      // 计算总宽度
      let totalWidth = 0
      for (let j = minCol; j <= maxCol; j++) {
        const colWidth = typeof this.columns[j]?.width === 'number'
          ? this.columns[j]?.width as number
          : 120
        totalWidth += colWidth
      }

      this.ctx.moveTo(startX, lineY)
      this.ctx.lineTo(startX + totalWidth, lineY)
      this.ctx.stroke()
    }
  }

  /**
   * 绘制筛选图标（直接使用 Canvas API 绘制）
   */
  private renderFilterIcon(x: number, y: number, isActive: boolean, field: string) {
    if (!this.ctx) return

    // 获取动画状态
    const stateKey = isActive ? `${field}_active` : `${field}_inactive`
    const animKey = isActive ? 'filter-active' : 'filter-inactive'
    let animation = this.iconAnimations.get(animKey)

    // 只在状态真正改变时启动动画
    const lastState = this.lastRenderedFilterStates.get(stateKey)
    if (lastState !== isActive && !animation) {
      this.startIconAnimation(animKey, 1, 0)
      animation = this.iconAnimations.get(animKey)
    }

    this.lastRenderedFilterStates.set(stateKey, isActive)

    const scale = animation?.scale || 1
    const opacity = animation?.currentOpacity ?? 1

    // 直接使用几何图形绘制
    this.renderFilterIconFallback(x, y, isActive, scale, opacity)
  }

  /**
   * 绘制排序图标（直接使用 Canvas API 绘制）
   */
  private renderSortIcon(x: number, y: number, order: SortOrder, field: string) {
    if (!this.ctx) return

    // 获取动画状态
    const stateKey = `${field}_${order || 'default'}`
    const animKey = `sort-${order || 'default'}`
    let animation = this.iconAnimations.get(animKey)

    // 只在状态真正改变时启动动画
    const lastState = this.lastRenderedSortStates.get(stateKey)
    if (lastState !== order && !animation) {
      this.startIconAnimation(animKey, 1, 0)
      animation = this.iconAnimations.get(animKey)
    }

    this.lastRenderedSortStates.set(stateKey, order)

    const scale = animation?.scale || 1
    const opacity = animation?.currentOpacity ?? 1

    // 直接使用几何图形绘制（不使用 SVG）
    this.renderSortIconFallback(x, y, order, scale, opacity)
  }

  /**
   * 绘制筛选图标（几何图形绘制 - Ant Design 风格）
   */
  private renderFilterIconFallback(x: number, y: number, isActive: boolean, scale: number = 1, opacity: number = 1) {
    if (!this.ctx) return

    this.ctx.save()

    // 应用缩放
    if (scale !== 1) {
      this.ctx.translate(x, y)
      this.ctx.scale(scale, scale)
      this.ctx.translate(-x, -y)
    }

    // 应用透明度
    this.ctx.globalAlpha = opacity

    // Ant Design 风格的颜色
    if (isActive) {
      this.ctx.fillStyle = this.theme.colors.primary
      this.ctx.strokeStyle = this.theme.colors.primary
    } else {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)'
    }

    // 更精致的漏斗形状
    const w = 7  // 上宽
    const w2 = 3.5 // 下宽
    const h = 6.5 // 漏斗高度
    const handleH = 4 // 手柄高度

    // 绘制漏斗主体
    this.ctx.beginPath()
    this.ctx.moveTo(x - w / 2, y - h / 2 - handleH / 2)
    this.ctx.lineTo(x + w / 2, y - h / 2 - handleH / 2)
    this.ctx.lineTo(x + w2 / 2, y + h / 2 - handleH / 2)
    this.ctx.lineTo(x - w2 / 2, y + h / 2 - handleH / 2)
    this.ctx.closePath()
    this.ctx.fill()

    // 绘制手柄
    this.ctx.beginPath()
    this.ctx.rect(x - w2 / 2, y + h / 2 - handleH / 2 + 0.5, w2, handleH)
    this.ctx.fill()

    // 如果是激活状态，底部加一个小圆点（Ant Design 风格）
    if (isActive) {
      this.ctx.beginPath()
      this.ctx.arc(x, y + h / 2 + handleH / 2 + 2, 1.2, 0, Math.PI * 2)
      this.ctx.fill()
    }

    this.ctx.restore()
  }

  /**
   * 绘制排序图标（几何图形降级方案 - Ant Design 风格）
   */
  private renderSortIconFallback(x: number, y: number, order: SortOrder, scale: number = 1, opacity: number = 1) {
    if (!this.ctx) return

    this.ctx.save()

    // 应用缩放
    if (scale !== 1) {
      this.ctx.translate(x, y)
      this.ctx.scale(scale, scale)
      this.ctx.translate(-x, -y)
    }

    // 应用透明度
    this.ctx.globalAlpha = opacity

    const color = 'rgba(0, 0, 0, 0.45)'
    const inactiveColor = 'rgba(0, 0, 0, 0.25)'

    // Ant Design 风格的箭头（圆润的三角形）
    const drawArrow = (cy: number, direction: 'up' | 'down', arrowOpacity: number) => {
      const size = 3.5
      this.ctx.fillStyle = direction === 'up' ? `rgba(0, 0, 0, ${arrowOpacity})` : color

      this.ctx.beginPath()
      if (direction === 'up') {
        this.ctx.moveTo(x, cy - size)
        this.ctx.lineTo(x - size, cy)
        this.ctx.lineTo(x + size, cy)
      } else {
        this.ctx.moveTo(x, cy + size)
        this.ctx.lineTo(x - size, cy)
        this.ctx.lineTo(x + size, cy)
      }
      this.ctx.closePath()
      this.ctx.fill()
    }

    const gap = 1.5

    if (order === 'asc') {
      // 上箭头实心，下箭头半透明
      drawArrow(y - gap, 'up', 0.45)
      drawArrow(y + gap, 'down', 0.25)
    } else if (order === 'desc') {
      // 上箭头半透明，下箭头实心
      drawArrow(y - gap, 'up', 0.25)
      drawArrow(y + gap, 'down', 0.45)
    } else {
      // 两个箭头都正常显示
      drawArrow(y - gap, 'up', 0.45)
      drawArrow(y + gap, 'down', 0.45)
    }

    this.ctx.restore()
  }

  // ============================================================================
  // 展开行相关
  // ============================================================================

  /**
   * 绘制展开/收起图标
   */
  private renderExpandIcon(x: number, y: number, cellHeight: number, isExpanded: boolean) {
    if (!this.ctx) return

    const iconSize = 12
    const iconX = x + 8  // 左侧padding
    const iconY = y + (cellHeight - iconSize) / 2

    this.ctx.save()
    this.ctx.translate(iconX + iconSize / 2, iconY + iconSize / 2)

    // 如果展开，旋转90度
    if (isExpanded) {
      this.ctx.rotate(Math.PI / 2)
    }

    this.ctx.strokeStyle = this.theme.colors.text
    this.ctx.lineWidth = 1.5
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'

    // 绘制向右的箭头（类似 > 形状）
    this.ctx.beginPath()
    this.ctx.moveTo(-iconSize / 4, -iconSize / 3)
    this.ctx.lineTo(iconSize / 4, 0)
    this.ctx.lineTo(-iconSize / 4, iconSize / 3)
    this.ctx.stroke()

    this.ctx.restore()
  }

  /**
   * 渲染展开的内容
   */
  private renderExpandedRow(rowIndex: number, y: number, row: any) {
    if (!this.ctx || !this.expandConfig.expandedRowRender) return

    const { colors, spacing } = this.theme
    const expandHeight = 100  // 展开行的高度，可以根据内容动态计算

    // 绘制展开行背景
    this.ctx.fillStyle = colors.hover || '#f5f5f5'
    this.ctx.fillRect(0, y, this.width, expandHeight)

    // 绘制展开行边框
    this.ctx.strokeStyle = colors.border
    this.ctx.lineWidth = spacing.border
    this.ctx.strokeRect(0, y, this.width, expandHeight)

    // 调用展开行渲染函数
    // 注意：这里简化了，实际应该渲染到 Canvas 上
    // 由于 expandedRowRender 可能返回 VNode，需要特殊处理
    // 这里暂时只绘制占位符

    this.ctx.fillStyle = colors.text
    this.ctx.font = '14px "PingFang SC", sans-serif'
    this.ctx.textAlign = 'left'
    this.ctx.textBaseline = 'top'
    this.ctx.fillText(
      `展开内容: ${JSON.stringify(row).substring(0, 50)}...`,
      spacing.padding,
      y + spacing.padding
    )
  }

  // ============================================================================
  // 排序相关
  // ============================================================================

  setSortState(field: string, order: SortOrder) {
    const oldOrder = this.sortState.get(field)
    this.sortState.set(field, order)

    // 如果排序状态改变，清除该字段的上次渲染状态，允许动画重新播放
    if (oldOrder !== order) {
      // 清除该字段的所有排序状态
      if (oldOrder) {
        this.lastRenderedSortStates.delete(`${field}_${oldOrder}`)
      }
      if (order) {
        this.lastRenderedSortStates.delete(`${field}_${order}`)
      }
      // 也清除 default 状态
      this.lastRenderedSortStates.delete(`${field}_default`)
    }

    this.render()
  }

  getSortState(field: string): SortOrder | undefined {
    return this.sortState.get(field)
  }

  clearAllSortStates() {
    this.sortState.clear()
    this.render()
  }

  // ============================================================================
  // 筛选相关
  // ============================================================================

  setFilterState(field: string, isActive: boolean) {
    const wasActive = this.filterState.has(field)

    if (isActive) {
      this.filterState.add(field)
    } else {
      this.filterState.delete(field)
    }

    // 如果筛选状态改变，清除该字段的上次渲染状态，允许动画重新播放
    if (wasActive !== isActive) {
      this.lastRenderedFilterStates.delete(`${field}_active`)
      this.lastRenderedFilterStates.delete(`${field}_inactive`)
    }

    this.render()
  }

  getFilterState(field: string): boolean {
    return this.filterState.has(field)
  }

  clearAllFilterStates() {
    this.filterState.clear()
    this.render()
  }

  // ============================================================================
  // 选择相关
  // ============================================================================

  toggleRowSelection(rowIndex: number) {
    if (this.selectedRows.has(rowIndex)) {
      this.selectedRows.delete(rowIndex)
    } else {
      this.selectedRows.add(rowIndex)
    }
    this.render()
  }

  clearSelection() {
    this.selectedRows.clear()
    this.render()
  }

  setSelectedRows(rowKeys: string[], getRowKey: (row: any) => string) {
    console.log('🔧 setSelectedRows 被调用:', { rowKeys: rowKeys.length, dataLength: this.data.length });

    this.selectedRows.clear()

    // 根据行数据查找对应的索引
    for (let i = 0; i < this.data.length; i++) {
      const row = this.data[i]
      const key = getRowKey(row)
      if (rowKeys.includes(key)) {
        this.selectedRows.add(i)
      }
    }

    console.log('✅ selectedRows 已更新:', this.selectedRows.size, '行被选中');

    // 强制完全重绘（因为 detectChanges 不会检测 selectedRows 的变化）
    const headerHeight = this.theme.spacing.header
    const cellHeight = this.theme.spacing.cell
    this.fullRender(headerHeight, cellHeight)
  }

  getSelectedRows(): number[] {
    return Array.from(this.selectedRows)
  }

  /**
   * 设置单元格选中状态
   */
  setCellSelection(selection: {
    visible: boolean
    startRow: number
    startCol: number
    endRow: number
    endCol: number
  } | null) {
    this.cellSelection = selection

    // 触发重绘
    this.render()
  }

  // ============================================================================
  // 高亮相关
  // ============================================================================

  highlightCell(cell: Cell | any) {
    if (this.highlightedCell) {
      this.clearCellHighlight(this.highlightedCell)
    }

    this.highlightedCell = cell
    if (cell && this.ctx) {
      this.applyCellHighlight(cell, true)
    }
  }

  clearHighlight() {
    if (this.highlightedCell) {
      const cell = this.highlightedCell
      this.highlightedCell = null
      this.clearCellHighlight(cell)
    }
  }

  private applyCellHighlight(cell: Cell | any, isHighlight: boolean) {
    if (!cell || !this.ctx) return

    const { row, col, x, y, width, height } = cell
    const cellHeight = this.theme.spacing.cell

    const localRowIndex = row - this.startIndex

    if (localRowIndex >= 0 && localRowIndex < this.visibleRows.length) {
      const rowData = this.visibleRows[localRowIndex]
      const column = this.columns[col]

      if (!column || !x || !width) return

      // 绘制单元格背景
      const fillColor = isHighlight ? this.theme.colors.hover : this.theme.colors.background
      this.ctx.fillStyle = fillColor
      this.ctx.fillRect(x, y, width, height || cellHeight)

      // 绘制单元格边框
      this.ctx.strokeStyle = this.theme.colors.border
      this.ctx.lineWidth = this.theme.spacing.border
      this.ctx.strokeRect(x, y, width, height || cellHeight)

      // 重新绘制文字
      this.ctx.font = `normal ${this.theme.fonts.cell.weight} ${parseInt(this.theme.fonts.cell.size)}px "PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
      this.ctx.fillStyle = this.theme.colors.text
      this.ctx.textAlign = column.align || 'left'
      this.ctx.textBaseline = 'middle'

      const dataValue = rowData[column.dataIndex || column.key]
      const text = column.render ? column.render(rowData, row, column) : String(dataValue ?? '')
      const fittedText = this.fitText(text, width - this.theme.spacing.padding * 2)
      const textX = this.getTextX(x, width, column.align || 'left', this.theme.spacing.padding)
      this.ctx.fillText(fittedText, textX, y + (height || cellHeight) / 2)
    }
  }

  private clearCellHighlight(cell: Cell | any) {
    if (!cell || !this.ctx) return

    const { row, col, x, y, width, height } = cell
    const cellHeight = this.theme.spacing.cell

    const localRowIndex = row - this.startIndex

    if (localRowIndex >= 0 && localRowIndex < this.visibleRows.length) {
      const rowData = this.visibleRows[localRowIndex]
      const column = this.columns[col]

      if (!column || !x || !width) return

      // 绘制单元格背景
      this.ctx.fillStyle = this.theme.colors.background
      this.ctx.fillRect(x, y, width, height || cellHeight)

      // 绘制单元格边框
      this.ctx.strokeStyle = this.theme.colors.border
      this.ctx.lineWidth = this.theme.spacing.border
      this.ctx.strokeRect(x, y, width, height || cellHeight)

      // 重新绘制文字
      this.ctx.font = `normal ${this.theme.fonts.cell.weight} ${parseInt(this.theme.fonts.cell.size)}px "PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
      this.ctx.fillStyle = this.theme.colors.text
      this.ctx.textAlign = column.align || 'left'
      this.ctx.textBaseline = 'middle'

      const dataValue = rowData[column.dataIndex || column.key]
      const text = column.render ? column.render(rowData, row, column) : String(dataValue ?? '')
      const fittedText = this.fitText(text, width - this.theme.spacing.padding * 2)
      const textX = this.getTextX(x, width, column.align || 'left', this.theme.spacing.padding)
      this.ctx.fillText(fittedText, textX, y + (height || cellHeight) / 2)
    }
  }

  // ============================================================================
  // 增量更新（占位符）
  // ============================================================================

  updateCell(rowIndex: number, colIndex: number, newData: any) {
    // 占位符：原生 Canvas 模式下的增量更新
    this.render()
  }

  batchUpdateCells(updates: Array<{ rowIndex: number; colIndex: number; data: any }>) {
    // 占位符：原生 Canvas 模式下的批量更新
    this.render()
  }

  beginUpdate() {
    // 占位符
  }

  endUpdate() {
    // 占位符
  }

  // ============================================================================
  // 辅助方法
  // ============================================================================

  private getColumnX(index: number): number {
    let x = 0
    for (let i = 0; i < index; i++) {
      x += this.columns[i].width || 120
    }
    return x
  }

  private getTextX(x: number, width: number, align: string, padding: number): number {
    switch (align) {
      case 'center':
        return x + width / 2
      case 'right':
        return x + width - padding
      default:
        return x + padding
    }
  }

  private getTotalColumnsWidth(): number {
    let totalWidth = 0
    for (const col of this.columns) {
      totalWidth += col.width || 120
    }
    return Math.max(totalWidth, this.width)
  }

  private fitText(text: string, maxWidth: number): string {
    if (!this.ctx) return text

    const metrics = this.ctx.measureText(text)

    if (metrics.width <= maxWidth) {
      return text
    }

    let result = text
    while (this.ctx.measureText(result).width > maxWidth && result.length > 0) {
      result = result.slice(0, -1)
    }

    return result.length > 0 ? result + '...' : ''
  }

  // ============================================================================
  // 销毁
  // ============================================================================

  destroy() {
    // 取消任何待处理的动画帧，防止内存泄漏
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

    // 清理动画状态
    this.iconAnimations.clear()

    // 清理 G2 Chart（如果已初始化）
    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
  }
}
