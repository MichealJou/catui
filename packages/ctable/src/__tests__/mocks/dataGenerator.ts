/**
 * Mock 数据生成器
 * 使用 faker 生成测试数据
 */

import faker from 'faker'
import type { Column } from '../../types'

// 设置中文
faker.locale = 'zh_CN'

export interface TestData {
  id: number
  name: string
  age: number
  email: string
  phone: string
  address: string
  city: string
  country: string
  zip: string
  job: string
  salary: number
  date: string
  status: 'active' | 'inactive' | 'pending'
}

/**
 * 生成测试数据
 */
export function generateTestData(count: number): TestData[] {
  const data: TestData[] = []

  for (let i = 1; i <= count; i++) {
    data.push({
      id: i,
      name: faker.name.findName(),
      age: faker.datatype.number({ min: 20, max: 60 }),
      email: faker.internet.email(),
      phone: faker.phone.phoneNumber(),
      address: faker.address.streetAddress(),
      city: faker.address.city(),
      country: faker.address.country(),
      zip: faker.address.zipCode(),
      job: faker.name.jobTitle(),
      salary: faker.datatype.number({ min: 5000, max: 50000 }),
      date: faker.date.recent().toISOString().split('T')[0],
      status: faker.random.arrayElement(['active', 'inactive', 'pending']) as any
    })
  }

  return data
}

/**
 * 生成列配置
 */
export function generateTestColumns(): Column[] {
  return [
    {
      key: 'id',
      title: 'ID',
      width: 80,
      align: 'center',
      sortable: true
    },
    {
      key: 'name',
      title: '姓名',
      width: 120,
      align: 'left',
      sortable: true,
      filterable: true
    },
    {
      key: 'age',
      title: '年龄',
      width: 80,
      align: 'center',
      sortable: true,
      filterable: true
    },
    {
      key: 'email',
      title: '邮箱',
      width: 200,
      align: 'left'
    },
    {
      key: 'phone',
      title: '电话',
      width: 150,
      align: 'left'
    },
    {
      key: 'city',
      title: '城市',
      width: 120,
      align: 'left',
      filterable: true
    },
    {
      key: 'job',
      title: '职业',
      width: 150,
      align: 'left',
      filterable: true
    },
    {
      key: 'salary',
      title: '薪资',
      width: 100,
      align: 'right',
      sortable: true
    },
    {
      key: 'status',
      title: '状态',
      width: 100,
      align: 'center',
      filterable: true
    },
    {
      key: 'date',
      title: '日期',
      width: 120,
      align: 'center',
      sortable: true
    }
  ]
}

/**
 * 预定义的测试数据集
 */
export const testDataSets = {
  small: {
    count: 10,
    description: '小数据集（10条）'
  },
  medium: {
    count: 100,
    description: '中等数据集（100条）'
  },
  large: {
    count: 1000,
    description: '大数据集（1000条）'
  },
  xlarge: {
    count: 10000,
    description: '超大数据集（10000条）'
  }
}

/**
 * 生成带有层级关系的数据（树形数据）
 */
export function generateTreeData(depth: number, childrenPerNode: number = 3): any[] {
  let id = 0

  function createNode(level: number): any {
    const node: any = {
      id: ++id,
      name: `节点 ${id}`,
      value: faker.datatype.number({ min: 100, max: 1000 })
    }

    if (level < depth) {
      node.children = []
      for (let i = 0; i < childrenPerNode; i++) {
        node.children.push(createNode(level + 1))
      }
    }

    return node
  }

  return Array.from({ length: 5 }, () => createNode(1))
}
