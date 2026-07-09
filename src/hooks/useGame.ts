import { useCallback, useEffect, useRef, useState } from 'react'
import { VH, VW } from '../game/constants'
import { createState, endBlow, moveBlow, startBlow, startGame, step } from '../game/engine'
import { renderFrame } from '../game/render'
import type { GameState, PaperVariant, Phase } from '../game/types'
import { loadBest, saveBest } from '../storage'
import { sfx } from '../audio'

interface UiState {
  phase: Phase
  score: number
  timeSec: number // 버틴 시간(초, 1자리)
  combo: number
  niceCount: number
  niceBonus: number
  muted: boolean
  best: number
  prevBest: number
  variant: PaperVariant
  startStage: number // 개발용 시작 단계 시각(초)
  breath: number // 남은 숨 0..1 (게이지)
  blowing: boolean
}

export function useGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stateRef = useRef<GameState>(createState(loadBest()))
  const savedForRef = useRef(false)
  const evRef = useRef({ hit: 0, bird: 0, nice: 0 })
  const startStageRef = useRef(0) // 개발용 시작 스테이지 시각
  const prevBestRef = useRef(stateRef.current.best)

  const [ui, setUi] = useState<UiState>({
    phase: 'ready',
    score: 0,
    timeSec: 0,
    combo: 0,
    niceCount: 0,
    niceBonus: 0,
    muted: sfx.muted,
    best: stateRef.current.best,
    prevBest: stateRef.current.best,
    variant: 'sheet',
    startStage: 0,
    breath: 1,
    blowing: false,
  })

  // 게임 루프
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = VW
    canvas.height = VH
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = false

    let raf = 0
    let last = performance.now()

    const frame = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      const s = stateRef.current
      const prevPhase = s.phase

      step(s, dt)
      renderFrame(ctx, s)

      // 이벤트 사운드 (프레임 간 카운터 변화 감지)
      const ev = evRef.current
      if (s.spawnCount !== ev.bird) {
        ev.bird = s.spawnCount
        sfx.chirp()
      }
      if (s.hitCount !== ev.hit) {
        ev.hit = s.hitCount
        sfx.hit()
      }
      if (s.niceCount !== ev.nice) {
        ev.nice = s.niceCount
        sfx.nice(s.combo)
      }

      // 게임 오버 진입 시 최고 기록 저장 + 사운드 (프레임당 1회만).
      if (s.phase === 'over' && prevPhase === 'playing' && !savedForRef.current) {
        savedForRef.current = true
        const isNew = s.score > prevBestRef.current
        saveBest(s.best)
        if (isNew) sfx.best()
        else sfx.over()
      }

      const prevBest = prevBestRef.current
      const breath = Math.round(s.breath * 100) / 100
      const timeSec = Math.max(0, Math.round((s.time - startStageRef.current) * 10) / 10)
      setUi((u) =>
        u.phase === s.phase &&
        u.score === s.score &&
        u.best === s.best &&
        u.prevBest === prevBest &&
        u.variant === s.variant &&
        u.startStage === startStageRef.current &&
        u.breath === breath &&
        u.blowing === s.blowing &&
        u.timeSec === timeSec &&
        u.combo === s.combo &&
        u.niceCount === s.niceCount &&
        u.muted === sfx.muted
          ? u
          : {
              phase: s.phase,
              score: s.score,
              timeSec,
              combo: s.combo,
              niceCount: s.niceCount,
              niceBonus: s.niceBonus,
              muted: sfx.muted,
              best: s.best,
              prevBest,
              variant: s.variant,
              startStage: startStageRef.current,
              breath,
              blowing: s.blowing,
            },
      )

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  const start = useCallback(() => {
    savedForRef.current = false
    prevBestRef.current = stateRef.current.best
    evRef.current = { hit: 0, bird: 0, nice: 0 }
    startGame(stateRef.current, startStageRef.current)
    sfx.click()
  }, [])

  // 누르기 시작: 터치 지점(가상좌표)에 얼굴이 생기고 수직 바람이 시작된다.
  const beginBlow = useCallback((tapX?: number, tapY?: number) => {
    startBlow(stateRef.current, tapX, tapY)
    if (stateRef.current.blowing) sfx.blow()
  }, [])

  const dragBlow = useCallback((tapX: number, tapY: number) => {
    moveBlow(stateRef.current, tapX, tapY)
  }, [])

  const stopBlow = useCallback(() => {
    endBlow(stateRef.current)
  }, [])

  const retry = useCallback(() => {
    savedForRef.current = false
    prevBestRef.current = stateRef.current.best
    evRef.current = { hit: 0, bird: 0, nice: 0 }
    startGame(stateRef.current, startStageRef.current)
    sfx.click()
  }, [])

  const home = useCallback(() => {
    savedForRef.current = false
    const best = stateRef.current.best
    const variant = stateRef.current.variant
    stateRef.current = createState(best, variant)
    evRef.current = { hit: 0, bird: 0, nice: 0 }
    sfx.click()
  }, [])

  const toggleMute = useCallback(() => {
    sfx.toggle()
    setUi((u) => ({ ...u, muted: sfx.muted }))
  }, [])

  const chooseVariant = useCallback((variant: PaperVariant) => {
    stateRef.current.variant = variant
  }, [])

  // 개발용: 시작 스테이지(시각) 선택
  const chooseStage = useCallback((t: number) => {
    startStageRef.current = t
    setUi((u) => ({ ...u, startStage: t }))
  }, [])

  return {
    canvasRef,
    ...ui,
    start,
    beginBlow,
    dragBlow,
    stopBlow,
    retry,
    home,
    chooseVariant,
    chooseStage,
    toggleMute,
  }
}
