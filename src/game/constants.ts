// 가상 해상도 (도트 그리드). CSS로 확대되어 도트 룩을 유지한다.
export const VW = 135
export const VH = 240

// 물리 (단위: 가상픽셀, 초)
export const GRAVITY = 300 // 아래 방향 가속도
export const WIND_ACCEL = -860 // 바람 활성 중 위 방향 가속도
export const WIND_DURATION = 0.2 // (미사용) 예전 원샷 바람 지속시간
// 숨 게이지(0..1). 누르면 빠르게 소진, 떼면 천천히 회복.
export const BREATH_DRAIN = 0.42 // 초당 소진량 → 가득참에서 약 2.4초면 바닥
export const BREATH_REGEN = 0.26 // 초당 회복량 → 바닥에서 가득참까지 약 3.8초
export const MAX_UP_SPEED = -270
export const MAX_DOWN_SPEED = 340

// 월드 경계
export const CEILING_Y = 8 // 종이 상단이 넘어갈 수 없는 선
export const FLOOR_TOP = 210 // 이 선에 종이가 닿으면 게임 오버 (얼굴/바닥 위치)

// 종이 시작 위치
export const PAPER_W = 28 // 바닥과 수평으로 누운 가로형 종이
export const PAPER_H = 13
export const PAPER_START_Y = 40

// 좌우: 바람 각도에 따른 수평 이동
export const WIND_X_ACCEL = 620 // 바람 활성 중 수평 가속도(방향 * 이 값)
export const MAX_X_SPEED = 150
export const X_DRAG = 1.8 // 수평 감쇠(공기 저항)
export const WIND_STEER_RANGE = 14 // 종이 중심에서 이 거리(≈종이 절반)면 최대 좌우 힘(±1)
export const WALL_MARGIN = 4 // 좌우 벽 여백

// 스테이지 전환 시각(초): 방→공원→하늘→성층권→우주
export const PARK_TIME = 10
export const SKY_TIME = 60
export const STRATO_TIME = 120
export const SPACE_TIME = 200
export const STAGE_FADE = 2.5 // 크로스페이드 시간(초)
// (구버전 호환) 공원 페이드
export const PARK_FADE = STAGE_FADE

// 새 (공원에서 좌↔우로 날아다님)
export const BIRD_MIN_GAP = 1.6 // 스폰 최소 간격(초)
export const BIRD_MAX_GAP = 3.2 // 스폰 최대 간격(초)
export const BIRD_SPEED_MIN = 34
export const BIRD_SPEED_MAX = 66
export const BIRD_R = 6 // 새 충돌 반경

// 비행기 (하늘): 좌↔우로 가되 랜덤하게 각도(수직속도)를 바꿈
export const PLANE_MIN_GAP = 1.6
export const PLANE_MAX_GAP = 3.2
export const PLANE_SPEED = 50
export const PLANE_VY_MAX = 40 // 각도 변경 시 수직 속도 범위(±)
export const PLANE_ANGLE_GAP = 0.7 // 각도 바꾸는 간격(초)
export const PLANE_R = 8

// 운석 (성층권): 대각선으로 떨어지고 랜덤하게 2개로 분열
export const METEOR_MIN_GAP = 1.3
export const METEOR_MAX_GAP = 2.6
export const METEOR_VY = 95
export const METEOR_VX = 45
export const METEOR_R = 6
export const METEOR_SPLIT_CHANCE = 1.1 // 초당 분열 확률(중간 구간에서)

// UFO (우주): 좌/우 끝에 고정 등장, 빔 3~4회 쏘고 떠남
export const UFO_MIN_GAP = 2.4
export const UFO_MAX_GAP = 4.2
export const UFO_SHOTS_MIN = 3
export const UFO_SHOTS_MAX = 4
export const UFO_CHARGE = 0.7 // 빔 예고(차징) 시간
export const UFO_FIRE = 0.32 // 빔 발사(치명) 시간
export const UFO_IDLE = 0.55 // 빔 사이 간격
export const UFO_R = 10
export const BEAM_HALF = 4 // 빔 반두께

// 새와 부딪히면 게임 오버 (아슬하게 스치면 니어미스 보너스)

// 점수: 생존 포인트 + 니어미스/콤보 보너스
export const SCORE_RATE = 10 // 초당 기본 생존 점수
export const NEAR_MARGIN = 10 // 충돌은 안 하고 이 거리 안으로 스치면 니어미스
export const NEAR_BONUS = 30 // 니어미스 기본 보너스
export const COMBO_WINDOW = 2.5 // 콤보 유지 시간(초)

// 리듬(리듬세상 감성) 비트
export const BEAT_BPM = 132

export const BEST_KEY = 'ddi.best'
