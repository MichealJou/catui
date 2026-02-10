export class CheckboxRenderer {
  private size: number
  private checked: boolean = false

  constructor(size: number = 16) {
    this.size = size
  }

  draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    checked: boolean
  ) {
    const boxSize = this.size
    const borderRadius = 2  // Ant Design 风格圆角

    // Ant Design 颜色规范
    const colors = {
      primary: '#1677ff',
      border: '#d9d9d9',
      borderHover: '#4096ff',
      bgChecked: '#1677ff',
      bgUnchecked: '#ffffff',
      checkmark: '#ffffff'
    }

    // 绘制圆角矩形背景
    this.roundRect(ctx, x, y, boxSize, boxSize, borderRadius)

    if (checked) {
      // 选中状态：蓝色背景
      ctx.fillStyle = colors.bgChecked
      ctx.fill()

      // 绘制白色勾选标记 - Ant Design 风格
      ctx.strokeStyle = colors.checkmark
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      // 绘制标准的 "√" 形状
      ctx.beginPath()
      // 从左下开始 (约 1/4, 1/2 位置)
      ctx.moveTo(x + 3.2, y + boxSize / 2)
      // 到中间 (约 1/2, 3/4 位置)
      ctx.lineTo(x + boxSize / 2, y + boxSize - 3.2)
      // 到右上 (约 3/4, 1/4 位置)
      ctx.lineTo(x + boxSize - 2.5, y + 2.5)
      ctx.stroke()
    } else {
      // 未选中状态：白色背景 + 灰色边框
      ctx.fillStyle = colors.bgUnchecked
      ctx.fill()

      ctx.strokeStyle = colors.border
      ctx.lineWidth = 1.5  // 稍微加粗边框使其更清晰
      ctx.stroke()
    }
  }

  /**
   * 绘制圆角矩形
   */
  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }

  hitTest(
    x: number,
    y: number,
    mouseX: number,
    mouseY: number
  ): boolean {
    const boxSize = this.size
    return (
      mouseX >= x &&
      mouseX <= x + boxSize &&
      mouseY >= y &&
      mouseY <= y + boxSize
    )
  }
}
