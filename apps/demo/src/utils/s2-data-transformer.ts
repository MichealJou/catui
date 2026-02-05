import type { S2DataConfig, S2Options } from '@antv/s2'
import type { Column } from './types'

export interface S2TableDataConfig {
  data: any[]
  columns: Column[]
}

export class S2DataTransformer {
  /**
   * 将通用数据结构转换为 S2 数据格式
   */
  static transformToS2Data(data: any[], columns: Column[]): S2DataConfig {
    // 定义字段映射
    const fields = {
      rows: [],      // 行维度
      columns: [],   // 列维度
      values: []     // 数值字段
    }
    
    // 分类字段
    const rowFields: string[] = []
    const colFields: string[] = []
    const valueFields: string[] = []
    
    columns.forEach(col => {
      if (col.type === 'data') {
        valueFields.push(col.dataIndex || col.key)
      } else if (col.type === 'row') {
        rowFields.push(col.dataIndex || col.key)
      } else if (col.type === 'column') {
        colFields.push(col.dataIndex || col.key)
      } else {
        // 默认作为行维度
        rowFields.push(col.dataIndex || col.key)
      }
    })
    
    fields.rows = rowFields
    fields.columns = colFields
    fields.values = valueFields
    
    // 生成元数据
    const meta = columns.map(col => ({
      field: col.dataIndex || col.key,
      name: col.title || col.key,
      description: col.description,
      formatter: col.formatter,
      formatterParams: col.formatterParams
    }))
    
    return {
      fields,
      data,
      meta
    }
  }
  
  /**
   * 处理分组数据
   */
  static handleGroupedData(data: any[], groupBy: string[]): S2DataConfig {
    const fields = {
      rows: groupBy,
      columns: [],
      values: []
    }
    
    // 自动检测数值字段
    const valueFields = this.detectValueFields(data)
    fields.values = valueFields
    
    return {
      fields,
      data,
      meta: groupBy.map(field => ({
        field,
        name: field
      }))
    }
  }
  
  /**
   * 处理树形数据
   */
  static handleTreeData(data: any[], treeField: string): S2DataConfig {
    const fields = {
      rows: [treeField],
      columns: [],
      values: []
    }
    
    const valueFields = this.detectValueFields(data)
    fields.values = valueFields
    
    return {
      fields,
      data,
      meta: [
        { field: treeField, name: treeField },
        ...valueFields.map(field => ({ field, name: field }))
      ]
    }
  }
  
  /**
   * 检测数值字段
   */
  private static detectValueFields(data: any[]): string[] {
    if (!data || data.length === 0) return []
    
    const valueFields: string[] = []
    const sample = data[0]
    
    Object.keys(sample).forEach(key => {
      const value = sample[key]
      if (typeof value === 'number' || !isNaN(Number(value))) {
        valueFields.push(key)
      }
    })
    
    return valueFields
  }
  
  /**
   * 数据分页
   */
  static paginateData(data: any[], pagination: { current: number, pageSize: number }): {
    data: any[],
    total: number
  } {
    const { current = 1, pageSize = 10 } = pagination
    const startIndex = (current - 1) * pageSize
    const endIndex = startIndex + pageSize
    
    return {
      data: data.slice(startIndex, endIndex),
      total: data.length
    }
  }
  
  /**
   * 添加汇总行
   */
  static addSummaryRows(data: any[], summaryConfig: any[]): any[] {
    const summaryData = [...data]
    
    summaryConfig.forEach(config => {
      const summaryRow: any = {}
      
      Object.keys(config).forEach(key => {
        if (typeof config[key] === 'function') {
          summaryRow[key] = config[key](data)
        } else {
          summaryRow[key] = config[key]
        }
      })
      
      summaryData.push(summaryRow)
    })
    
    return summaryData
  }
  
  /**
   * 过滤数据
   */
  static filterData(data: any[], filters: Record<string, any[]>): any[] {
    return data.filter(row => {
      return Object.keys(filters).every(field => {
        const filterValues = filters[field]
        if (!filterValues || filterValues.length === 0) return true
        
        const rowValue = row[field]
        return filterValues.includes(rowValue)
      })
    })
  }
  
  /**
   * 排序数据
   */
  static sortData(data: any[], sortConfig: { field: string, direction: 'asc' | 'desc' }[]): any[] {
    const [primarySort] = sortConfig
    
    if (!primarySort) return data
    
    return [...data].sort((a, b) => {
      let aValue = a[primarySort.field]
      let bValue = b[primarySort.field]
      
      // 处理数字类型
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return primarySort.direction === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      // 处理字符串类型
      aValue = String(aValue || '')
      bValue = String(bValue || '')
      
      if (primarySort.direction === 'asc') {
        return aValue.localeCompare(bValue)
      } else {
        return bValue.localeCompare(aValue)
      }
    })
  }
}