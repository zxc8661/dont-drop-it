import { PARK_ALT, SKY_ALT, SPACE_ALT, STRATO_ALT } from '../game/constants'
import type { PaperVariant } from '../game/types'

interface Props {
  best: number
  variant: PaperVariant
  startStage: number
  muted: boolean
  onToggleMute: () => void
  onChoose: (v: PaperVariant) => void
  onChooseStage: (t: number) => void
  onStart: () => void
}

const STAGES: { t: number; label: string }[] = [
  { t: 0, label: '방' },
  { t: PARK_ALT, label: '공원' },
  { t: SKY_ALT, label: '하늘' },
  { t: STRATO_ALT, label: '성층권' },
  { t: SPACE_ALT, label: '우주' },
]

const VARIANTS: { key: PaperVariant; label: string }[] = [
  { key: 'sheet', label: 'A4' },
  { key: 'airplane', label: '비행기' },
  { key: 'receipt', label: '영수증' },
  { key: 'memo', label: '메모지' },
]

export function StartScreen({ best, variant, startStage, muted, onToggleMute, onChoose, onChooseStage, onStart }: Props) {
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

      <div className="variant-pick">
        <p className="pick-label">시작 단계 <span className="dev-tag">개발용</span></p>
        <div className="pick-row">
          {STAGES.map((st) => (
            <button
              key={st.t}
              className={'pick-btn' + (startStage === st.t ? ' active' : '')}
              onClick={() => onChooseStage(st.t)}
            >
              {st.label}
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
