import { BEST_KEY } from './game/constants'

export function loadBest(): number {
  try {
    const v = localStorage.getItem(BEST_KEY)
    const n = v ? parseInt(v, 10) : 0
    return Number.isFinite(n) && n > 0 ? n : 0
  } catch {
    return 0
  }
}

export function saveBest(score: number): void {
  try {
    localStorage.setItem(BEST_KEY, String(Math.floor(score)))
  } catch {
    // 저장 실패는 무시 (프라이빗 모드 등)
  }
}
