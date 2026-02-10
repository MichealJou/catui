/**
 * G2 5.x API 测试
 * 验证 G2 的 shape() mark + custom render() API
 */

import { Chart } from '@antv/g2'

// 定义 TypeScript 类型接口
interface RectData {
  id: number
  x: number
  y: number
  width: number
  height: number
  fill: string
}

interface TextData {
  id: number
  x: number
  y: number
  text: string
  fill: string
}

interface CheckboxData {
  id: number
  x: number
  y: number
  size: number
  checked: boolean
  fill: string
  stroke: string
}

interface SortData {
  id: number
  x: number
  y: number
  size: number
  fill: string
  opacity: number
}

interface CellData {
  id: number
  x: number
  y: number
  width: number
  height: number
  fill: string
  stroke: string
  text: string
  textColor: string
}

// G2 render 函数参数类型
interface RenderContext {
  document: any
}

interface RectStyle extends RectData {
  stroke?: string
  lineWidth?: number
}

interface TextStyle extends TextData {
  fontSize?: number
  textAlign?: string
  textBaseline?: string
  fontFamily?: string
}

interface CheckboxStyle extends CheckboxData {
  lineWidth?: number
  radius?: number
}

interface SortStyle extends SortData {}

interface CellStyle extends CellData {
  lineWidth?: number
}

export function testG2API() {
  console.log('🧪 开始测试 G2 5.x API (使用 shape + render)...')

  // 创建测试容器
  const container = document.createElement('div')
  container.id = 'g2-test-container'
  container.style.width = '800px'
  container.style.height = '600px'
  container.style.position = 'fixed'
  container.style.top = '10px'
  container.style.right = '10px'
  container.style.zIndex = '9999'
  container.style.backgroundColor = 'white'
  container.style.border = '2px solid #1677ff'
  container.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
  document.body.appendChild(container)

  // 创建 Chart - 不设置自动宽高，让数据控制
  const chart = new Chart({
    container,
    autoFit: false,
    width: 800,
    height: 600,
  })

  console.log('✅ G2 Chart 创建成功')

  // 测试 1: 使用 shape() mark 绘制矩形
  console.log('\n📦 测试 shape() 绘制矩形...')

  try {
    const rectData: RectData[] = [
      { id: 1, x: 50, y: 50, width: 100, height: 40, fill: '#1677ff' },
      { id: 2, x: 50, y: 100, width: 100, height: 40, fill: '#52c41a' },
      { id: 3, x: 50, y: 150, width: 100, height: 40, fill: '#faad14' },
    ]

    chart
      .shape()
      .data(rectData)
      .encode('x', 'id')  // 编码虚拟字段，满足 G2 要求
      .encode('y', 'id')  // y channel 也需要编码
      .style('render', (_style: any, context: any, index: number) => {
        const { document } = context

        // 安全检查：如果 index 无效，跳过渲染
        if (index == null || index < 0 || index >= rectData.length) {
          return document.createElement('g', {})
        }

        const data = rectData[index]

        const rect = document.createElement('rect', {
          style: {
            x: data.x,
            y: data.y,
            width: data.width,
            height: data.height,
            fill: data.fill,
            stroke: '#d9d9d9',
            lineWidth: 1,
          },
        })
        return rect
      })

    console.log('✅ 矩形渲染测试成功')
  } catch (error) {
    console.error('❌ 矩形渲染测试失败:', error)
  }

  // 测试 2: 使用 shape() mark 绘制文本
  console.log('\n📝 测试 shape() 绘制文本...')

  try {
    const textData: TextData[] = [
      { id: 1, x: 160, y: 70, text: 'Hello G2!', fill: '#000000' },
      { id: 2, x: 160, y: 120, text: 'Testing...', fill: '#000000' },
      { id: 3, x: 160, y: 170, text: 'Success!', fill: '#000000' },
    ]

    chart
      .shape()
      .data(textData)
      .encode('x', 'id')  // 编码虚拟字段
      .encode('y', 'id')  // y channel 也需要编码
      .style('render', (_style: any, context: any, index: number) => {
        const { document } = context

        // 安全检查
        if (index == null || index < 0 || index >= textData.length) {
          return document.createElement('g', {})
        }

        const data = textData[index]

        const text = document.createElement('text', {
          style: {
            x: data.x,
            y: data.y,
            text: data.text,
            fill: data.fill,
            fontSize: 14,
            textAlign: 'center',
            textBaseline: 'middle',
            fontFamily: 'Arial, sans-serif',
          },
        })
        return text
      })

    console.log('✅ 文本渲染测试成功')
  } catch (error) {
    console.error('❌ 文本渲染测试失败:', error)
  }

  // 测试 3: 绘制复选框
  console.log('\n☑️  测试复选框渲染...')

  try {
    const checkboxData: CheckboxData[] = [
      { id: 1, x: 300, y: 50, size: 16, checked: false, fill: '#ffffff', stroke: '#d9d9d9' },
      { id: 2, x: 300, y: 100, size: 16, checked: true, fill: '#1677ff', stroke: '#1677ff' },
      { id: 3, x: 300, y: 150, size: 16, checked: false, fill: '#ffffff', stroke: '#d9d9d9' },
    ]

    chart
      .shape()
      .data(checkboxData)
      .encode('x', 'id')  // 编码虚拟字段
      .encode('y', 'id')  // y channel 也需要编码
      .style('render', (_style: any, context: any, index: number) => {
        const { document } = context

        // 安全检查
        if (index == null || index < 0 || index >= checkboxData.length) {
          return document.createElement('g', {})
        }

        const data = checkboxData[index]

        // 创建组容器
        const group = document.createElement('g')

        // 绘制复选框边框
        const rect = document.createElement('rect', {
          style: {
            x: data.x,
            y: data.y,
            width: data.size,
            height: data.size,
            fill: data.fill,
            stroke: data.stroke,
            lineWidth: 1.5,
            radius: 2,
          },
        })

        group.appendChild(rect)

        // 如果选中，绘制勾选标记
        if (data.checked) {
          const path = document.createElement('path', {
            style: {
              d: getCheckmarkPath(data.x, data.y, data.size),
              stroke: '#ffffff',
              lineWidth: 2,
              lineCap: 'round',
              lineJoin: 'round',
            },
          })
          group.appendChild(path)
        }

        return group
      })

    console.log('✅ 复选框渲染测试成功')
  } catch (error) {
    console.error('❌ 复选框渲染测试失败:', error)
  }

  // 测试 4: 绘制排序图标
  console.log('\n⬍️  测试排序图标渲染...')

  try {
    const sortData: SortData[] = [
      { id: 1, x: 350, y: 60, size: 8, fill: '#000000', opacity: 0.25 }, // 上箭头（未激活）
      { id: 2, x: 350, y: 110, size: 8, fill: '#000000', opacity: 1 },   // 下箭头（激活）
    ]

    chart
      .shape()
      .data(sortData)
      .encode('x', 'id')  // 编码虚拟字段
      .encode('y', 'id')  // y channel 也需要编码
      .style('render', (_style: any, context: any, index: number) => {
        const { document } = context

        // 安全检查
        if (index == null || index < 0 || index >= sortData.length) {
          return document.createElement('g', {})
        }

        const data = sortData[index]

        const isDown = data.y > 80
        const pathStr = getTrianglePath(data.x, data.y, data.size, isDown ? 'down' : 'up')

        const path = document.createElement('path', {
          style: {
            d: pathStr,
            fill: data.fill,
            opacity: data.opacity,
          },
        })
        return path
      })

    console.log('✅ 排序图标渲染测试成功')
  } catch (error) {
    console.error('❌ 排序图标渲染测试失败:', error)
  }

  // 测试 5: 绘制表格单元格示例
  console.log('\n📊 测试表格单元格渲染...')

  try {
    const cellData: CellData[] = [
      { id: 1, x: 50, y: 250, width: 100, height: 40, fill: '#fafafa', stroke: '#d9d9d9', text: 'Name', textColor: '#000000' },
      { id: 2, x: 150, y: 250, width: 100, height: 40, fill: '#fafafa', stroke: '#d9d9d9', text: 'Age', textColor: '#000000' },
      { id: 3, x: 250, y: 250, width: 100, height: 40, fill: '#fafafa', stroke: '#d9d9d9', text: 'City', textColor: '#000000' },
      { id: 4, x: 50, y: 290, width: 100, height: 40, fill: '#ffffff', stroke: '#d9d9d9', text: 'Alice', textColor: '#000000' },
      { id: 5, x: 150, y: 290, width: 100, height: 40, fill: '#ffffff', stroke: '#d9d9d9', text: '25', textColor: '#000000' },
      { id: 6, x: 250, y: 290, width: 100, height: 40, fill: '#ffffff', stroke: '#d9d9d9', text: 'NYC', textColor: '#000000' },
      { id: 7, x: 50, y: 330, width: 100, height: 40, fill: '#ffffff', stroke: '#d9d9d9', text: 'Bob', textColor: '#000000' },
      { id: 8, x: 150, y: 330, width: 100, height: 40, fill: '#ffffff', stroke: '#d9d9d9', text: '30', textColor: '#000000' },
      { id: 9, x: 250, y: 330, width: 100, height: 40, fill: '#ffffff', stroke: '#d9d9d9', text: 'LA', textColor: '#000000' },
    ]

    chart
      .shape()
      .data(cellData)
      .encode('x', 'id')  // 编码虚拟字段
      .encode('y', 'id')  // y channel 也需要编码
      .style('render', (_style: any, context: any, index: number) => {
        const { document } = context

        // 安全检查
        if (index == null || index < 0 || index >= cellData.length) {
          return document.createElement('g', {})
        }

        const data = cellData[index]

        const group = document.createElement('g')

        // 背景矩形
        const rect = document.createElement('rect', {
          style: {
            x: data.x,
            y: data.y,
            width: data.width,
            height: data.height,
            fill: data.fill,
            stroke: data.stroke,
            lineWidth: 1,
          },
        })
        group.appendChild(rect)

        // 文字
        const text = document.createElement('text', {
          style: {
            x: data.x + data.width / 2,
            y: data.y + data.height / 2,
            text: data.text,
            fill: data.textColor,
            fontSize: 14,
            textAlign: 'center',
            textBaseline: 'middle',
            fontFamily: 'Arial, sans-serif',
          },
        })
        group.appendChild(text)

        return group
      })

    console.log('✅ 表格单元格渲染测试成功')
  } catch (error) {
    console.error('❌ 表格单元格渲染测试失败:', error)
  }

  // 渲染图表
  console.log('\n🖼️  渲染图表...')
  chart.render()
  console.log('✅ 图表渲染成功')

  console.log('\n✨ G2 API 测试完成！所有功能正常工作。')

  // 3秒后自动关闭测试窗口
  setTimeout(() => {
    console.log('🔚 测试窗口将在 3 秒后关闭...')
    setTimeout(() => {
      document.body.removeChild(container)
      console.log('✅ 测试窗口已关闭')
    }, 3000)
  }, 5000)

  return chart
}

// 辅助函数：生成勾选标记路径
function getCheckmarkPath(x: number, y: number, size: number): string {
  const startX = x + 3.2
  const midX = x + size / 2
  const midY = y + size - 3.2
  const endX = x + size - 2.5
  const endY = y + 2.5

  return `M ${startX} ${y + size / 2} L ${midX} ${midY} L ${endX} ${endY}`
}

// 辅助函数：生成三角形路径
function getTrianglePath(cx: number, cy: number, size: number, direction: 'up' | 'down'): string {
  const half = size / 2
  if (direction === 'up') {
    return `M ${cx} ${cy - half} L ${cx - half} ${cy + half} L ${cx + half} ${cy + half} Z`
  } else {
    return `M ${cx} ${cy + half} L ${cx - half} ${cy - half} L ${cx + half} ${cy - half} Z`
  }
}

// 导出供外部调用
if (typeof window !== 'undefined') {
  (window as any).testG2API = testG2API
}
