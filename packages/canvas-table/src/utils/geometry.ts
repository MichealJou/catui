/**
 * 几何工具类
 */

/**
 * 点
 */
export class Point {
  constructor(public x: number, public y: number) {}

  /**
   * 计算到另一个点的距离
   */
  distanceTo(other: Point): number {
    const dx = this.x - other.x
    const dy = this.y - other.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * 克隆点
   */
  clone(): Point {
    return new Point(this.x, this.y)
  }

  /**
   * 判断点是否相等
   */
  equals(other: Point): boolean {
    return this.x === other.x && this.y === other.y
  }
}

/**
 * 矩形
 */
export class Rect {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  /**
   * 判断点是否在矩形内
   */
  contains(point: Point): boolean {
    return (
      point.x >= this.x &&
      point.x <= this.x + this.width &&
      point.y >= this.y &&
      point.y <= this.y + this.height
    )
  }

  /**
   * 判断矩形是否相交
   */
  intersects(other: Rect): boolean {
    return !(
      this.x + this.width < other.x ||
      other.x + other.width < this.x ||
      this.y + this.height < other.y ||
      other.y + other.height < this.y
    )
  }

  /**
   * 获取中心点
   */
  getCenter(): Point {
    return new Point(
      this.x + this.width / 2,
      this.y + this.height / 2
    )
  }

  /**
   * 克隆矩形
   */
  clone(): Rect {
    return new Rect(this.x, this.y, this.width, this.height)
  }
}

/**
 * 文本测量工具
 */

/**
 * 测量文本宽度
 */
export function measureText(
  text: string,
  font: string,
  ctx: CanvasRenderingContext2D
): number {
  ctx.font = font
  return ctx.measureText(text).width
}

/**
 * 文本自动省略
 */
export function fitText(
  text: string,
  maxWidth: number,
  font: string,
  ctx: CanvasRenderingContext2D
): string {
  let ellipsis = '...'
  let width = measureText(text, font, ctx)

  if (width <= maxWidth) {
    return text
  }

  while (width > maxWidth && text.length > 0) {
    text = text.slice(0, -1)
    width = measureText(text + ellipsis, font, ctx)
  }

  return text + ellipsis
}

/**
 * 多行文本处理
 */
export function wrapText(
  text: string,
  maxWidth: number,
  font: string,
  ctx: CanvasRenderingContext2D
): string[] {
  ctx.font = font
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

/**
 * 计算多行文本高度
 */
export function getTextHeight(
  lines: string[],
  lineHeight: number
): number {
  return lines.length * lineHeight
}
