export type Phase = 'ready' | 'playing' | 'over'

export type PaperVariant = 'sheet' | 'airplane' | 'receipt' | 'memo'

export type Stage = 'room' | 'park' | 'sky' | 'strato' | 'space'

export interface Bird {
  x: number
  y: number
  vx: number // 수평 속도(부호=방향)
  flap: number // 날갯짓 위상
  hit: boolean // 이미 종이를 친 새인가(중복 충돌 방지)
  nearScored: boolean // 니어미스 보너스를 이미 준 새인가
}

export interface Plane {
  x: number
  y: number
  vx: number
  vy: number // 각도(수직속도), 랜덤하게 바뀜
  angleT: number // 다음 각도 변경까지 남은 시간
  hit: boolean
  nearScored: boolean
}

export interface Meteor {
  x: number
  y: number
  vx: number
  vy: number
  canSplit: boolean // 아직 분열할 수 있는가
  r: number
  hit: boolean
  nearScored: boolean
}

export interface Ufo {
  x: number
  y: number
  side: 1 | -1 // 왼쪽(-1) / 오른쪽(1) 벽
  shotsLeft: number
  phase: 'charge' | 'fire' | 'idle'
  phaseT: number // 현재 페이즈 남은 시간
  leaving: boolean // 다 쏘고 떠나는 중
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number // 남은 수명(초)
  max: number // 최초 수명(초)
  kind: 'wind' | 'spark'
}

export interface GameState {
  phase: Phase
  time: number // 생존 시간(초)
  score: number // 총점(생존 + 보너스)
  scoreAcc: number // 점수 누적(소수) — score는 floor(scoreAcc)
  combo: number // 연속 니어미스 콤보
  comboTimer: number // 콤보 유지 남은 시간
  best: number
  // 종이
  x: number
  y: number
  vx: number // 수평 속도 (바람 각도로 발생)
  vy: number
  rot: number
  variant: PaperVariant
  // 바람 (누르고 있는 동안 지속)
  holding: boolean // 포인터를 누르고 있는가
  breath: number // 남은 숨 0(바닥)..1(가득). 누르면 소진, 떼면 회복
  strain: number // 얼굴이 힘들어하는 정도 0..1 (= 1 - breath)
  windDir: number // 종이에 작용하는 수평 방향 -1(좌)..0..1(우)
  windX: number // 바람(얼굴)이 발생한 가상 x
  windY: number // 바람(얼굴)이 발생한 가상 y
  blowing: boolean // 실제로 바람이 나오는 중 (누름 && 5초 이내)
  // 연출
  particles: Particle[]
  scroll: number // 배경 스크롤(높이감)
  beat: number // 0..1 비트 위상
  shake: number // 화면 흔들림 잔량
  // 위협 (스테이지별)
  birds: Bird[]
  planes: Plane[]
  meteors: Meteor[]
  ufos: Ufo[]
  hazardTimer: number // 다음 위협 스폰까지 남은 시간
  // 이벤트 카운터(사운드/연출 트리거용, 단조 증가)
  hitCount: number // 충돌 횟수
  spawnCount: number // 위협 스폰 횟수(처프/등장음)
  niceCount: number // 니어미스 횟수
  niceBonus: number // 마지막 니어미스로 얻은 점수
}
