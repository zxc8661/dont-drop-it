import type { PaperVariant } from '../game/types'

interface Props {
  best: number
  variant: PaperVariant
  muted: boolean
  onToggleMute: () => void
  onChoose: (v: PaperVariant) => void
  onStart: () => void
}

const VARIANTS: { key: PaperVariant; label: string }[] = [
  { key: 'sheet', label: 'A4' },
  { key: 'airplane', label: '비행기' },
  { key: 'receipt', label: '영수증' },
  { key: 'memo', label: '메모지' },
]

export function StartScreen({ best, variant, muted, onToggleMute, onChoose, onStart }: Props) {
  return (
    <div className="overlay start">
      <button className="mute-btn" onClick={onToggleMute} aria-label="소리">
        {muted ? '🔇' : '🔊'}
      </button>
      <div className="title-wrap">
        <h1 className="title">
          그것을<br />
          떨어뜨리지 마
        </h1>
        <p className="subtitle">DON'T DROP IT</p>
      </div>

      <div className="best-card">🏆 최고 점수 <b>{best}</b></div>

      <div className="variant-pick">
        <p className="pick-label">종이 고르기</p>
        <div className="pick-row">
          {VARIANTS.map((v) => (
            <button
              key={v.key}
              className={'pick-btn' + (variant === v.key ? ' active' : '')}
              onClick={() => onChoose(v.key)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <button className="btn btn-primary" onClick={onStart}>
        시작하기
      </button>
      <p className="tip">탭하면 아래 얼굴이 바람을 불어요</p>
    </div>
  )
}
