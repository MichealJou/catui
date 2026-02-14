/**
 * Mock 数据 API
 * 模拟后端 API 调用，动态生成表格数据
 */

export interface MockDataItem {
  id: number
  name: string
  age: number
  address: string
  email: string
  role: string
  status: string
}

/**
 * 生成表格数据
 * @param count 生成数据条数，默认 10000
 * @returns Promise 模拟异步 API 调用
 */
export function generateTableData(count: number = 10000): Promise<MockDataItem[]> {
  return new Promise(resolve => {
    // 模拟网络延迟 100ms
    setTimeout(async () => {
      const data: MockDataItem[] = new Array(count)
      const roles = ['管理员', '普通用户', '访客'] as const
      const statuses = ['在职', '离职', '休假'] as const
      const surnames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴'] as const
      const givenNames = ['伟', '敏', '静', '磊', '洋', '艳', '勇', '杰', '涛', '娜'] as const
      const chunkSize = count >= 200000 ? 10000 : 5000
      const hash = (n: number) => ((n * 1103515245 + 12345) >>> 0)

      // 大数据量分批构造，避免长时间阻塞主线程导致页面卡死。
      for (let start = 0; start < count; start += chunkSize) {
        const end = Math.min(start + chunkSize, count)
        for (let i = start; i < end; i++) {
          const rowId = i + 1
          const h1 = hash(rowId)
          const h2 = hash(rowId + 97)
          const h3 = hash(rowId + 193)
          const name = `${surnames[h1 % surnames.length]}${givenNames[h2 % givenNames.length]}`
          const districtNo = (h2 % 99) + 1
          data[i] = {
            id: rowId,
            name: `${name}${rowId}`,
            age: 22 + (h1 % 38),
            address: `北京市朝阳区${districtNo}号街道 ${rowId}号`,
            email: `user${rowId}@company.com`,
            role: roles[h2 % 3],
            status: statuses[h3 % 3]
          }
        }
        await new Promise<void>(r => setTimeout(r, 0))
      }

      resolve(data)
    }, 100)
  })
}

/**
 * 获取表格数据 - 模拟 GET /api/table
 * @param count 数据条数
 */
export async function getTableData(count: number = 10000): Promise<MockDataItem[]> {
  return generateTableData(count)
}

/**
 * 添加一行数据 - 模拟 POST /api/table
 * @param data 现有数据
 * @returns 新数据
 */
export function addTableRow(data: MockDataItem[]): MockDataItem {
  const newId = data.length > 0 ? Math.max(...data.map(d => d.id)) + 1 : 1
  return {
    id: newId,
    name: `用户 ${newId}`,
    age: Math.floor(Math.random() * 50) + 20,
    address: `北京市朝阳区某某街道 ${newId}号`,
    email: `user${newId}@company.com`,
    role: '普通用户',
    status: '在职'
  }
}

/**
 * 批量操作类型
 */
export type BatchActionType = 'delete' | 'export' | 'archive'

/**
 * 批量操作 - 模拟 POST /api/table/batch
 * @param action 操作类型
 * @param ids 选中的 ID 列表
 */
export async function batchAction(
  action: BatchActionType,
  ids: number[]
): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `成功${action === 'delete' ? '删除' : action === 'export' ? '导出' : '归档'} ${ids.length} 条数据`
      })
    }, 200)
  })
}
