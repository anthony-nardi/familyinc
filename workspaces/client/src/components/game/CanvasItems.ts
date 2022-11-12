
type Particle = any
type ThingOptions = {
  cw: number
  ch: number
  x?: number
  y?: number
  ref: any
  speed?: number
  scale?: number
}

export default class Things {
  private _set: Set<Particle>
  public cw: number
  public ch: number
  public x: number
  public y: number
  public ref: any
  public speed: number;
  public scale: number;

  constructor({
    cw,
    ch,
    x = 0,
    y = 0,
    speed = 1,
    scale = 1,
    ref
  }: ThingOptions) {
    this.cw = cw
    this.ch = ch
    this.x = x
    this.y = y
    this.ref = ref
    this.scale = scale
    this.speed = speed
  }

  update() {
    this.y = this.y + (1 * this.speed)
  }

  shouldRemove() {
    return this.y > this.ch || this.x > this.cw
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(this.ref.current, this.x, this.y, 40 * this.scale, 40 * this.scale);
  };


}
