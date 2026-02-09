export class Point {
  constructor(public x: number, public y: number) {}
}

export class Rect {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  contains(point: Point): boolean {
    return (
      point.x >= this.x &&
      point.x <= this.x + this.width &&
      point.y >= this.y &&
      point.y <= this.y + this.height
    )
  }
}

export function measureText(
  text: string,
  font: string,
  ctx: CanvasRenderingContext2D
): number {
  ctx.font = font
  return ctx.measureText(text).width
}

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
