import { assetsBaseUrl, createSvg, createSvgElement, decimal2, html } from './assets/utils.js'

class BouncingBall extends HTMLElement {
  static localName = 'bouncing-ball'
  static strokeWidth = 2
  static containerWidth = 150
  static containerHeight = 200
  static template = html`
    <style>
      :host {
        display: block;
        width: ${BouncingBall.containerWidth}px;
        height: ${BouncingBall.containerHeight}px;
        cursor: pointer;
        border: 2px solid gainsboro;
        border-radius: var(--radius-s);
      }
      :host(:not([data-action])) {
        cursor: not-allowed;
      }
      ellipse {
        fill: orange;
        stroke-width: ${BouncingBall.strokeWidth}px;
        stroke: black;
        transition: opacity 250ms;
      }
      ellipse.disposing {
        opacity: 0.4;
      }
    </style>
  `
  ball = createSvgElement('ellipse')
  /** @type {'stopped'|'playing'|'disposing'} */
  status = 'stopped'
  /** Frames per second. */
  FPS = 30
  /** Initial ball y coordinate. */
  initialY = 30
  /** Ball radius, excluding stroke-width. */
  radius = 20
  /** Duration of ball falling, in milliseconds. */
  fallDuration = 1000
  /** Duration of bll bouncing, in milliseconds. */
  bounceDuration = 300
  /**
   * Indicates if the ball is bouncing on the floor.
   * During this stage, the ball will deform due to elasticity.
   */
  isBouncing = false
  /**
   * Ball velocity direction.
   * @type {'up'|'down'}
   */
  direction = 'down'
  /** During bouncing the radius ball will stretch up to this percentage. */
  maxBallRadiusDeformationPercentage = .75

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    const { containerWidth, containerHeight } = BouncingBall
    this.shadowRoot.appendChild(BouncingBall.template.content.cloneNode(true))
    const svg = this.svg = createSvg(containerWidth, containerHeight)
    svg.appendChild(this.ball
      .set('cx', containerWidth / 2)
      .set('cy', this.initialY)
      .set('rx', this.radius)
      .set('ry', this.radius)
    )
    this.shadowRoot.appendChild(svg)
  }

  connectedCallback() {
    this.dataset.action = 'start'
    this.svg.addEventListener('click', this)
  }

  handleEvent(event) {
    if (event.type == 'click') {
      // Toggle animation.
      if (this.status == 'stopped') this.start()
      else if (this.status == 'playing') this.stop()
    }
  }

  generateAnimation() {
    const self = this

    const numFramesOfBouncing = Math.floor(this.bounceDuration / this.deltaT)
    const deltaR = this.radius * this.maxBallRadiusDeformationPercentage / numFramesOfBouncing / 2
    const distance = Math.floor(BouncingBall.containerHeight - this.initialY - this.radius)
    // The deltaY with no acceleration.
    const uniformDeltaY = Math.floor(distance * this.deltaT / this.fallDuration)

    function* animationGenerator() {
      while (true) {
        const currentY = Number(self.ball.get('cy'))
        if (self.isBouncing) {
//// Bounce animation.
          let i = 1
          while(i <= numFramesOfBouncing) {
            let ry = Number(self.ball.get('ry'))
            if (i <= numFramesOfBouncing / 2) ry -= deltaR
            else ry += deltaR
            // Keep the same area.
            let rx = self.radius * self.radius / ry
            // Round to two decimals.
            rx = decimal2(rx)
            ry = decimal2(ry)
            // Deform the ball.
            self.ball.set('ry', ry)
            self.ball.set('rx', rx)
            // Move center in order to always touch the floor.
            self.ball.set('cy', decimal2(BouncingBall.containerHeight - ry - BouncingBall.strokeWidth))
            i++
            yield Promise.resolve()
          }
          // Once bounce is finished, restore original ball radius.
          self.ball.set('rx', self.radius).set('ry', self.radius)
          self.isBouncing = false
          self.direction = 'up'
        } else if (currentY < self.initialY) {
//// Ball returned to the top.
          self.direction = 'down'
          // Do not go above the container.
          self.ball.set('cy', self.initialY)
          // Stop animation if status is disposing.
          if (self.status == 'disposing') {
            self.status = 'stopped'
            return
          }
        } else {
//// Compute deltaY.
          let deltaY
          if (self.status == 'disposing')
            // Move with constant velocity during disposure.
            deltaY = 2 * uniformDeltaY
          else
            // A sort of acceleration.
            deltaY = Math.max(1, Math.floor(uniformDeltaY * (currentY - self.initialY) / 7))
          // Adjust vector direction.
          if (self.direction == 'up') deltaY = -deltaY
//// Check if it is a hit.
          if (!self.isBouncing && (currentY + self.radius + deltaY > BouncingBall.containerHeight)) {
            // Do not go below the container.
            self.ball.set('cy', decimal2(BouncingBall.containerHeight - self.radius - BouncingBall.strokeWidth))
            // Play bouncing sound.
            self.playSound()
            // Start bouncing.
            self.isBouncing = true
          } else {
//// Move the ball.
          self.ball.set('cy', decimal2(currentY + deltaY))
          }
        }
        yield
      }
    }
    this.animation = animationGenerator()
  }

  playSound() {
    const sound = this.audioContext.createBufferSource()
    sound.buffer = this.soundBuffer
    sound.connect(this.audioContext.destination)
    sound.start(0)
  }

  /** Must be called during some user interaction, e.g. click. */
  async setupAudio() {
    // Do nothing if audio was already initialized.
    if (this.audioContext) return
    this.audioContext = new AudioContext()
    // Fetch audio.
    const response = await fetch(`${assetsBaseUrl}/basketball.wav`)
    const arrayBuffer = await response.arrayBuffer()
    this.soundBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
  }

  loop() {
    // Next animation frame can run when
    // current time is greater than last frame time plus frame duration.
    if (document.timeline.currentTime > this.lastFrameTime + this.deltaT) {
      this.animation.next()
      this.lastFrameTime = document.timeline.currentTime
    }
    if (this.status == 'stopped') {
      this.dataset.action = 'start'
      this.ball.classList.remove('disposing')
      this.animation.return()
      cancelAnimationFrame(this.frameRequestId)
    } else {
      this.requestAnimationFrame()
    }
  }

  requestAnimationFrame() {
    this.frameRequestId = requestAnimationFrame(this.loop.bind(this))
  }

  async start() {
    this.status = 'playing'
    this.dataset.action = 'stop'
    await this.setupAudio()
    this.generateAnimation()
    // Will start animation immediately.
    // Using
    //
    //     this.lastFrameTime = document.timeline.currentTime
    //
    // would start animation after 1 frame duration.
    this.lastFrameTime = document.timeline.currentTime - this.deltaT
    this.requestAnimationFrame()
  }

  stop() {
    this.status = 'disposing'
    this.ball.classList.add('disposing')
    this.direction = 'up'
    delete this.dataset.action
  }

  /** Frame duration in milliseconds. */
  get deltaT() {
    return Math.floor(1000 / this.FPS)
  }
}

addEventListener('load', () => {
  customElements.define(BouncingBall.localName, BouncingBall)


})
