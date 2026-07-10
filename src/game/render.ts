import { BEAM_HALF, FLOOR_TOP, PAPER_H, PAPER_W, VH, VW } from './constants'
import { parkAmount, skyAmount, spaceAmount, stratoAmount } from './engine'
import { fillCircle, fillEllipse, hline, px, rect, type Ctx } from './pixel'
import type { GameState, PaperVariant } from './types'

// ── 방 안 배경 (따뜻하고 밝은 실내, 벽돌 없음) ──────────────
const WALL_TOP = '#fbe6c8'
const WALL_BOT = '#f6d3a4'
const WOOD = '#c79a5f'
const WOOD_DARK = '#a97c42'
const WOOD_LINE = '#8f6534'

export function drawBackground(ctx: Ctx, s: GameState): void {
  drawRoom(ctx, s)
  // 스테이지가 진행될수록 상위 배경이 크로스페이드로 덮인다.
  overlay(ctx, parkAmount(s), () => drawPark(ctx, s))
  overlay(ctx, skyAmount(s), () => drawSky(ctx, s))
  overlay(ctx, stratoAmount(s), () => drawStrato(ctx, s))
  overlay(ctx, spaceAmount(s), () => drawSpace(ctx, s))
}

function overlay(ctx: Ctx, a: number, draw: () => void): void {
  if (a <= 0) return
  ctx.globalAlpha = a
  draw()
  ctx.globalAlpha = 1
}

function drawRoom(ctx: Ctx, s: GameState): void {
  // 벽 (부드러운 세로 그라데이션)
  const bands = 6
  for (let i = 0; i < bands; i++) {
    const t = i / (bands - 1)
    rect(ctx, 0, (VH * i) / bands, VW, VH / bands + 1, mix(WALL_TOP, WALL_BOT, t))
  }

  drawRoomDecor(ctx, s)

  // 창문에서 스며드는 은은한 빛 (리듬 비트에 살짝 밝아짐)
  const pulse = 0.06 + 0.04 * Math.pow(1 - s.beat, 2)
  ctx.globalAlpha = pulse
  fillCircle(ctx, VW / 2, VH / 2, 100, '#fffdf0')
  ctx.globalAlpha = 1
}

// ── 공원(야외) 배경 ───────────────────────────────────────
const SKY_HI = '#8fd3ff'
const SKY_LO = '#d3f0ff'

function drawPark(ctx: Ctx, s: GameState): void {
  // 하늘 그라데이션
  const bands = 6
  for (let i = 0; i < bands; i++) {
    rect(ctx, 0, (VH * i) / bands, VW, VH / bands + 1, mix(SKY_HI, SKY_LO, i / (bands - 1)))
  }
  // 해 + 빛무리
  fillCircle(ctx, VW - 22, 26, 10, '#fff4b0')
  fillCircle(ctx, VW - 22, 26, 7, '#ffe36b')

  // 세로로 반복 스크롤되는 구름/나무 (위→아래, 올라가는 느낌)
  const P = 110
  const off = ((s.scroll * 0.5) % P + P) % P
  const base = Math.floor((s.scroll * 0.5) / P)
  for (let i = -1; i < VH / P + 2; i++) {
    const y = i * P + off
    const k = base - i
    if (((k % 2) + 2) % 2 === 0) {
      drawCloud(ctx, Math.round(VW * 0.28), Math.round(y + 20))
      drawTreeTop(ctx, Math.round(VW * 0.8), Math.round(y + 60))
    } else {
      drawCloud(ctx, Math.round(VW * 0.72), Math.round(y + 30))
      drawTreeTop(ctx, Math.round(VW * 0.18), Math.round(y + 70))
    }
  }
}

function drawCloud(ctx: Ctx, cx: number, cy: number): void {
  fillEllipse(ctx, cx, cy, 12, 5, '#ffffff')
  fillCircle(ctx, cx - 6, cy, 4, '#ffffff')
  fillCircle(ctx, cx + 6, cy - 1, 5, '#ffffff')
}

// 멀리 보이는 나무 우듬지 (공원 느낌)
function drawTreeTop(ctx: Ctx, cx: number, cy: number): void {
  fillCircle(ctx, cx, cy, 10, '#8fc36a')
  fillCircle(ctx, cx - 7, cy + 3, 7, '#7bb658')
  fillCircle(ctx, cx + 7, cy + 3, 7, '#7bb658')
  rect(ctx, cx - 1, cy + 8, 2, 8, '#9c6b3a')
}

// ── 하늘 (60초~): 밝은 하늘 + 고정 태양 + 흐르는 구름 ──────
function drawSky(ctx: Ctx, s: GameState): void {
  const bands = 6
  for (let i = 0; i < bands; i++) {
    rect(ctx, 0, (VH * i) / bands, VW, VH / bands + 1, mix('#6cc0ff', '#c4ecff', i / (bands - 1)))
  }
  drawSun(ctx, VW - 24, 28)
  scrollDecor(s, 118, 0.5, (yy, k) => {
    if (((k % 2) + 2) % 2 === 0) drawCloud(ctx, Math.round(VW * 0.28), Math.round(yy + 20))
    else drawCloud(ctx, Math.round(VW * 0.72), Math.round(yy + 50))
  })
}

// ── 성층권 (120초~): 짙은 하늘 + 구름 + 별 ────────────────
function drawStrato(ctx: Ctx, s: GameState): void {
  const bands = 6
  for (let i = 0; i < bands; i++) {
    rect(ctx, 0, (VH * i) / bands, VW, VH / bands + 1, mix('#1e2a5a', '#5a78c8', i / (bands - 1)))
  }
  drawStars(ctx, s, 26, '#dfe8ff')
  scrollDecor(s, 150, 0.35, (yy, k) => {
    if (((k % 2) + 2) % 2 === 0) drawCloud(ctx, Math.round(VW * 0.3), Math.round(yy + 20))
    else drawCloud(ctx, Math.round(VW * 0.7), Math.round(yy + 60))
  })
}

// ── 우주 (200초~): 별 + 행성 ──────────────────────────────
function drawSpace(ctx: Ctx, s: GameState): void {
  const bands = 6
  for (let i = 0; i < bands; i++) {
    rect(ctx, 0, (VH * i) / bands, VW, VH / bands + 1, mix('#0a0a1e', '#181638', i / (bands - 1)))
  }
  drawStars(ctx, s, 44, '#ffffff')
  scrollDecor(s, 170, 0.4, (yy, k) => {
    const kind = ((k % 3) + 3) % 3
    if (kind === 0) drawPlanet(ctx, Math.round(VW * 0.24), Math.round(yy + 30), 12, '#ff9a6b', '#c86b45')
    else if (kind === 1) drawPlanet(ctx, Math.round(VW * 0.76), Math.round(yy + 50), 9, '#8fd0ff', '#5a9ad8')
    // kind 2: 빈 하늘(별만)
  })
}

function drawSun(ctx: Ctx, cx: number, cy: number): void {
  fillCircle(ctx, cx, cy, 12, '#fff4b0')
  fillCircle(ctx, cx, cy, 9, '#ffe36b')
}

function drawPlanet(ctx: Ctx, cx: number, cy: number, r: number, c: string, edge: string): void {
  fillCircle(ctx, cx, cy, r, c)
  fillCircle(ctx, cx - 2, cy - 2, Math.max(2, r - 4), '#ffffff')
  // 얇은 고리
  for (let x = cx - r - 3; x <= cx + r + 3; x++) px(ctx, x, cy + Math.round(r * 0.4), edge)
}

// 별밭: 시간에 무관하게 고정 위치, 비트에 반짝임
function drawStars(ctx: Ctx, s: GameState, n: number, color: string): void {
  for (let i = 0; i < n; i++) {
    const x = (i * 53) % VW
    const y = (i * 97) % VH
    const tw = (Math.sin(s.beat * Math.PI * 2 + i) + 1) / 2
    if (tw > 0.35) px(ctx, x, y, color)
    if (tw > 0.8) {
      px(ctx, x + 1, y, color)
      px(ctx, x, y + 1, color)
    }
  }
}

// 세로로 반복 스크롤되는 소품 배치 헬퍼(위→아래)
function scrollDecor(
  s: GameState,
  P: number,
  speed: number,
  draw: (y: number, k: number) => void,
): void {
  const off = ((s.scroll * speed) % P + P) % P
  const base = Math.floor((s.scroll * speed) / P)
  for (let i = -1; i < VH / P + 2; i++) {
    draw(i * P + off, base - i)
  }
}

// 벽을 따라 세로로 반복되는 방 소품. 위→아래로 흘러 올라가는 느낌을 준다.
function drawRoomDecor(ctx: Ctx, s: GameState): void {
  const P = 96
  const speed = 0.5
  const off = ((s.scroll * speed) % P + P) % P
  const base = Math.floor((s.scroll * speed) / P)
  for (let i = -1; i < VH / P + 2; i++) {
    const y = i * P + off
    const k = base - i
    const kind = ((k % 2) + 2) % 2
    if (kind === 0) drawWindow(ctx, Math.round(VW * 0.5), Math.round(y + 40))
    else {
      drawPicture(ctx, Math.round(VW * 0.26), Math.round(y + 30))
      drawShelf(ctx, Math.round(VW * 0.72), Math.round(y + 46))
    }
  }
}

function drawWindow(ctx: Ctx, cx: number, cy: number): void {
  const w = 58
  const h = 46
  const x = cx - w / 2
  const y = cy - h / 2
  // 틀
  rect(ctx, x - 3, y - 3, w + 6, h + 6, '#f3f3ee')
  rect(ctx, x - 3, y - 3, w + 6, 3, '#ffffff')
  // 하늘
  rect(ctx, x, y, w, h, '#bfe6ff')
  rect(ctx, x, y + h - 12, w, 12, '#d7f0ff')
  // 구름 도트
  fillEllipse(ctx, x + 16, y + 14, 7, 3, '#ffffff')
  fillEllipse(ctx, x + 40, y + 24, 6, 3, '#ffffff')
  // 창살
  rect(ctx, cx - 1, y, 2, h, '#f3f3ee')
  rect(ctx, x, cy - 1, w, 2, '#f3f3ee')
  // 창턱
  rect(ctx, x - 5, y + h + 3, w + 10, 4, '#e6d3ad')
}

function drawPicture(ctx: Ctx, cx: number, cy: number): void {
  const w = 26
  const h = 22
  const x = cx - w / 2
  const y = cy - h / 2
  rect(ctx, x - 2, y - 2, w + 4, h + 4, '#9c6b3a') // 액자
  rect(ctx, x, y, w, h, '#cdeafe') // 하늘
  rect(ctx, x, y + h - 8, w, 8, '#a8d98a') // 언덕
  fillCircle(ctx, x + w - 7, y + 6, 3, '#ffd93d') // 해
}

function drawShelf(ctx: Ctx, cx: number, cy: number): void {
  const w = 30
  const x = cx - w / 2
  rect(ctx, x, cy + 12, w, 3, '#a97c42') // 선반 판
  hline(ctx, x, cy + 12, w, '#c79a5f')
  // 책 몇 권
  const cols = ['#ff8f8f', '#8fbfe0', '#ffd93d', '#9ee7b0', '#c9a8f0']
  let bx = x + 2
  for (let i = 0; i < 5; i++) {
    const bh = 8 + ((i * 3) % 4)
    rect(ctx, bx, cy + 12 - bh, 3, bh, cols[i])
    bx += 4
  }
  // 화분
  rect(ctx, x + w - 8, cy + 6, 6, 6, '#e08a5a')
  fillEllipse(ctx, x + w - 5, cy + 4, 5, 4, '#77c96a')
}

// ── 나무 바닥 + 바람 부는 얼굴 (우측 프로필, 천장 보고 누움) ─
export function drawFloorAndFace(ctx: Ctx, s: GameState): void {
  const fy = FLOOR_TOP + 6
  // 걸레받이
  rect(ctx, 0, fy - 5, VW, 5, '#efe0c2')
  hline(ctx, 0, fy - 5, VW, '#fff6e0')
  // 나무 바닥
  rect(ctx, 0, fy, VW, VH - fy, WOOD)
  hline(ctx, 0, fy, VW, WOOD_DARK)
  // 원근 나무결 (세로선이 아래로 벌어짐)
  for (let i = -2; i <= 4; i++) {
    const topX = VW / 2 + i * 16
    const botX = VW / 2 + i * 30
    lineSlanted(ctx, topX, fy, botX, VH, WOOD_LINE)
  }
  for (let y = fy + 8; y < VH; y += 12) hline(ctx, 0, y, VW, WOOD_DARK)

  // 공원일 때는 바닥이 잔디로 크로스페이드된다.
  const park = parkAmount(s)
  if (park > 0) {
    ctx.globalAlpha = park
    rect(ctx, 0, fy - 2, VW, VH - fy + 2, '#7cc65a')
    hline(ctx, 0, fy - 2, VW, '#a6e07d')
    rect(ctx, 0, fy - 2, VW, 3, '#6fb84f')
    // 잔디 결
    for (let x = 2; x < VW; x += 7) {
      px(ctx, x, fy + 2, '#5fa843')
      px(ctx, x + 3, fy + 6, '#5fa843')
    }
    ctx.globalAlpha = 1
  }

  // 하늘: 바닥이 구름 띠로. 성층권: 옅어지고. 우주: 어두운 허공.
  const fyGround = fy - 2
  overlay(ctx, skyAmount(s), () => {
    rect(ctx, 0, fyGround, VW, VH - fyGround, '#dff1ff')
    for (let x = 0; x < VW; x += 16) fillEllipse(ctx, x, fyGround + 3, 10, 4, '#ffffff')
  })
  overlay(ctx, stratoAmount(s), () => {
    rect(ctx, 0, fyGround, VW, VH - fyGround, '#3a4c86')
    for (let x = 6; x < VW; x += 18) fillEllipse(ctx, x, fyGround + 3, 9, 3, '#5a6ca8')
  })
  overlay(ctx, spaceAmount(s), () => {
    rect(ctx, 0, fyGround, VW, VH - fyGround, '#0a0a1e')
    hline(ctx, 0, fyGround, VW, '#3a3a66')
  })

  // 얼굴은 터치(바람 부는 중)일 때만 나타난다.
  if (s.blowing) drawFaceProfile(ctx, s)
}

// 새 (공원에서 좌↔우로 날갯짓하며 지나감)
export function drawBirds(ctx: Ctx, s: GameState): void {
  for (const b of s.birds) {
    const dir = b.vx >= 0 ? 1 : -1
    const wing = Math.sin(b.flap) * 4
    const x = Math.round(b.x)
    const y = Math.round(b.y)
    // 몸통
    fillEllipse(ctx, x, y, 4, 3, '#4a4a55')
    // 머리 + 부리(진행 방향)
    fillCircle(ctx, x + dir * 4, y - 1, 2, '#4a4a55')
    px(ctx, x + dir * 6, y - 1, '#ffb44d')
    px(ctx, x + dir * 7, y - 1, '#ffb44d')
    // 날개(펄럭)
    rect(ctx, x - 2, Math.round(y - 3 - wing), 4, 2, '#6a6a78')
    rect(ctx, x - 1, Math.round(y + 1 + wing), 3, 2, '#3a3a45')
    // 눈
    px(ctx, x + dir * 4, y - 2, '#fff')
  }
}

// 비행기 (하늘): 좌↔우로 가며 각도(기울기)를 바꿈
export function drawPlanes(ctx: Ctx, s: GameState): void {
  for (const p of s.planes) {
    const dir = p.vx >= 0 ? 1 : -1
    const x = Math.round(p.x)
    const y = Math.round(p.y)
    const tilt = Math.max(-2, Math.min(2, Math.round(p.vy / 20)))
    // 동체
    fillEllipse(ctx, x, y, 8, 3, '#e8ecf2')
    fillEllipse(ctx, x - dir * 3, y, 5, 2, '#c9d2dd')
    // 코 + 꼬리
    fillCircle(ctx, x + dir * 8, y, 2, '#ff6b6b')
    rect(ctx, x - dir * 8, y - 3 - (tilt > 0 ? tilt : 0), 2, 4, '#c9d2dd')
    // 날개
    rect(ctx, x - 1, y - 4, 5, 2, '#9aa7b5')
    rect(ctx, x - 3, y + 2, 5, 2, '#9aa7b5')
    // 창문
    px(ctx, x + dir * 2, y - 1, '#6fb0d8')
    px(ctx, x + dir * 4, y - 1, '#6fb0d8')
  }
}

// 운석 (성층권): 대각선으로 떨어짐, 불꼬리
export function drawMeteors(ctx: Ctx, s: GameState): void {
  for (const m of s.meteors) {
    const x = Math.round(m.x)
    const y = Math.round(m.y)
    // 꼬리(진행 반대 방향)
    const tx = m.vx >= 0 ? -1 : 1
    for (let i = 1; i <= 4; i++) {
      const a = 1 - i / 5
      ctx.globalAlpha = a
      px(ctx, x + tx * i * 2, y - i * 2, i < 2 ? '#ffd93d' : '#ff8f4d')
      ctx.globalAlpha = 1
    }
    // 돌덩이
    fillCircle(ctx, x, y, m.r, '#8a6b52')
    fillCircle(ctx, x - 1, y - 1, Math.max(1, m.r - 3), '#a9856a')
    px(ctx, x + 1, y + 1, '#5f4735')
  }
}

// UFO (우주): 좌/우에 고정, 차징 예고선 → 발사(가로 빔)
export function drawUfos(ctx: Ctx, s: GameState): void {
  for (const u of s.ufos) {
    const x = Math.round(u.x)
    const y = Math.round(u.y)
    // 빔
    if (u.phase === 'charge') {
      ctx.globalAlpha = 0.35 + 0.3 * Math.sin(s.beat * Math.PI * 6)
      rect(ctx, 0, y - 1, VW, 2, '#ff6bd0')
      ctx.globalAlpha = 1
    } else if (u.phase === 'fire') {
      rect(ctx, 0, y - BEAM_HALF, VW, BEAM_HALF * 2, '#ff9ee6')
      rect(ctx, 0, y - 2, VW, 4, '#ffffff')
    }
    // 본체 (접시)
    fillEllipse(ctx, x, y, 10, 4, '#b7c2d0')
    fillEllipse(ctx, x, y - 3, 6, 4, '#8fd0ff')
    fillCircle(ctx, x, y - 4, 2, '#dff4ff')
    // 아래 불빛
    for (let i = -1; i <= 1; i++) px(ctx, x + i * 4, y + 4, '#ffe36b')
  }
}

function lineSlanted(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, c: string): void {
  const steps = Math.abs(y1 - y0)
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    px(ctx, x0 + (x1 - x0) * t, y0 + i, c)
  }
}

// 사람이 천장을 보고 누웠을 때 오른쪽에서 본 얼굴 옆모습(얼굴만, 몸통 없음).
// 코가 위(천장/종이 방향)를 향하고, 입으로 위쪽에 바람을 분다.
// 터치한 지점에 잠깐 나타난다.
function drawFaceProfile(ctx: Ctx, s: GameState): void {
  const cx = s.windX
  const cy = s.windY
  const strain = s.strain // 0(편함)..1(매우 힘듦)
  // 힘들수록 떨림이 커진다
  const tremble = strain > 0.1 ? (Math.random() - 0.5) * strain * 3 : 0
  // 숨이 막 가득할 때(=이제 막 누름) 살짝 솟는 팝
  const grow = Math.max(0, s.breath - 0.85) * 6
  const bob = Math.sin(s.beat * Math.PI * 2) * 1 - grow * 3
  const y = cy + bob + tremble

  // 힘들수록 얼굴이 붉어진다
  const SKIN = strain > 0.66 ? '#ffb98a' : strain > 0.33 ? '#ffcf98' : '#ffd9a6'
  const SKIN_D = '#f0b97e'
  const HAIR = '#5a3b24'
  const HAIR_HI = '#6f4a2e'

  // 뒤통수(왼쪽) 머리카락
  fillCircle(ctx, cx - 8, y, 18, HAIR)
  fillCircle(ctx, cx - 12, y - 3, 12, HAIR_HI)

  // 얼굴 살 (오른쪽으로 드러난 옆면)
  fillCircle(ctx, cx + 2, y, 15, SKIN)
  fillEllipse(ctx, cx + 6, y - 2, 12, 13, SKIN)

  // 코 (위로 솟음)
  const noseX = cx + 8
  const noseTop = y - 17
  fillEllipse(ctx, noseX, y - 12, 4, 6, SKIN)
  rect(ctx, noseX - 1, noseTop, 3, 6, SKIN)
  px(ctx, noseX + 2, y - 12, SKIN_D) // 콧망울 그늘
  px(ctx, noseX + 2, y - 6, '#c98f5a') // 콧구멍

  // 눈썹 + 눈: 힘들수록 더 찡그린다
  hline(ctx, cx - 1, y - 8 - strain * 2, 5, HAIR)
  if (strain > 0.55) {
    // 질끈 감은 눈 ><
    px(ctx, cx, y - 5, '#5a3a1a')
    px(ctx, cx + 1, y - 4, '#5a3a1a')
    px(ctx, cx + 2, y - 5, '#5a3a1a')
    px(ctx, cx + 1, y - 3, '#5a3a1a')
  } else {
    // 힘주는 눈 ^
    px(ctx, cx, y - 4, '#5a3a1a')
    px(ctx, cx + 1, y - 5, '#5a3a1a')
    px(ctx, cx + 2, y - 4, '#5a3a1a')
  }

  // 볼: 힘들수록 더 부풀고 빨개진다
  const cheek = 6 + strain * 4
  const cheekColor = strain > 0.5 ? '#ff7a7a' : '#ff9a9a'
  fillCircle(ctx, cx + 6, y + 4, cheek, cheekColor)

  // 입: 힘들수록 더 크게 벌려 세게 분다
  const mx = noseX + 3
  const my = y - 8
  const mouthR = 3 + strain * 2
  fillEllipse(ctx, mx + 1, my, mouthR, mouthR + 1, '#7a3b28')
  px(ctx, mx + 1, my, '#b85a45')

  // 턱
  fillEllipse(ctx, cx + 9, y + 8, 6, 5, SKIN)

  // 땀방울: 힘들면 나타난다
  if (strain > 0.4) {
    fillEllipse(ctx, cx - 6, y - 14 - strain * 3, 2, 3, '#8fd0ff')
    if (strain > 0.7) fillEllipse(ctx, cx + 14, y - 6, 2, 3, '#8fd0ff')
  }
}

// ── 종이 오브젝트 (바닥과 수평으로 누워 펄럭임) ───────────
export function drawPaper(ctx: Ctx, s: GameState): void {
  const shake = s.shake > 0 ? (Math.random() - 0.5) * s.shake : 0
  const x = Math.round(s.x + shake)
  const y = Math.round(s.y)
  const phase = s.time * 6 + s.scroll * 0.05
  drawPaperVariant(ctx, x, y, s.variant, phase, s.rot)
}

export function drawPaperVariant(
  ctx: Ctx,
  x: number,
  y: number,
  variant: PaperVariant,
  phase: number,
  tilt = 0,
): void {
  switch (variant) {
    case 'sheet':
      drawFlutter(ctx, x, y, PAPER_W, PAPER_H, phase, tilt, {
        hi: '#ffffff',
        mid: '#f2f2ea',
        lo: '#dcdce6',
        edge: '#b9b9cc',
      })
      break
    case 'memo':
      drawFlutter(ctx, x, y, PAPER_W, PAPER_H, phase, tilt, {
        hi: '#fff2a8',
        mid: '#ffe98a',
        lo: '#e9cf5c',
        edge: '#c9ab3f',
        lines: '#d8b840',
      })
      break
    case 'receipt':
      drawFlutter(ctx, x, y + 2, PAPER_W, PAPER_H - 4, phase, tilt, {
        hi: '#ffffff',
        mid: '#f4f4ef',
        lo: '#e0e0d6',
        edge: '#c4c4b8',
        lines: '#c8c8bc',
      })
      break
    case 'airplane':
      drawAirplane(ctx, x, y, phase, tilt)
      break
  }
}

interface FlutterPal {
  hi: string
  mid: string
  lo: string
  edge: string
  lines?: string
}

// 가로로 누운 종이 시트: 또렷한 사각형 + 접힌 모서리(우상단) + 줄무늬 + 그림자 + 완만한 페이지 컬.
function drawFlutter(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  phase: number,
  tilt: number,
  pal: FlutterPal,
): void {
  const FOLD = 5 // 접힌 모서리 크기(px)
  // 완만한 저주파 컬(과한 물결 대신 시트 전체가 살짝 휘는 정도)
  const topAt = (c: number) => y + Math.sin(c * 0.16 + phase * 0.8) * 1.2 + (c - w / 2) * tilt

  // 바닥 그림자 (시트와 같은 컬을 따라 우하단으로 오프셋)
  ctx.globalAlpha = 0.15
  for (let c = 0; c < w; c++) rect(ctx, x + c + 2, topAt(c) + 3, 1, h, '#22303f')
  ctx.globalAlpha = 1

  for (let c = 0; c < w; c++) {
    const top = topAt(c)
    const slope = Math.cos(c * 0.16 + phase * 0.8)
    // 우상단 접힘: 대각선 위(cut px)는 잘려서 배경이 보인다
    const cut = Math.max(0, c - (w - 1 - FOLD))
    // 본체: 컬의 내리막 면만 살짝 어둡게 (낮은 대비로 종이 질감 유지)
    rect(ctx, x + c, top + cut, 1, h - cut, slope < -0.4 ? pal.mid : pal.hi)
    // 줄무늬(메모/영수증)
    if (pal.lines) {
      for (let r = 4; r < h - 2; r += 4) if (r > cut) px(ctx, x + c, top + r, pal.lines)
    }
    // 접힌 뒷면(삼각형 플랩) + 잘린 대각선
    if (cut > 0) {
      rect(ctx, x + c, top + cut, 1, FOLD - cut + 1, pal.lo)
      px(ctx, x + c, top + cut, pal.edge)
    }
    // 테두리: 윗변/아랫변 + 좌우 세로변
    if (cut === 0) px(ctx, x + c, top, pal.mid)
    px(ctx, x + c, top + h - 1, pal.edge)
    if (c === 0 || c === w - 1) rect(ctx, x + c, top + cut, 1, h - cut, pal.edge)
  }
}

function drawAirplane(ctx: Ctx, x: number, y: number, phase: number, tilt: number): void {
  const bob = Math.round(Math.sin(phase) * 1.5)
  const W = '#fdfdf6'
  const S = '#d6d6e2'
  const O = '#a4a4b8'
  const yy = y + bob
  // 오른쪽을 향해 활공하는 종이비행기 (가로), 각도에 따라 기울어짐
  for (let c = 0; c < PAPER_W; c++) {
    const t = c / PAPER_W
    const half = Math.round((1 - t) * 6) + 1
    const cy = yy + (c - PAPER_W / 2) * tilt
    rect(ctx, x + c, cy + 6 - half, 1, half * 2, t < 0.5 ? W : S)
  }
  hline(ctx, x, yy + 6, PAPER_W, O) // 중앙 접힘선
  rect(ctx, x, yy + 2, 4, 1, O)
}

// ── 파티클 (바람) ─────────────────────────────────────────
export function drawParticles(ctx: Ctx, s: GameState): void {
  for (const p of s.particles) {
    const a = p.life / p.max
    if (p.kind === 'wind') {
      ctx.globalAlpha = Math.min(1, a) * 0.8
      const c = a > 0.5 ? '#ffffff' : '#bfeaff'
      px(ctx, p.x, p.y, c)
      px(ctx, p.x + 1, p.y, c)
    } else {
      ctx.globalAlpha = Math.min(1, a)
      px(ctx, p.x, p.y, a > 0.5 ? '#ffd93d' : '#ff8f4d')
    }
  }
  ctx.globalAlpha = 1
}

// 위험 경고: 종이가 바닥에 가까우면 붉은 진동 표시
export function drawDangerHint(ctx: Ctx, s: GameState): void {
  const gap = FLOOR_TOP - (s.y + PAPER_H)
  if (s.phase === 'playing' && gap < 40) {
    const t = 1 - gap / 40
    ctx.globalAlpha = 0.22 * t * (0.5 + 0.5 * Math.sin(s.beat * Math.PI * 4))
    rect(ctx, 0, FLOOR_TOP - 30, VW, 30, '#ff6b6b')
    ctx.globalAlpha = 1
  }
}

// 전체 프레임 렌더
export function renderFrame(ctx: Ctx, s: GameState): void {
  ctx.clearRect(0, 0, VW, VH)
  drawBackground(ctx, s)
  drawDangerHint(ctx, s)
  drawFloorAndFace(ctx, s)
  drawParticles(ctx, s)
  drawBirds(ctx, s)
  drawPlanes(ctx, s)
  drawMeteors(ctx, s)
  drawUfos(ctx, s)
  drawPaper(ctx, s)
}

// ── 유틸 ──────────────────────────────────────────────────
function mix(a: string, b: string, t: number): string {
  const ca = hex(a)
  const cb = hex(b)
  const r = Math.round(ca[0] + (cb[0] - ca[0]) * t)
  const g = Math.round(ca[1] + (cb[1] - ca[1]) * t)
  const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t)
  return `rgb(${r},${g},${bl})`
}

function hex(h: string): [number, number, number] {
  return [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ]
}
