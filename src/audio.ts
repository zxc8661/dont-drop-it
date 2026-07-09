// 외부 파일 없이 WebAudio로 즉석 생성하는 효과음. 음소거는 LocalStorage에 저장.
const MUTE_KEY = 'ddi.muted'

type ToneOpts = {
  type?: OscillatorType
  gain?: number
  at?: number // 시작 지연(초)
  to?: number // 목표 주파수(글라이드)
}
type NoiseOpts = {
  gain?: number
  type?: BiquadFilterType
  freq?: number
  at?: number
}

class Sfx {
  private ctx: AudioContext | null = null
  muted = false

  constructor() {
    try {
      this.muted = localStorage.getItem(MUTE_KEY) === '1'
    } catch {
      /* ignore */
    }
  }

  // 사용자 제스처(터치/클릭)에서 호출해 오디오 컨텍스트를 깨운다.
  ensure(): void {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (AC) this.ctx = new AC()
    }
    if (this.ctx && this.ctx.state === 'suspended') void this.ctx.resume()
  }

  setMuted(m: boolean): void {
    this.muted = m
    try {
      localStorage.setItem(MUTE_KEY, m ? '1' : '0')
    } catch {
      /* ignore */
    }
  }

  toggle(): boolean {
    this.setMuted(!this.muted)
    if (!this.muted) this.click()
    return this.muted
  }

  private tone(freq: number, dur: number, o: ToneOpts = {}): void {
    if (this.muted || !this.ctx) return
    const c = this.ctx
    const t0 = c.currentTime + (o.at ?? 0)
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = o.type ?? 'square'
    osc.frequency.setValueAtTime(freq, t0)
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur)
    const peak = o.gain ?? 0.18
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    osc.connect(g).connect(c.destination)
    osc.start(t0)
    osc.stop(t0 + dur + 0.03)
  }

  private noise(dur: number, o: NoiseOpts = {}): void {
    if (this.muted || !this.ctx) return
    const c = this.ctx
    const t0 = c.currentTime + (o.at ?? 0)
    const n = Math.max(1, Math.floor(c.sampleRate * dur))
    const buf = c.createBuffer(1, n, c.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n)
    const src = c.createBufferSource()
    src.buffer = buf
    const f = c.createBiquadFilter()
    f.type = o.type ?? 'highpass'
    f.frequency.value = o.freq ?? 800
    const g = c.createGain()
    g.gain.value = o.gain ?? 0.2
    src.connect(f).connect(g).connect(c.destination)
    src.start(t0)
  }

  blow(): void {
    this.ensure()
    this.noise(0.26, { gain: 0.13, type: 'bandpass', freq: 640 })
  }
  chirp(): void {
    this.ensure()
    this.tone(1500, 0.06, { type: 'square', gain: 0.07 })
    this.tone(2000, 0.06, { type: 'square', gain: 0.07, at: 0.07 })
  }
  hit(): void {
    this.ensure()
    this.noise(0.16, { gain: 0.24, type: 'lowpass', freq: 1400 })
    this.tone(170, 0.2, { type: 'sawtooth', gain: 0.2, to: 80 })
  }
  nice(combo: number): void {
    this.ensure()
    const base = 780 + Math.min(combo, 8) * 90 // 콤보가 쌓일수록 음이 높아짐
    this.tone(base, 0.07, { type: 'triangle', gain: 0.12 })
    this.tone(base * 1.5, 0.09, { type: 'triangle', gain: 0.12, at: 0.06 })
  }
  best(): void {
    this.ensure()
    const notes = [523, 659, 784, 1047]
    notes.forEach((f, i) => this.tone(f, 0.16, { type: 'triangle', gain: 0.16, at: i * 0.1 }))
  }
  over(): void {
    this.ensure()
    this.tone(392, 0.2, { type: 'triangle', gain: 0.16, to: 180 })
    this.tone(196, 0.32, { type: 'triangle', gain: 0.16, at: 0.18, to: 110 })
  }
  click(): void {
    this.ensure()
    this.tone(660, 0.05, { type: 'square', gain: 0.1 })
  }
}

export const sfx = new Sfx()
