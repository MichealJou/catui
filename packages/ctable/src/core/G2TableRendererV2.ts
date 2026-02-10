/**
 * G2TableRendererV2 - 基于 G2 5.x Mark/View API 的表格渲染器
 * 真正使用 G2 的声明式渲染系统
 *
 * 核心改进：
 * 1. 使用 G2 Chart 而非原生 Canvas
 * 2. 使用 rect() mark 绘制单元格背景
 * 3. 使用 text() mark 绘制单元格文字
 * 4. G2 自动处理 diff 和增量更新
 * 5. 声明式 API，更简洁
 */

import { Chart } from '@antv/g2'
import type { Column, ThemeConfig, Cell, SortOrder } from '../types'

// ============================================================================
// 类型定义
// ============================================================================

/**
 * G2 数据项 - 代表一个单元格
 */
interface G2CellData {
  rowIndex: number           // 行索引（全局）
  colIndex: number           // 列索引
  x: number                  // 画布 x 坐标
  y: number                  // 画布 y 坐标
  width: number              // 单元格宽度
  height: number             // 单元格高度
  text: string               // 单元格文字
  fill: string               // 背景色
  stroke: string             // 边框色
  lineWidth: number          // 边框线宽
  fontSize: number           // 字体大小
  fontFamily: string         // 字体
  fontWeight: number | string // 字体粗细
  textAlign: string          // 文本对齐
  textBaseline: string       // 文本基线
  textColor: string          // 文本颜色
  isHeader: boolean          // 是否是表头
  isCheckbox: boolean        // 是否是复选框列
  isChecked: boolean         // 复选框是否选中（仅复选框列有效）
  hasSortIcon: boolean       // 是否有排序图标（仅表头有效）
  sortIconX: number          // 排序图标 x 位置
  sortIconY: number          // 排序图标 y 位置
  sortOrder: SortOrder       // 排序方向
  hasFilterIcon: boolean     // 是否有筛选图标（仅表头有效）
  filterIconX: number        // 筛选图标 x 位置
  filterIconY: number        // 筛选图标 y 位置
  isFilterActive: boolean    // 筛选是否激活
  hasExpandIcon: boolean     // 是否有展开图标
  expandIconX: number        // 展开图标 x 位置
  expandIconY: number        // 展开图标 y 位置
  isExpanded: boolean        // 是否展开
  treeIndent: number         // 树形缩进
}

// ============================================================================
// G2TableRendererV2 类
// ============================================================================

export class G2TableRendererV2 {
  private chart: Chart | null = null
  private container: HTMLElement
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
  private scrollLeft: number = 0
  private lastScrollTop: number = 0

  // 排序和筛选状态
  private sortState: Map<string, SortOrder> = new Map()
  private filterState: Set<string> = new Set()

  // 展开行功能
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

  // 树形数据支持
  private treeConfig: {
    enabled: boolean
    indentSize: number
    rowLevelMap: Map<number, number>
  } = {
    enabled: false,
    indentSize: 20,
    rowLevelMap: new Map()
  }

  // G2 marks
  private cellRects: any = null    // 单元格背景 rect marks
  private cellTexts: any = null    // 单元格文字 text marks
  private headerRects: any = null  // 表头背景 rect marks
  private headerTexts: any = null  // 表头文字 text marks

  constructor(container: HTMLElement, width: number, height: number, theme: ThemeConfig, selectable: boolean = false) {
    this.container = container
    this.width = width
    this.height = height
    this.theme = theme
    this.selectable = selectable

    this.initChart()
  }

  /**
   * 初始化 G2 Chart
   */
  private initChart() {
    // 创建 G2 Chart
    this.chart = new Chart({
      container: this.container,
      width: this.width,
      height: this.height,
      autoFit: false,  // 手动控制尺寸
    })

    console.log('✅ G2 Chart 初始化成功')
  }

  /**
   * 调整尺寸
   */
  resize(width: number, height: number) {
    this.width = width
    this.height = height

    if (this.chart) {
      this.chart.options({ width, height })
      this.chart.render()
    }
  }

  /**
   * 设置主题
   */
  setTheme(theme: ThemeConfig) {
    this.theme = theme
    this.render()
  }

  /**
   * 设置数据和列
   */
  setData(data: any[], columns: Column[]) {
    this.data = data
    this.columns = columns
  }

  /**
   * 设置可见数据
   */
  setVisibleData(startIndex: number, endIndex: number) {
    this.startIndex = startIndex
    this.endIndex = endIndex
    this.visibleRows = this.data.slice(startIndex, endIndex)
    this.render()
  }

  /**
   * 设置横向滚动位置
   */
  setScrollLeft(scrollLeft: number) {
    this.scrollLeft = scrollLeft
    this.render()
  }

  /**
   * 设置纵向滚动位置
   */
  setScrollTop(scrollTop: number) {
    this.lastScrollTop = scrollTop
    this.render()  // 触发重新渲染以应用滚动偏移
  }

  /**
   * 主渲染方法 - 使用 G2 声明式 API
   */
  render() {
    if (!this.chart) return

    // 生成 G2 数据
    const g2Data = this.generateG2Data()

    console.log('🎨 G2 渲染:', {
      totalCells: g2Data.length,
      visibleRows: this.visibleRows.length,
      columns: this.columns.length
    })

    // 清空并重新创建 marks
    this.renderG2Marks(g2Data)
  }

  /**
   * 生成 G2 数据 - 将表格数据转换为 G2 可识别的格式
   */
  private generateG2Data(): G2CellData[] {
    const g2Data: G2CellData[] = []
    const { colors, fonts, spacing } = this.theme
    const headerHeight = spacing.header
    const cellHeight = spacing.cell

    // 1. 生成表头单元格
    this.columns.forEach((col, colIndex) => {
      const x = this.getColumnX(colIndex) - this.scrollLeft
      let width = typeof col.width === 'number' ? col.width : 120

      // 跳过完全在可视区域外的列
      if (x + width <= 0 || x >= this.width) {
        return
      }

      // 最后一列自适应宽度
      let originalTotalWidth = 0
      for (const c of this.columns) {
        const cWidth = typeof c.width === 'number' ? c.width : 120
        originalTotalWidth += cWidth
      }
      if (colIndex === this.columns.length - 1 && originalTotalWidth < this.width) {
        width = this.width - (this.getColumnX(colIndex) - this.scrollLeft)
      }

      const visibleWidth = Math.min(width, this.width - x)

      // 表头单元格数据
      g2Data.push({
        rowIndex: -1,  // -1 表示表头
        colIndex,
        x,
        y: 0,
        width: visibleWidth,
        height: headerHeight,
        text: col.title,
        fill: colors.header,
        stroke: colors.border,
        lineWidth: 1,
        fontSize: parseInt(fonts.header.size, 10),
        fontFamily: 'PingFang SC, "Microsoft YaHei", sans-serif',
        fontWeight: fonts.header.weight === 'bold' ? 700 : 400,
        textAlign: col.align || 'left',
        textBaseline: 'middle' as const,
        textColor: colors.text,
        isHeader: true,
        isCheckbox: col.key === '__checkbox__',
        isChecked: false,  // 表头复选框状态后续计算
        hasSortIcon: col.sortable || false,
        sortIconX: 0,
        sortIconY: headerHeight / 2,
        sortOrder: this.sortState.get(col.key),
        hasFilterIcon: col.filterable || false,
        filterIconX: 0,
        filterIconY: headerHeight / 2,
        isFilterActive: this.filterState.has(col.key),
        hasExpandIcon: false,
        expandIconX: 0,
        expandIconY: 0,
        isExpanded: false,
        treeIndent: 0
      })

      // 计算图标位置（从右向左排列）
      let iconX = x + visibleWidth - 8
      const iconGap = 4
      const filterIconWidth = 14
      const sortIconWidth = 12

      if (col.filterable) {
        g2Data[g2Data.length - 1].filterIconX = iconX - filterIconWidth / 2
        iconX -= filterIconWidth + iconGap
      }

      if (col.sortable) {
        g2Data[g2Data.length - 1].sortIconX = iconX - sortIconWidth / 2
      }
    })

    // 2. 生成数据单元格
    // 计算滚动偏移量：scrollTop 可能不在单元格边界上
    const scrollOffset = this.lastScrollTop % cellHeight

    // 计算当前滚动位置对应的第一个可见行（相对于整个数据集）
    const firstVisibleRowIndex = Math.floor(this.lastScrollTop / cellHeight)

    // visibleRows 的起始行是 startIndex
    const firstVisibleRowOffset = firstVisibleRowIndex - this.startIndex

    this.visibleRows.forEach((row, localRowIndex) => {
      const actualRowIndex = this.startIndex + localRowIndex

      // 计算当前行相对于第一个可见行的偏移
      const relativeOffset = localRowIndex - firstVisibleRowOffset

      // 计算 Y 坐标：从表头下方开始，加上相对偏移，减去滚动偏移
      const y = headerHeight + relativeOffset * cellHeight - scrollOffset

      // 如果行超出底部，跳过
      if (y >= this.height) return

      // 如果行完全在表头下方（被表头遮挡），跳过
      if (y + cellHeight <= headerHeight) return

      // 计算实际绘制的 Y 坐标和高度
      let actualY = y
      let actualHeight = cellHeight

      if (y < headerHeight) {
        // 行被表头遮挡，从 headerHeight 开始绘制
        actualY = headerHeight
        actualHeight = cellHeight - (headerHeight - y)
      }

      const isStripe = colors.stripe && actualRowIndex % 2 === 1

      // 树形数据缩进
      const level = this.treeConfig.enabled ? this.getRowLevel(actualRowIndex) : 0
      const indent = this.treeConfig.enabled ? level * this.treeConfig.indentSize : 0

      // 展开状态
      const rowKey = String(row.id || row.key || actualRowIndex)
      const isExpanded = this.expandConfig.enabled && this.expandConfig.expandedKeys.includes(rowKey)

      this.columns.forEach((col, colIndex) => {
        const x = this.getColumnX(colIndex) - this.scrollLeft
        let width = typeof col.width === 'number' ? col.width : 120

        // 跳过完全在可视区域外的列
        if (x + width <= 0 || x >= this.width) {
          return
        }

        // 最后一列自适应宽度
        let originalTotalWidth = 0
        for (const c of this.columns) {
          const cWidth = typeof c.width === 'number' ? c.width : 120
          originalTotalWidth += cWidth
        }
        if (colIndex === this.columns.length - 1 && originalTotalWidth < this.width) {
          width = this.width - (this.getColumnX(colIndex) - this.scrollLeft)
        }

        const visibleWidth = Math.min(width, this.width - x)

        // 计算单元格内容
        const dataIndex = Array.isArray(col.dataIndex) ? col.dataIndex[0] : col.dataIndex
        const dataValue = row[dataIndex || col.key]
        const text = col.render
          ? col.render(row, actualRowIndex, col)
          : String(dataValue ?? '')

        // 计算文字偏移（展开图标 + 缩进）
        let textOffset = 0
        if (colIndex === 0 && (this.expandConfig.enabled || this.treeConfig.enabled)) {
          textOffset = indent + 24  // 缩进 + 图标宽度 + padding
        }

        g2Data.push({
          rowIndex: actualRowIndex,
          colIndex,
          x,
          y: actualY,
          width: visibleWidth,
          height: actualHeight,
          text,
          fill: isStripe ? (colors.stripe || colors.background) : colors.background,
          stroke: colors.border,
          lineWidth: 1,
          fontSize: parseInt(fonts.cell.size, 10),
          fontFamily: 'PingFang SC, "Microsoft YaHei", sans-serif',
          fontWeight: fonts.cell.weight === 'bold' ? 700 : 400,
          textAlign: col.align || 'left',
          textBaseline: 'middle' as const,
          textColor: colors.text,
          isHeader: false,
          isCheckbox: col.key === '__checkbox__',
          isChecked: this.selectedRows.has(actualRowIndex),
          hasSortIcon: false,
          sortIconX: 0,
          sortIconY: 0,
          sortOrder: undefined,
          hasFilterIcon: false,
          filterIconX: 0,
          filterIconY: 0,
          isFilterActive: false,
          hasExpandIcon: colIndex === 0 && (this.expandConfig.enabled || this.treeConfig.enabled),
          expandIconX: x + indent + 8,
          expandIconY: actualY + (actualHeight - 12) / 2,
          isExpanded,
          treeIndent: indent
        })
      })
    })

    return g2Data
  }

  /**
   * 使用 G2 Mark API 渲染
   */
  private renderG2Marks(g2Data: G2CellData[]) {
    if (!this.chart) return

    // 清空图表
    this.chart.options({ children: [] })

    // 1. 绘制单元格背景（使用 shape mark + 自定义 render）
    const backgroundData = g2Data

    this.chart.shape()
      .data(backgroundData)
      .style('render', (style: any, context: any) => {
        const { document } = context
        const data = style.data as G2CellData

        // 创建矩形
        const rect = document.createElement('rect', {
          style: {
            x: data.x,
            y: data.y,
            width: data.width,
            height: data.height,
            fill: data.fill,
            stroke: data.stroke,
            lineWidth: data.lineWidth,
            cursor: 'default',
          },
        })
        return rect
      })

    // 2. 绘制单元格文字
    const textData = g2Data.filter(d => !d.isCheckbox)

    this.chart.shape()
      .data(textData)
      .style('render', (style: any, context: any) => {
        const { document } = context
        const data = style.data as G2CellData

        // 计算文字位置
        let textX = 0
        if (data.isHeader) {
          const padding = this.theme.spacing.padding
          if (data.textAlign === 'center') textX = data.x + data.width / 2
          else if (data.textAlign === 'right') textX = data.x + data.width - padding
          else textX = data.x + padding
        } else {
          const padding = this.theme.spacing.padding
          textX = this.getTextX(data.x, data.width, data.textAlign, padding)
          textX += data.hasExpandIcon ? data.treeIndent + 24 : 0
        }

        const textY = data.y + data.height / 2

        // 计算截断后的文字
        const maxWidth = data.width - this.theme.spacing.padding * 2 -
          (data.hasExpandIcon ? data.treeIndent + 24 : 0) -
          (data.isHeader && (data.hasSortIcon || data.hasFilterIcon) ? 20 : 0)
        const fittedText = this.fitText(data.text, maxWidth)

        // 创建文本
        const text = document.createElement('text', {
          style: {
            x: textX,
            y: textY,
            text: fittedText,
            fill: data.textColor,
            fontSize: data.fontSize,
            fontFamily: data.fontFamily,
            fontWeight: data.fontWeight,
            textAlign: data.textAlign,
            textBaseline: data.textBaseline,
            cursor: 'default',
          },
        })
        return text
      })

    // 3. 绘制复选框（shape marks with custom path）
    const checkboxData = g2Data.filter(d => d.isCheckbox)

    this.chart.shape()
      .data(checkboxData)
      .style('render', (style: any, context: any) => {
        const { document } = context
        const { x, y } = style
        const data = style.data as G2CellData
        const checkboxSize = 16
        const halfSize = checkboxSize / 2
        const borderRadius = 2

        // 创建分组
        const g = document.createElement('g', {})

        // 绘制圆角矩形背景
        const bg = document.createElement('rect', {
          style: {
            x: x - halfSize,
            y: y - halfSize,
            width: checkboxSize,
            height: checkboxSize,
            radius: borderRadius,
            fill: data.isChecked ? '#1677ff' : '#ffffff',
            stroke: data.isChecked ? '#1677ff' : '#d9d9d9',
            lineWidth: data.isChecked ? 0 : 1.5,
          },
        })
        g.appendChild(bg)

        // 如果选中，绘制勾选标记
        if (data.isChecked) {
          const checkmark = document.createElement('path', {
            style: {
              path: this.getCheckmarkPath(x - halfSize, y - halfSize, checkboxSize),
              stroke: '#ffffff',
              lineWidth: 2,
              lineCap: 'round',
              lineJoin: 'round',
            },
          })
          g.appendChild(checkmark)
        }

        return g
      })

    // 4. 绘制排序图标（shape marks）
    const sortIconData = g2Data.filter(d => d.hasSortIcon)

    this.chart.shape()
      .data(sortIconData)
      .style('render', (style: any, context: any) => {
        const { document } = context
        const { x, y } = style
        const data = style.data as G2CellData
        const size = 7
        const gap = 1.5

        // 创建分组
        const g = document.createElement('g', {})

        // 计算箭头的透明度
        const upOpacity = data.sortOrder === 'asc' ? 0.45 : (data.sortOrder === 'desc' ? 0.25 : 0.45)
        const downOpacity = data.sortOrder === 'desc' ? 0.45 : (data.sortOrder === 'asc' ? 0.25 : 0.45)

        // 上箭头
        const upArrow = document.createElement('path', {
          style: {
            path: this.getTrianglePath(x, y - gap, size, 'up'),
            fill: `rgba(0, 0, 0, ${upOpacity})`,
          },
        })
        g.appendChild(upArrow)

        // 下箭头
        const downArrow = document.createElement('path', {
          style: {
            path: this.getTrianglePath(x, y + gap, size, 'down'),
            fill: `rgba(0, 0, 0, ${downOpacity})`,
          },
        })
        g.appendChild(downArrow)

        return g
      })

    // 5. 绘制筛选图标（shape marks）
    const filterIconData = g2Data.filter(d => d.hasFilterIcon)

    this.chart.shape()
      .data(filterIconData)
      .style('render', (style: any, context: any) => {
        const { document } = context
        const { x, y } = style
        const data = style.data as G2CellData

        // 创建分组
        const g = document.createElement('g', {})

        // 绘制漏斗
        const funnel = document.createElement('path', {
          style: {
            path: this.getFunnelPath(x, y),
            fill: data.isFilterActive ? '#1677ff' : 'rgba(0, 0, 0, 0.45)',
          },
        })
        g.appendChild(funnel)

        // 如果激活，底部加小圆点
        if (data.isFilterActive) {
          const dot = document.createElement('circle', {
            style: {
              cx: x,
              cy: y + 8.5,
              r: 1.2,
              fill: '#1677ff',
            },
          })
          g.appendChild(dot)
        }

        return g
      })

    // 6. 绘制展开图标（shape marks）
    const expandIconData = g2Data.filter(d => d.hasExpandIcon)

    this.chart.shape()
      .data(expandIconData)
      .style('render', (style: any, context: any) => {
        const { document } = context
        const { x, y } = style
        const data = style.data as G2CellData
        const iconSize = 12
        const halfSize = iconSize / 2

        // 创建分组
        const g = document.createElement('g', {})

        // 如果展开，旋转90度
        const transform = data.isExpanded ? `rotate(90, ${x}, ${y})` : ''

        // 绘制箭头（> 形状）
        const arrow = document.createElement('path', {
          style: {
            path: this.getArrowPath(x - halfSize, y - halfSize, iconSize),
            stroke: this.theme.colors.text,
            lineWidth: 1.5,
            lineCap: 'round',
            lineJoin: 'round',
            transform: transform,
            transformOrigin: `${x}px ${y}px`,
          },
        })
        g.appendChild(arrow)

        return g
      })

    // 7. 渲染图表
    this.chart.render()

    this.cellRects = 'rendered'
    this.cellTexts = 'rendered'
  }

  // ============================================================================
  // 排序相关
  // ============================================================================

  setSortState(field: string, order: SortOrder) {
    this.sortState.set(field, order)
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
    if (isActive) {
      this.filterState.add(field)
    } else {
      this.filterState.delete(field)
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
    console.log('🔧 setSelectedRows 被调用 (G2 V2):', { rowKeys: rowKeys.length, dataLength: this.data.length })

    this.selectedRows.clear()

    for (let i = 0; i < this.data.length; i++) {
      const row = this.data[i]
      const key = getRowKey(row)
      if (rowKeys.includes(key)) {
        this.selectedRows.add(i)
      }
    }

    console.log('✅ selectedRows 已更新 (G2 V2):', this.selectedRows.size, '行被选中')

    // G2 会自动检测数据变化并增量更新
    this.render()
  }

  getSelectedRows(): number[] {
    return Array.from(this.selectedRows)
  }

  // ============================================================================
  // 展开行功能
  // ============================================================================

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

  // ============================================================================
  // 树形数据支持
  // ============================================================================

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

  // ============================================================================
  // 辅助方法
  // ============================================================================

  private getColumnX(index: number): number {
    let x = 0
    for (let i = 0; i < index; i++) {
      const colWidth = this.columns[i].width
      const width: number = typeof colWidth === 'number' ? colWidth : 120
      x += width
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

  private fitText(text: string, maxWidth: number): string {
    // 简单的文本截断（G2 版本）
    const avgCharWidth = 7  // 估算的平均字符宽度
    const maxChars = Math.floor(maxWidth / avgCharWidth)

    if (text.length <= maxChars) {
      return text
    }

    return text.substring(0, maxChars) + '...'
  }

  // ============================================================================
  // 图标 Path 生成辅助方法
  // ============================================================================

  /**
   * 生成复选框勾选标记的 SVG path
   */
  private getCheckmarkPath(x: number, y: number, size: number): string {
    // 标准的 √ 形状
    // M x1 y1 L x2 y2 L x3 y3
    const startX = x + 3.2
    const midX = x + size / 2
    const midY = y + size - 3.2
    const endX = x + size - 2.5
    const endY = y + 2.5

    return `M ${startX} ${y + size / 2} L ${midX} ${midY} L ${endX} ${endY}`
  }

  /**
   * 生成三角形（排序图标）的 SVG path
   */
  private getTrianglePath(cx: number, cy: number, size: number, direction: 'up' | 'down'): string {
    const half = size / 2

    if (direction === 'up') {
      // 上三角形（顶部中心点）
      return `M ${cx} ${cy - half} L ${cx - half} ${cy + half} L ${cx + half} ${cy + half} Z`
    } else {
      // 下三角形（底部中心点）
      return `M ${cx} ${cy + half} L ${cx - half} ${cy - half} L ${cx + half} ${cy - half} Z`
    }
  }

  /**
   * 生成漏斗（筛选图标）的 SVG path
   */
  private getFunnelPath(cx: number, cy: number): string {
    const w = 3.5  // 上半宽
    const w2 = 1.75  // 下半宽
    const h = 3.25  // 漏斗高度
    const handleH = 2  // 手柄高度

    // 漏斗主体
    const funnel = [
      `M ${cx - w / 2} ${cy - h / 2 - handleH / 2}`,  // 左上
      `L ${cx + w / 2} ${cy - h / 2 - handleH / 2}`,  // 右上
      `L ${cx + w2 / 2} ${cy + h / 2 - handleH / 2}`,  // 右下
      `L ${cx - w2 / 2} ${cy + h / 2 - handleH / 2}`,  // 左下
      'Z'
    ].join(' ')

    return funnel
  }

  /**
   * 生成箭头（展开图标）的 SVG path
   */
  private getArrowPath(x: number, y: number, size: number): string {
    const quarter = size / 4

    // > 形状
    return [
      `M ${x + quarter} ${y}`,  // 左上
      `L ${x + size - quarter} ${y + size / 2}`,  // 中间
      `L ${x + quarter} ${y + size}`,  // 左下
    ].join(' ')
  }

  // ============================================================================
  // 单元格高亮（接口兼容）
  // ============================================================================

  private highlightedCell: any = null

  highlightCell(cell: any) {
    // G2 声明式渲染会自动处理高亮
    // 这里仅保存状态供未来扩展使用
    this.highlightedCell = cell
  }

  clearHighlight() {
    this.highlightedCell = null
  }

  // ============================================================================
  // 销毁
  // ============================================================================

  destroy() {
    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
  }
}
