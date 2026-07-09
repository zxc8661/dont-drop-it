// 저해상도 가상 캔버스에 정수 좌표로만 그리는 도트 프리미티브.
export type Ctx = CanvasRenderingContext2D

export function px(ctx: Ctx, x: number, y: number, color: string): void {
  ctx.fillStyle = color
  ctx.fillRect(Math.round(x), Math.round(y), 1, 1)
}

export function rect(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
): void {
  ctx.fillStyle = color
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h))
}

export function hline(ctx: Ctx, x: number, y: number, w: number, color: string): void {
  rect(ctx, x, y, w, 1, color)
}

export function vline(ctx: Ctx, x: number, y: number, h: number, color: string): void {
  rect(ctx, x, y, 1, h, color)
}

// 채워진 원 (중점 스캔라인). 도트 느낌 유지.
export function fillCircle(ctx: Ctx, cx: number, cy: number, r: number, color: string): void {
  ctx.fillStyle = color
  const r2 = r * r
  for (let dy = -r; dy <= r; dy++) {
    const dx = Math.floor(Math.sqrt(Math.max(0, r2 - dy * dy)))
    ctx.fillRect(Math.round(cx - dx), Math.round(cy + dy), dx * 2 + 1, 1)
  }
}

export function fillEllipse(
  ctx: Ctx,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: string,
): void {
  ctx.fillStyle = color
  for (let dy = -ry; dy <= ry; dy++) {
    const t = 1 - (dy * dy) / (ry * ry)
    if (t < 0) continue
    const dx = Math.floor(rx * Math.sqrt(t))
    ctx.fillRect(Math.round(cx - dx), Math.round(cy + dy), dx * 2 + 1, 1)
  }
}

// 스프라이트: 문자표 기반 도트 맵을 그린다.
export function blitSprite(
  ctx: Ctx,
  x: number,
  y: number,
  rows: string[],
  palette: Record<string, string>,
): void {
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r]
    for (let c = 0; c < row.length; c++) {
      const color = palette[row[c]]
      if (!color) continue
      px(ctx, x + c, y + r, color)
    }
  }
}
