/**
 * VTable 类型声明
 * 基于 @visactor/vtable 官方 API
 */

declare module '@visactor/vtable' {
  /**
   * VTable 列配置选项
   */
  export interface ColumnOption {
    /** 字段名 */
    field: string | string[]  // 支持多级字段如 ['details', 'productName']
    /** 列标题 */
    title: string
    /** 列宽 */
    width?: number | 'auto'
    /** 固定列：'start' 左侧固定 | 'end' 右侧固定 */
    frozen?: 'start' | 'end'
    /** 是否可排序 */
    sort?: boolean
    /** 自定义单元格渲染器 */
    cellRenderer?: (args: CellRendererArgs) => any
  }

  /**
   * VTable 选项配置
   */
  export interface ListTableOptions {
    /** 数据记录（VTable 使用 records） */
    records: any[]
    /** 列配置 */
    columns: ColumnOption[]
    /** 表格宽度 */
    width?: number
    /** 表格高度 */
    height?: number
    /** 左侧固定列数量 */
    frozenColCount?: number
    /** 右侧固定列数量 */
    frozenColEndCount?: number
    /** 主题配置 */
    theme?: any
    /** 是否启用虚拟滚动 */
    virtual?: boolean
    /** 事件监听器 */
    listeners?: {
      cellClick?: (args: any) => void
      rowClick?: (args: any) => void
      scroll?: (args: any) => void
    }
  }

  /**
   * 单元格渲染器参数
   */
  export interface CellRendererArgs {
    table: any
    col: any
    row: any
    value: any
  }

  /**
   * VTable ListTable 类
   */
  export class ListTable {
    constructor(options: ListTableOptions)
    /** 更新数据记录 */
    setRecords(data: any[]): void
    /** 获取数据记录 */
    getRecords(): any[]
    /** 添加记录 */
    addRecords(records: any[]): void
    /** 添加单条记录 */
    addRecord(record: any): void
    /** 删除记录 */
    deleteRecords(recordIndexs: number[]): void
    /** 修改记录 */
    updateRecords(records: any[], recordIndexs: (number | number[])[]): void
    /** 修改单元格值 */
    changeCellValue(col: number, row: number, value: any): void
    /** 获取记录索引 */
    getRecordIndexByCell(col: number, row: number): number | number[]
    /** 销毁表格 */
    destroy(): void
  }

  /**
   * 创建 ListTable 实例
   */
  export function createListTable(
    container: HTMLElement | string,
    options: ListTableOptions
  ): ListTable
}
