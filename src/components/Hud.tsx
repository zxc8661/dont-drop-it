interface Props {
  score: number
  best: number
  breath: number // 0..1 남은 숨
  timeSec: number
  combo: number
  niceCount: number
  niceBonus: number
  muted: boolean
  onToggleMute: () => void
}

export function Hud({ score, best, breath, timeSec, combo, niceCount, niceBonus, muted, onToggleMute }: Props) {
  const low = breath <= 0.25
  return (
    <div className="hud">
      <button className="mute-btn" onClick={onToggleMute} aria-label="소리">
        {muted ? '🔇' : '🔊'}
      </button>
      <div className="hud-best">BEST {best}</div>

      {/* 숨 게이지: 누르면 줄고 떼면 회복 */}
      <div className="breath-wrap">
        <div className="breath-label">숨</div>
        <div className="breath-bar">
          <div
            className={'breath-fill' + (low ? ' low' : '')}
            style={{ width: `${Math.round(breath * 100)}%` }}
          />
        </div>
      </div>

      <div className="hud-score">{score}</div>
      <div className="hud-time">{timeSec.toFixed(1)}초</div>

      {combo >= 2 && <div className="combo-badge">COMBO x{combo}</div>}

      {/* 니어미스 플래시: niceCount가 바뀔 때마다 애니메이션 재생 */}
      {niceCount > 0 && (
        <div key={niceCount} className="nice-flash">
          아슬아슬! +{niceBonus}
        </div>
      )}

      <div className="hud-hint">꾹 눌러 바람! 새를 아슬하게 피하면 보너스</div>
    </div>
  )
}
