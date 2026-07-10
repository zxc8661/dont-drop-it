import {
  BEAT_BPM,
  CAM_LINE,
  FLOOR_TOP,
  GRAVITY,
  MAX_DOWN_SPEED,
  MAX_UP_SPEED,
  HAZARD_RAMP_CUT,
  PAPER_H,
  PAPER_HIT_H,
  PAPER_HIT_W,
  PAPER_START_Y,
  PAPER_W,
  BREATH_DRAIN,
  BREATH_REGEN,
  BIRD_MAX_GAP,
  BIRD_MIN_GAP,
  COMBO_WINDOW,
  NEAR_BONUS,
  NEAR_MARGIN,
  SCORE_PER_PX,
  BIRD_R,
  BIRD_SPEED_MAX,
  BIRD_SPEED_MIN,
  PARK_ALT,
  SKY_ALT,
  STRATO_ALT,
  SPACE_ALT,
  ALT_FADE,
  PLANE_MIN_GAP,
  PLANE_MAX_GAP,
  PLANE_SPEED,
  PLANE_VY_MAX,
  PLANE_ANGLE_GAP,
  PLANE_R,
  METEOR_MIN_GAP,
  METEOR_MAX_GAP,
  METEOR_VY,
  METEOR_VX,
  METEOR_R,
  METEOR_SPLIT_CHANCE,
  UFO_MIN_GAP,
  UFO_MAX_GAP,
  UFO_SHOTS_MIN,
  UFO_SHOTS_MAX,
  UFO_CHARGE,
  UFO_FIRE,
  UFO_IDLE,
  UFO_R,
  BEAM_HALF,
  MAX_X_SPEED,
  WALL_MARGIN,
  WIND_STEER_RANGE,
  WIND_X_ACCEL,
  X_DRAG,
  VW,
  WIND_ACCEL,
} from './constants'
import type { Bird, GameState, Meteor, Particle, PaperVariant, Plane, Stage, Ufo } from './types'

const CENTER_X = VW / 2 - PAPER_W / 2

export function createState(best: number, variant: PaperVariant = 'sheet'): GameState {
  return {
    phase: 'ready',
    time: 0,
    alt: 0,
    score: 0,
    scoreAcc: 0,
    combo: 0,
    comboTimer: 0,
    best,
    x: CENTER_X,
    y: PAPER_START_Y,
    vx: 0,
    vy: 0,
    rot: 0,
    variant,
    holding: false,
    breath: 1,
    strain: 0,
    windDir: 0,
    windX: CENTER_X + PAPER_W / 2,
    windY: FLOOR_TOP - 6,
    blowing: false,
    particles: [],
    scroll: 0,
    beat: 0,
    shake: 0,
    birds: [],
    planes: [],
    meteors: [],
    ufos: [],
    hazardTimer: BIRD_MIN_GAP,
    hitCount: 0,
    spawnCount: 0,
    niceCount: 0,
    niceBonus: 0,
  }
}

// startAlt: 개발용으로 특정 스테이지 고도부터 시작(기본 0 = 방).
export function startGame(s: GameState, startAlt = 0): void {
  s.phase = 'playing'
  s.time = 0
  s.alt = startAlt
  s.score = 0
  s.scoreAcc = 0
  s.combo = 0
  s.comboTimer = 0
  s.x = CENTER_X
  s.y = PAPER_START_Y
  s.vx = 0
  s.vy = 0
  s.rot = 0
  s.holding = false
  s.breath = 1
  s.strain = 0
  s.windDir = 0
  s.blowing = false
  s.particles = []
  s.shake = 0
  s.scroll = startAlt
  s.birds = []
  s.planes = []
  s.meteors = []
  s.ufos = []
  s.hazardTimer = BIRD_MIN_GAP
  s.hitCount = 0
  s.spawnCount = 0
  s.niceCount = 0
  s.niceBonus = 0
}

// 누르기 시작: 터치한 지점(tapX,tapY)에 얼굴이 생기고 그 자리에서 수직 바람이 시작된다.
// 숨은 리셋하지 않는다(연속으로 눌러도 남은 숨에서 이어진다).
export function startBlow(s: GameState, tapX?: number, tapY?: number): void {
  if (s.phase !== 'playing') return
  s.holding = true
  setWind(s, tapX, tapY)
}

// 누른 채 이동: 바람(얼굴) 위치를 갱신한다.
export function moveBlow(s: GameState, tapX: number, tapY: number): void {
  if (s.phase !== 'playing' || !s.holding) return
  setWind(s, tapX, tapY)
}

// 떼기: 바람이 멈춘다(숨은 쉬는 동안 천천히 회복).
export function endBlow(s: GameState): void {
  s.holding = false
  s.blowing = false
}

// 바람 위치/방향 설정. 바람이 종이 오른쪽에 닿으면 종이는 왼쪽으로(부호 반전).
function setWind(s: GameState, tapX?: number, tapY?: number): void {
  s.windX = tapX ?? s.x + PAPER_W / 2
  s.windY = tapY ?? FLOOR_TOP - 6
  const center = s.x + PAPER_W / 2
  s.windDir = -clamp((s.windX - center) / WIND_STEER_RANGE, -1, 1)
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

// ── 스테이지 판정 (고도 기반) ─────────────────────────────
export function stageOf(alt: number): Stage {
  if (alt >= SPACE_ALT) return 'space'
  if (alt >= STRATO_ALT) return 'strato'
  if (alt >= SKY_ALT) return 'sky'
  if (alt >= PARK_ALT) return 'park'
  return 'room'
}
function amountSince(alt: number, start: number): number {
  return clamp((alt - start) / ALT_FADE, 0, 1)
}
export function parkAmount(s: GameState): number {
  return amountSince(s.alt, PARK_ALT)
}
export function skyAmount(s: GameState): number {
  return amountSince(s.alt, SKY_ALT)
}
export function stratoAmount(s: GameState): number {
  return amountSince(s.alt, STRATO_ALT)
}
export function spaceAmount(s: GameState): number {
  return amountSince(s.alt, SPACE_ALT)
}

// 게임 오버 처리(모든 위협/바닥 공통)
function endRun(s: GameState, sparkX: number, sparkY: number): void {
  if (s.phase !== 'playing') return
  s.phase = 'over'
  s.blowing = false
  s.holding = false
  s.shake = 3
  s.hitCount++
  spawnSparks(s, sparkX, sparkY)
  if (s.score > s.best) s.best = s.score
}

const gap = (a: number, b: number) => a + Math.random() * (b - a)

// 충돌/니어미스 공통 판정 (r=위협 반경). 판정 박스는 그림보다 작게(관대하게).
type NearObj = { nearScored: boolean }
function checkHit(s: GameState, ox: number, oy: number, r: number, obj: NearObj): 'hit' | 'near' | null {
  const px = s.x + PAPER_W / 2
  const py = s.y + PAPER_H / 2
  const hx = Math.abs(ox - px) < r + PAPER_HIT_W / 2
  const dy = Math.abs(oy - py)
  const hitY = r + PAPER_HIT_H / 2
  if (hx && dy < hitY) return 'hit'
  if (!obj.nearScored && hx && dy >= hitY && dy < hitY + NEAR_MARGIN) return 'near'
  return null
}
function awardNear(s: GameState, obj: NearObj): void {
  obj.nearScored = true
  s.combo++
  s.comboTimer = COMBO_WINDOW
  const bonus = NEAR_BONUS * s.combo
  s.scoreAcc += bonus
  s.niceBonus = bonus
  s.niceCount++
}

// ── 스폰 ──────────────────────────────────────────────────
function spawnBird(s: GameState): void {
  const l2r = Math.random() < 0.5
  const speed = BIRD_SPEED_MIN + Math.random() * (BIRD_SPEED_MAX - BIRD_SPEED_MIN)
  const y = 24 + Math.random() * (FLOOR_TOP - 70)
  s.birds.push({ x: l2r ? -BIRD_R * 2 : VW + BIRD_R * 2, y, vx: l2r ? speed : -speed, flap: Math.random() * Math.PI * 2, hit: false, nearScored: false })
  s.spawnCount++
}
function spawnPlane(s: GameState): void {
  const l2r = Math.random() < 0.5
  const y = 30 + Math.random() * (FLOOR_TOP - 90)
  s.planes.push({
    x: l2r ? -PLANE_R * 2 : VW + PLANE_R * 2,
    y,
    vx: l2r ? PLANE_SPEED : -PLANE_SPEED,
    vy: (Math.random() * 2 - 1) * PLANE_VY_MAX,
    angleT: PLANE_ANGLE_GAP,
    hit: false,
    nearScored: false,
  })
  s.spawnCount++
}
function spawnMeteor(s: GameState): void {
  const x = 20 + Math.random() * (VW - 40)
  const dir = x < VW / 2 ? 1 : -1 // 대체로 화면 안쪽으로
  s.meteors.push({
    x,
    y: -METEOR_R * 2,
    vx: dir * METEOR_VX * (0.6 + Math.random() * 0.7),
    vy: METEOR_VY * (0.85 + Math.random() * 0.4),
    canSplit: true,
    r: METEOR_R,
    hit: false,
    nearScored: false,
  })
  s.spawnCount++
}
function spawnUfo(s: GameState): void {
  const side: 1 | -1 = Math.random() < 0.5 ? -1 : 1
  const y = 40 + Math.random() * (FLOOR_TOP - 100)
  s.ufos.push({
    x: side < 0 ? 14 : VW - 14,
    y,
    side,
    shotsLeft: UFO_SHOTS_MIN + Math.floor(Math.random() * (UFO_SHOTS_MAX - UFO_SHOTS_MIN + 1)),
    phase: 'charge',
    phaseT: UFO_CHARGE,
    leaving: false,
  })
  s.spawnCount++
}

// ── 위협 업데이트(스테이지별 스폰 + 각 위협 이동/충돌) ─────
function updateHazards(s: GameState, dt: number): void {
  const stage = stageOf(s.alt)
  s.hazardTimer -= dt
  if (s.hazardTimer <= 0) {
    // 난이도 램프: 고도에 비례해 스폰 간격 단축(최대 HAZARD_RAMP_CUT)
    const ramp = 1 - HAZARD_RAMP_CUT * clamp(s.alt / SPACE_ALT, 0, 1)
    if (stage === 'park') {
      spawnBird(s)
      s.hazardTimer = gap(BIRD_MIN_GAP, BIRD_MAX_GAP) * ramp
    } else if (stage === 'sky') {
      spawnPlane(s)
      s.hazardTimer = gap(PLANE_MIN_GAP, PLANE_MAX_GAP) * ramp
    } else if (stage === 'strato') {
      spawnMeteor(s)
      s.hazardTimer = gap(METEOR_MIN_GAP, METEOR_MAX_GAP) * ramp
    } else if (stage === 'space') {
      spawnUfo(s)
      s.hazardTimer = gap(UFO_MIN_GAP, UFO_MAX_GAP) * ramp
    } else {
      s.hazardTimer = 1
    }
  }
  updateBirds(s, dt)
  updatePlanes(s, dt)
  updateMeteors(s, dt)
  updateUfos(s, dt)
}

function updateBirds(s: GameState, dt: number): void {
  const next: Bird[] = []
  for (const b of s.birds) {
    b.x += b.vx * dt
    b.y += Math.sin(b.flap) * 8 * dt
    b.flap += dt * 14
    if (b.x < -BIRD_R * 3 || b.x > VW + BIRD_R * 3) continue
    const r = checkHit(s, b.x, b.y, BIRD_R, b)
    if (r === 'hit') {
      b.hit = true
      endRun(s, b.x, b.y)
    } else if (r === 'near') awardNear(s, b)
    next.push(b)
  }
  s.birds = next
}

function updatePlanes(s: GameState, dt: number): void {
  const next: Plane[] = []
  for (const p of s.planes) {
    p.angleT -= dt
    if (p.angleT <= 0) {
      p.vy = (Math.random() * 2 - 1) * PLANE_VY_MAX // 랜덤 각도
      p.angleT = PLANE_ANGLE_GAP * (0.6 + Math.random())
    }
    p.x += p.vx * dt
    p.y += p.vy * dt
    if (p.y < 16) {
      p.y = 16
      p.vy = Math.abs(p.vy)
    } else if (p.y > FLOOR_TOP - 16) {
      p.y = FLOOR_TOP - 16
      p.vy = -Math.abs(p.vy)
    }
    if (p.x < -PLANE_R * 3 || p.x > VW + PLANE_R * 3) continue
    const r = checkHit(s, p.x, p.y, PLANE_R, p)
    if (r === 'hit') {
      p.hit = true
      endRun(s, p.x, p.y)
    } else if (r === 'near') awardNear(s, p)
    next.push(p)
  }
  s.planes = next
}

function updateMeteors(s: GameState, dt: number): void {
  const next: Meteor[] = []
  const born: Meteor[] = []
  for (const m of s.meteors) {
    m.x += m.vx * dt
    m.y += m.vy * dt
    // 중간 구간에서 랜덤 분열 → 2개로 갈라짐
    if (m.canSplit && m.y > 45 && m.y < FLOOR_TOP * 0.7 && Math.random() < METEOR_SPLIT_CHANCE * dt) {
      const nr = Math.max(3, m.r - 1)
      const mk = (off: number): Meteor => ({ x: m.x, y: m.y, vx: m.vx + off, vy: m.vy * 0.92, canSplit: false, r: nr, hit: false, nearScored: false })
      born.push(mk(-32), mk(32))
      spawnSparks(s, m.x, m.y)
      continue // 원본 제거
    }
    if (m.y > FLOOR_TOP + m.r || m.x < -20 || m.x > VW + 20) continue
    const r = checkHit(s, m.x, m.y, m.r, m)
    if (r === 'hit') {
      m.hit = true
      endRun(s, m.x, m.y)
    } else if (r === 'near') awardNear(s, m)
    next.push(m)
  }
  s.meteors = next.concat(born)
}

function updateUfos(s: GameState, dt: number): void {
  const next: Ufo[] = []
  const py = s.y + PAPER_H / 2
  for (const u of s.ufos) {
    if (u.leaving) {
      u.x += u.side * 90 * dt
      if (u.x < -UFO_R * 3 || u.x > VW + UFO_R * 3) continue
      next.push(u)
      continue
    }
    u.phaseT -= dt
    if (u.phaseT <= 0) {
      if (u.phase === 'charge') {
        u.phase = 'fire'
        u.phaseT = UFO_FIRE
      } else if (u.phase === 'fire') {
        u.shotsLeft--
        if (u.shotsLeft <= 0) u.leaving = true
        else {
          u.phase = 'idle'
          u.phaseT = UFO_IDLE
        }
      } else {
        u.phase = 'charge'
        u.phaseT = UFO_CHARGE
      }
    }
    // 발사 중이면 UFO 높이의 가로 빔이 치명적
    if (u.phase === 'fire' && Math.abs(py - u.y) < BEAM_HALF + PAPER_H / 2) {
      endRun(s, s.x + PAPER_W / 2, py)
    }
    next.push(u)
  }
  s.ufos = next
}

function spawnWind(s: GameState): void {
  // 얼굴 입 위치에서 수직으로만 올라간다.
  const cx = s.windX
  const baseY = s.windY - 8
  for (let i = 0; i < 2; i++) {
    s.particles.push({
      x: cx + (Math.random() - 0.5) * 8,
      y: baseY + Math.random() * 4,
      vx: (Math.random() - 0.5) * 10,
      vy: -80 - Math.random() * 70,
      life: 0.5 + Math.random() * 0.3,
      max: 0.8,
      kind: 'wind',
    })
  }
}

function spawnSparks(s: GameState, x: number, y: number): void {
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI * 2 * i) / 10 + Math.random()
    const sp = 40 + Math.random() * 50
    s.particles.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 20,
      life: 0.4 + Math.random() * 0.3,
      max: 0.7,
      kind: 'spark',
    })
  }
}

export function step(s: GameState, dtRaw: number): void {
  // 큰 프레임 간격은 잘라 물리 폭주를 막는다.
  const dt = Math.min(dtRaw, 1 / 30)

  s.beat = (s.beat + (dt * BEAT_BPM) / 60) % 1
  s.shake = Math.max(0, s.shake - dt * 6)

  updateParticles(s, dt)

  if (s.phase !== 'playing') {
    s.scroll += dt * 8
    // 준비 화면: 종이가 살짝 둥실.
    if (s.phase === 'ready') s.y = PAPER_START_Y + Math.sin(s.beat * Math.PI * 2) * 4
    return
  }

  s.time += dt
  if (s.comboTimer > 0) {
    s.comboTimer -= dt
    if (s.comboTimer <= 0) s.combo = 0
  }

  updateHazards(s, dt)

  // 숨: 누르고 숨이 남아있으면 바람. 소진은 빠르게, 회복은 뗀 동안 천천히.
  if (s.holding && s.breath > 0) {
    s.blowing = true
    s.breath = Math.max(0, s.breath - BREATH_DRAIN * dt)
  } else {
    s.blowing = false
    if (!s.holding) s.breath = Math.min(1, s.breath + BREATH_REGEN * dt)
  }
  s.strain = 1 - s.breath

  if (s.blowing) {
    s.vy += WIND_ACCEL * dt
    s.vx += s.windDir * WIND_X_ACCEL * dt
    s.shake = Math.min(s.shake + dt * (4 + s.strain * 10), 2.5)
    spawnWind(s)
  }

  // 중력은 항상 작용.
  s.vy += GRAVITY * dt
  s.vy = Math.max(MAX_UP_SPEED, Math.min(MAX_DOWN_SPEED, s.vy))
  s.y += s.vy * dt

  // 수평: 바람 각도로 밀린 뒤 공기 저항으로 감쇠, 좌우 벽에서 튕김.
  s.vx -= s.vx * X_DRAG * dt
  s.vx = Math.max(-MAX_X_SPEED, Math.min(MAX_X_SPEED, s.vx))
  s.x += s.vx * dt
  const leftWall = WALL_MARGIN
  const rightWall = VW - PAPER_W - WALL_MARGIN
  if (s.x < leftWall) {
    s.x = leftWall
    s.vx = Math.abs(s.vx) * 0.4
  } else if (s.x > rightWall) {
    s.x = rightWall
    s.vx = -Math.abs(s.vx) * 0.4
  }
  // 기울기: 수평 속도 + 낙하 속도 반영.
  s.rot = Math.max(-0.4, Math.min(0.4, s.vx / 260 + s.vy / 900))

  // 카메라: 종이가 CAM_LINE 위로 오르면 "부드럽게" 따라간다(높이 고정 없음).
  // 세게 불면 종이가 위로 떴다가 카메라가 천천히 따라잡으며 고도가 오른다.
  if (s.y < CAM_LINE) {
    const climb = (CAM_LINE - s.y) * (1 - Math.pow(0.015, dt))
    s.y += climb
    s.alt += climb
    s.scoreAcc += climb * SCORE_PER_PX
  }
  // 화면 최상단 안전 클램프(밖으로 못 나가게)
  if (s.y < 6) {
    const d = 6 - s.y
    s.y = 6
    s.alt += d
    s.scoreAcc += d * SCORE_PER_PX
  }
  s.score = Math.floor(s.scoreAcc)
  s.scroll = s.alt

  // 바닥 충돌 → 게임 오버.
  if (s.y + PAPER_H >= FLOOR_TOP) {
    s.y = FLOOR_TOP - PAPER_H
    endRun(s, s.x + PAPER_W / 2, FLOOR_TOP - PAPER_H / 2)
  }
}

function updateParticles(s: GameState, dt: number): void {
  const next: Particle[] = []
  for (const p of s.particles) {
    p.life -= dt
    if (p.life <= 0) continue
    p.x += p.vx * dt
    p.y += p.vy * dt
    if (p.kind === 'spark') p.vy += 160 * dt
    else p.vx *= 0.94
    next.push(p)
  }
  s.particles = next
}
