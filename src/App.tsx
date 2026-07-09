import { useCallback, useEffect, type PointerEvent as ReactPointerEvent } from 'react'
import { VH, VW } from './game/constants'
import { useGame } from './hooks/useGame'
import { StartScreen } from './components/StartScreen'
import { Hud } from './components/Hud'
import { GameOverScreen } from './components/GameOverScreen'

export default function App() {
  const g = useGame()

  const toVirtual = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return {
      vx: ((e.clientX - rect.left) / rect.width) * VW,
      vy: ((e.clientY - rect.top) / rect.height) * VH,
    }
  }

  // 누르는 동안 바람 유지. 누른 지점에 얼굴이 생긴다.
  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (g.phase !== 'playing') return
      e.currentTarget.setPointerCapture?.(e.pointerId)
      const { vx, vy } = toVirtual(e)
      g.beginBlow(vx, vy)
    },
    [g],
  )

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (g.phase !== 'playing' || e.buttons === 0) return
      const { vx, vy } = toVirtual(e)
      g.dragBlow(vx, vy)
    },
    [g],
  )

  const onPointerUp = useCallback(() => g.stopBlow(), [g])

  useEffect(() => {
    // 키보드: 누르는 동안 바람 유지 (keydown 유지 → keyup 해제)
    const onDown = (e: KeyboardEvent) => {
      const code = e.code
      const isBlow =
        code === 'Space' || code === 'ArrowUp' || code === 'ArrowLeft' || code === 'ArrowRight'
      if (!isBlow) return
      e.preventDefault()
      if (g.phase === 'playing') {
        if (e.repeat) return
        // ←: 종이 오른쪽에 바람(→왼쪽 이동), →: 종이 왼쪽에 바람(→오른쪽 이동)
        if (code === 'ArrowLeft') g.beginBlow(VW)
        else if (code === 'ArrowRight') g.beginBlow(0)
        else g.beginBlow()
      } else if (g.phase === 'ready') g.start()
      else if (g.phase === 'over') g.retry()
    }
    const onUp = (e: KeyboardEvent) => {
      const code = e.code
      if (
        code === 'Space' ||
        code === 'ArrowUp' ||
        code === 'ArrowLeft' ||
        code === 'ArrowRight'
      )
        g.stopBlow()
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [g])

  return (
    <div className="app">
      <div className="stage">
        <canvas
          ref={g.canvasRef}
          className="game-canvas"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
        />

        {g.phase === 'playing' && (
          <Hud
            score={g.score}
            best={g.best}
            breath={g.breath}
            timeSec={g.timeSec}
            combo={g.combo}
            niceCount={g.niceCount}
            niceBonus={g.niceBonus}
            muted={g.muted}
            onToggleMute={g.toggleMute}
          />
        )}

        {g.phase === 'ready' && (
          <StartScreen
            best={g.best}
            variant={g.variant}
            muted={g.muted}
            onToggleMute={g.toggleMute}
            onChoose={g.chooseVariant}
            onStart={g.start}
          />
        )}

        {g.phase === 'over' && (
          <GameOverScreen
            score={g.score}
            best={g.best}
            timeSec={g.timeSec}
            isNewBest={g.score > 0 && g.score > g.prevBest}
            onRetry={g.retry}
            onHome={g.home}
          />
        )}
      </div>
    </div>
  )
}
