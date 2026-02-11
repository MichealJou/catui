export class CheckboxRenderer {
  private size: number
  private checked: boolean = false

  constructor(size: number = 16) {
    this.size = size
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number, checked: boolean) {
    const boxSize = this.size
    const padding = 2

    ctx.strokeStyle = '#d9d9d9'
    ctx.lineWidth = 1

    if (checked) {
      ctx.fillStyle = '#1677ff'
      ctx.fillRect(x, y, boxSize, boxSize)
      ctx.strokeRect(x, y, boxSize, boxSize)

      ctx.beginPath()
      ctx.moveTo(x + 4, y + 8)
      ctx.lineTo(x + boxSize - 4, y + boxSize / 2)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(x + boxSize / 2, y + 4)
      ctx.lineTo(x + boxSize / 2, y + boxSize - 4)
      ctx.stroke()
    } else {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(x, y, boxSize, boxSize)
      ctx.strokeRect(x, y, boxSize, boxSize)
    }
  }

  hitTest(x: number, y: number, mouseX: number, mouseY: number): boolean {
    const boxSize = this.size
    return (
      mouseX >= x &&
      mouseX <= x + boxSize &&
      mouseY >= y &&
      mouseY <= y + boxSize
    )
  }
}
