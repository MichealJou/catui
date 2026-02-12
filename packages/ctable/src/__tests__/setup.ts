/**
 * Vitest 测试设置文件
 */

import { vi } from 'vitest'

// Mock Canvas API
class MockCanvasRenderingContext2D {
  fillStyle = ''
  strokeStyle = ''
  lineWidth = 1
  font = '12px Arial'
  textAlign = 'left' as const
  textBaseline = 'top' as const
  globalAlpha = 1
  canvas = { width: 800, height: 600 }

  fillRect() {}
  strokeRect() {}
  fillText() {}
  strokeText() {}
  beginPath() {}
  closePath() {}
  moveTo() {}
  lineTo() {}
  arc() {}
  clearRect() {}
  save() {}
  restore() {}
  clip() {}
  scale() {}
  rotate() {}
  translate() {}
  transform() {}
  measureText(text: string) { return { width: text.length * 6 } }
}

class MockCanvas {
  width = 800
  height = 600
  contextType: '2d' | null = null

  getContext(contextType: string) {
    if (contextType === '2d') {
      this.contextType = '2d'
      return new MockCanvasRenderingContext2D() as any
    }
    return null
  }

  toDataURL() { return '' }
  toBlob() {}
}

// VTable 需要全局 createCanvas 函数
global.createCanvas = vi.fn((width: number, height: number) => {
  const canvas = new MockCanvas()
  canvas.width = width
  canvas.height = height
  return canvas as any
}) as any

global.HTMLCanvasElement.prototype.getContext = vi.fn(function(this: HTMLCanvasElement, contextType: string) {
  if (contextType === '2d') {
    return new MockCanvasRenderingContext2D() as any
  }
  return null
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16))
global.cancelAnimationFrame = vi.fn()

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = vi.fn(function(this: Element) {
  return {
    width: 800,
    height: 600,
    top: 0,
    left: 0,
    bottom: 600,
    right: 800,
    x: 0,
    y: 0,
    toJSON: vi.fn()
  }
})
