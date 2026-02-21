import { computed, type ComputedRef, type Ref } from 'vue'
import type { CTableProps, Column, SortOrder, SorterConfig } from '../types'

interface UseTablePipelineOptions {
  props: CTableProps
  currentData: ComputedRef<any[]>
  isTreeMode: ComputedRef<boolean>
  treeChildrenField: ComputedRef<string>
  internalSorter: Ref<SorterConfig | null>
  internalFilters: Ref<Record<string, any[]>>
  keywordFilterTokenPrefix: string
  paginationConfig: ComputedRef<any>
  currentPage: Ref<number>
  pageSize: Ref<number>
}

export function useTablePipeline(options: UseTablePipelineOptions) {
  const getColumnField = (column: any): string => {
    const dataIndex = column?.dataIndex
    if (Array.isArray(dataIndex) && dataIndex.length > 0) {
      return String(dataIndex[0])
    }
    if (typeof dataIndex === 'string' && dataIndex.length > 0) {
      return dataIndex
    }
    return String(column?.key ?? '')
  }

  const getRecordValue = (record: any, column: any) => {
    const dataIndex = column?.dataIndex
    if (Array.isArray(dataIndex) && dataIndex.length > 0) {
      return dataIndex.reduce((acc: any, key: string) => acc?.[key], record)
    }
    const field = typeof dataIndex === 'string' && dataIndex.length > 0 ? dataIndex : column?.key
    return record?.[field]
  }

  const normalizeSortOrder = (order: any): 'asc' | 'desc' | null => {
    if (order === 'asc' || order === 'ascend') return 'asc'
    if (order === 'desc' || order === 'descend') return 'desc'
    return null
  }

  const getColumnSorter = (column: any): ((a: any, b: any) => number) | null => {
    if (!column) return null
    if (typeof column.sorter === 'function') return column.sorter
    if (typeof column.sorter === 'object' && typeof column.sorter?.sorter === 'function') {
      return column.sorter.sorter
    }
    return null
  }

  const getColumnMultiple = (column: any): number => {
    if (!column) return 0
    if (typeof column.sorter === 'object' && typeof column.sorter?.multiple === 'number') {
      return column.sorter.multiple
    }
    return 0
  }

  const effectiveSortMode = computed(() => {
    if (options.props.sortMode === 'remote') return 'remote'
    if (options.props.sortMode === 'local') return 'local'
    return options.props.onSortRequest ? 'remote' : 'local'
  })

  const effectiveFilterMode = computed(() => {
    if (options.props.filterMode === 'remote') return 'remote'
    if (options.props.filterMode === 'local') return 'local'
    return options.props.onFilterRequest ? 'remote' : 'local'
  })

  const effectivePaginationMode = computed(() => {
    if (options.props.paginationMode === 'remote') return 'remote'
    if (options.props.paginationMode === 'local') return 'local'
    return 'local'
  })

  const buildActiveSorters = (): SorterConfig[] => {
    const columns = options.props.columns || []
    const sorters: SorterConfig[] = []
    const seen = new Set<string>()

    const appendSorter = (field: string, order: SortOrder, multiple = 0) => {
      if (!field || !order || seen.has(field)) return
      const column = columns.find(col => getColumnField(col) === field)
      sorters.push({
        field,
        order,
        sorter: getColumnSorter(column),
        multiple
      })
      seen.add(field)
    }

    if (Array.isArray(options.props.sortConfig) && options.props.sortConfig.length > 0) {
      options.props.sortConfig.forEach(cfg => {
        appendSorter(String(cfg.field ?? ''), normalizeSortOrder(cfg.order), Number(cfg.multiple ?? 0))
      })
    } else {
      const controlledColumns = columns
        .map(col => ({
          field: getColumnField(col),
          order: normalizeSortOrder(col.sortOrder),
          multiple: getColumnMultiple(col)
        }))
        .filter(item => item.order)
        .sort((a, b) => Number(b.multiple ?? 0) - Number(a.multiple ?? 0))

      controlledColumns.forEach(item => {
        appendSorter(item.field, item.order, item.multiple)
      })

      if (sorters.length === 0 && options.internalSorter.value) {
        appendSorter(
          String(options.internalSorter.value.field ?? ''),
          normalizeSortOrder(options.internalSorter.value.order),
          Number(options.internalSorter.value.multiple ?? 0)
        )
      }
    }

    return sorters
  }

  const compareRecordsBySorters = (
    a: any,
    b: any,
    columns: Column[],
    activeSorters: SorterConfig[]
  ) => {
    for (const sorterConfig of activeSorters) {
      const order = normalizeSortOrder(sorterConfig.order)
      if (!order) continue
      const sortColumn = columns.find(col => getColumnField(col) === sorterConfig.field)
      if (!sortColumn) continue

      const sorter = getColumnSorter(sortColumn)
      const base = (() => {
        if (sorter) return sorter(a, b)
        if (options.props.localSorter) {
          return options.props.localSorter(a, b, sortColumn, order)
        }
        const va = getRecordValue(a, sortColumn)
        const vb = getRecordValue(b, sortColumn)
        if (va == null && vb == null) return 0
        if (va == null) return -1
        if (vb == null) return 1
        if (typeof va === 'number' && typeof vb === 'number') return va - vb
        return String(va).localeCompare(String(vb))
      })()
      if (base !== 0) {
        return order === 'desc' ? -base : base
      }
    }
    return 0
  }

  const sortTreeRecords = (
    rows: any[],
    columns: Column[],
    activeSorters: SorterConfig[],
    childrenField: string
  ) => {
    const sorted = rows.slice().sort((a, b) => compareRecordsBySorters(a, b, columns, activeSorters))
    return sorted.map(record => {
      const children = record?.[childrenField]
      if (!Array.isArray(children) || children.length === 0) {
        return record
      }
      return {
        ...record,
        [childrenField]: sortTreeRecords(children, columns, activeSorters, childrenField)
      }
    })
  }

  const processedData = computed(() => {
    const source = options.currentData.value || []
    if (!Array.isArray(source) || source.length === 0) {
      return []
    }
    const columns = options.props.columns || []
    const activeSorters = buildActiveSorters()

    if (options.isTreeMode.value) {
      if (effectiveSortMode.value === 'local' && activeSorters.length > 0) {
        return sortTreeRecords(source, columns, activeSorters, options.treeChildrenField.value)
      }
      return source
    }

    let result = source.slice()

    if (effectiveFilterMode.value === 'local') {
      const filterColumns = columns.filter(col => {
        const field = getColumnField(col)
        const controlled = Array.isArray(col.filteredValue) ? col.filteredValue : undefined
        const uncontrolled = options.internalFilters.value[field]
        return (controlled && controlled.length > 0) || (uncontrolled && uncontrolled.length > 0)
      })

      if (filterColumns.length > 0) {
        result = result.filter(record =>
          filterColumns.every(col => {
            const field = getColumnField(col)
            const controlled = Array.isArray(col.filteredValue) ? col.filteredValue : undefined
            const selected = controlled ?? options.internalFilters.value[field] ?? []
            if (selected.length === 0) return true
            const selectedText = selected.map(v => String(v))
            const keywordTokens = selectedText.filter(v => v.startsWith(options.keywordFilterTokenPrefix))
            if (keywordTokens.length > 0) {
              const valueText = String(getRecordValue(record, col) ?? '').toLowerCase()
              const keywordMatch = keywordTokens.some(token =>
                valueText.includes(token.slice(options.keywordFilterTokenPrefix.length).toLowerCase())
              )
              const exactValues = selectedText.filter(v => !v.startsWith(options.keywordFilterTokenPrefix))
              if (exactValues.length === 0) {
                return keywordMatch
              }
              return keywordMatch || exactValues.includes(String(getRecordValue(record, col)))
            }
            if (typeof col.onFilter === 'function') {
              return selected.some(v => col.onFilter?.(v, record))
            }
            const value = getRecordValue(record, col)
            return selected.includes(value) || selected.map(v => String(v)).includes(String(value))
          })
        )
      }
    }

    if (activeSorters.length > 0 && effectiveSortMode.value === 'local') {
      result.sort((a, b) => compareRecordsBySorters(a, b, columns, activeSorters))
    }

    return result
  })

  const total = computed(() => {
    return options.paginationConfig.value?.total ?? processedData.value.length
  })

  const paginatedData = computed(() => {
    if (effectivePaginationMode.value === 'remote') {
      return processedData.value
    }
    if (!options.paginationConfig.value) {
      return processedData.value
    }
    const start = (options.currentPage.value - 1) * options.pageSize.value
    const end = start + options.pageSize.value
    return processedData.value.slice(start, end)
  })

  return {
    getColumnField,
    getRecordValue,
    normalizeSortOrder,
    effectiveSortMode,
    effectiveFilterMode,
    effectivePaginationMode,
    buildActiveSorters,
    processedData,
    total,
    paginatedData
  }
}

