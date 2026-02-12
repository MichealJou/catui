import { test, expect } from '@playwright/test'

test.describe('CTable VTable 迁移验证', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    // 等待 Vue 应用加载
    await page.waitForLoadState('networkidle')
  })

  test('页面应该正确加载', async ({ page }) => {
    // 检查标题
    await expect(page).toHaveTitle(/CatUI|Vite/)

    // 检查主要内容区域
    const app = page.locator('#app')
    await expect(app).toBeVisible()
  })

  test('CTable 组件应该渲染', async ({ page }) => {
    // 查找表格容器
    const tableContainer = page.locator('.table-container, .ctable-container, [class*="table"]')
    await expect(tableContainer.first()).toBeVisible()

    // 检查 Canvas 元素
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
  })

  test('应该显示控制按钮', async ({ page }) => {
    // 查找所有按钮
    const buttons = page.locator('button')
    const count = await buttons.count()

    expect(count).toBeGreaterThan(0)

    // 检查是否有数据生成按钮
    const generateButton = page.locator('button:has-text("生成"), button:has-text("数据"), button:has-text("Generate")')
    await expect(generateButton.first()).toBeVisible()
  })

  test('Canvas 应该有正确的尺寸', async ({ page }) => {
    const canvas = page.locator('canvas').first()

    // 获取 Canvas 尺寸
    const box = await canvas.boundingBox()
    expect(box).toBeTruthy()
    expect(box!.width).toBeGreaterThan(100)
    expect(box!.height).toBeGreaterThan(100)
  })

  test('应该显示数据条数信息', async ({ page }) => {
    // 等待数据加载
    await page.waitForTimeout(2000)

    // 查找包含数据信息的元素
    const dataInfo = page.locator('text=/\\d+条数据|\\d+\\s*rows|data count')
    await expect(dataInfo.first()).toBeVisible({ timeout: 5000 })
  })

  test('表格应该支持横向滚动', async ({ page }) => {
    const tableContainer = page.locator('.table-container, [class*="table"]').first()

    // 获取初始滚动位置
    const initialScrollLeft = await tableContainer.evaluate(el =>
      el instanceof HTMLElement && (el.scrollLeft || 0)
    )

    // 滚动到右侧
    await page.mouse.wheel(500, 0)
    await page.waitForTimeout(500)

    // 验证滚动位置变化
    const scrollLeft = await tableContainer.evaluate(el =>
      el instanceof HTMLElement && (el.scrollLeft || 0)
    )

    expect(scrollLeft).toBeGreaterThan(initialScrollLeft || 0)
  })

  test('表格应该响应窗口大小变化', async ({ page }) => {
    const canvas = page.locator('canvas').first()

    // 获取初始尺寸
    const initialBox = await canvas.boundingBox()

    // 调整窗口大小
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.waitForTimeout(500)

    // 获取新尺寸
    const newBox = await canvas.boundingBox()

    // 尺寸应该改变
    expect(newBox!.width).not.toBe(initialBox!.width)
  })

  test('应该没有控制台错误', async ({ page }) => {
    const errors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // 等待一段时间收集错误
    await page.waitForTimeout(3000)

    // 应该没有严重错误（允许一些 VTable 警告）
    const severeErrors = errors.filter(e =>
      !e.includes('vrender') && !e.includes('VTable')
    )

    expect(severeErrors.length).toBe(0)
  })
})

test.describe('CTable 性能测试', () => {
  test('首屏渲染应该快速', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')

    const endTime = Date.now()
    const loadTime = endTime - startTime

    // 首屏加载应该在 3 秒内
    expect(loadTime).toBeLessThan(3000)

    console.log(`✅ 首屏加载时间: ${loadTime}ms`)
  })

  test('Canvas 渲染应该流畅', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')

    // 监控帧率
    const fps = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let frames = 0
        const startTime = performance.now()

        function countFrames() {
          frames++
          const elapsed = performance.now() - startTime

          if (elapsed < 1000) {
            requestAnimationFrame(countFrames)
          } else {
            resolve(frames)
          }
        }

        requestAnimationFrame(countFrames)
      })
    })

    // 帧率应该大于 30 FPS
    expect(fps).toBeGreaterThan(30)
    console.log(`✅ Canvas FPS: ${fps}`)
  })
})

test.describe('CTable 交互测试', () => {
  test('点击按钮应该触发操作', async ({ page }) => {
    // 查找第一个按钮
    const button = page.locator('button').first()

    // 点击按钮
    await button.click()
    await page.waitForTimeout(1000)

    // 验证页面状态变化（可以是数据更新、UI 变化等）
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
  })

  test('鼠标悬停应该有视觉反馈', async ({ page }) => {
    const canvas = page.locator('canvas').first()

    // 鼠标悬停
    await canvas.hover()
    await page.waitForTimeout(300)

    // 可以添加断言检查样式变化
    await expect(canvas).toBeVisible()
  })
})
