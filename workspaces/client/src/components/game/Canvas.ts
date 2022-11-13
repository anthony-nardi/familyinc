import { time } from 'console'
import CanvasItems from './CanvasItems'

type Options = {
  width?: number
  height?: number
  items?: any
}

export default class Canvas {
  private container: HTMLElement
  private cw: number
  private ch: number
  private interval: number | null
  private rafInterval: number | null

  private finishCallbacks: Array<() => void> = []

  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private pixelRatio: number
  private things: any

  constructor(
    container: HTMLElement,
    {
      width = container.clientWidth,
      height = container.clientHeight,
      items = []
    }: Options = {}
  ) {
    this.container = container
    this.cw = width
    this.ch = height
    this.pixelRatio = window.devicePixelRatio || 1
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D
    console.log(container)
    container.appendChild(this.canvas)

    this.things = new Set()

    // @ts-expect-error any
    items.map(item => {
      this.things.add(
        new CanvasItems({
          cw: this.cw,
          ch: this.ch,
          // @ts-exect-error t
          ref: item.ref,
          x: item.x,
          y: item.y,
          speed: item.speed,
          scale: item.scale
        })
      )
    })

    this.updateDimensions()
  }

  destroy(): void {
    this.canvas.parentElement?.removeChild(this.canvas)
    window.clearInterval(this.interval as number)
    window.cancelAnimationFrame(this.rafInterval as number)
  }

  start(): (() => void) | null {
    if (this.interval != null) return null

    this.rafInterval = window.requestAnimationFrame(() => this.update())
    return (): void => this.stop()
  }

  private updateDimensions(): void {
    this.canvas.width = this.cw * this.pixelRatio
    this.canvas.height = this.ch * this.pixelRatio
    this.canvas.style.width = `${this.cw}px`
    this.canvas.style.height = `${this.ch}px`
    this.ctx.scale(this.pixelRatio, this.pixelRatio)

  }

  setSize(width: number, height: number): void {
    this.cw = width
    this.ch = height
    this.updateDimensions()
  }

  resetSize(): void {
    this.cw = this.container.clientWidth
    this.ch = this.container.clientHeight
    this.updateDimensions()
  }

  stop(): void {
    window.clearInterval(this.interval as number)
    this.interval = null
  }



  onFinish(cb: () => void): void {
    this.finishCallbacks.push(cb)
  }

  private _clear(force = false): void {
    this.ctx.globalCompositeOperation = 'destination-out'
    // this.ctx.fillStyle = `rgba(0, 0, 0 ${force ? '' : ', 0.5'})`
    this.ctx.fillRect(0, 0, this.cw, this.ch)
    this.ctx.globalCompositeOperation = 'destination-over'
  }

  private _finish(): void {
    this._clear(true)
    this.rafInterval = null
    this.finishCallbacks.forEach((cb) => cb())
  }

  update(): void {
    this._clear()

    for (const particle of this.things.values()) {
      particle.draw(this.ctx)
      particle.update()

      if (particle.shouldRemove(this.cw, this.ch)) {
        this.things.delete(particle)
      }
    }

    if (this.interval || this.things.size > 0) {
      this.rafInterval = window.requestAnimationFrame(() => this.update())
    } else {
      this._finish()
    }
  }
}
