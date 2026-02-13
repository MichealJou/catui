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
  return new Promise((resolve) => {
    // 模拟网络延迟 100ms
    setTimeout(() => {
      const data: MockDataItem[] = []
      for (let i = 1; i <= count; i++) {
        data.push({
          id: i,
          name: `用户 ${i}`,
          age: Math.floor(Math.random() * 50) + 20,
          address: `北京市朝阳区某某街道 ${i}号`,
          email: `user${i}@company.com`,
          role: ['管理员', '普通用户', '访客'][i % 3],
          status: ['在职', '离职', '休假'][i % 3]
        })
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
