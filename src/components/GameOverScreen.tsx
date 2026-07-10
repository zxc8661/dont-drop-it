interface Props {
  score: number
  best: number
  isNewBest: boolean
  onRetry: () => void
  onHome: () => void
}

export function GameOverScreen({ score, best, isNewBest, onRetry, onHome }: Props) {
  return (
    <div className="overlay gameover">
      <h2 className="go-title">GAME OVER</h2>

      {isNewBest && <div className="new-best">🎉 신기록!</div>}

      <div className="score-card">
        <div className="score-row">
          <span>점수</span>
          <b>{score}</b>
        </div>
        <div className="score-row muted">
          <span>최고 점수</span>
          <b>{best}</b>
        </div>
      </div>

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={onHome}>
          홈
        </button>
        <button className="btn btn-primary" onClick={onRetry}>
          다시하기
        </button>
      </div>
    </div>
  )
}
