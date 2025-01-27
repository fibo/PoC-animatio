import { createElementSvg, html } from './utils.js'

const containerSize = 200

class BouncingBall extends HTMLElement {
  static localName = 'bouncing-ball'
  static template = html`
    <style>
      :host {
        display: block;
        width: ${containerSize}px;
        height: ${containerSize}px;
        cursor: pointer;
        border: 1px solid;
      }
    </style>
    <svg
      viewBox="0 0 ${containerSize} ${containerSize}"
      width=${containerSize}
      height=${containerSize}
      xmlns="http://www.w3.org/2000/svg"></svg>
  `
  ball = createElementSvg('ellipse')
  status = 'stopped'
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(BouncingBall.template.content.cloneNode(true))
    const svg = this.svg = this.shadowRoot.querySelector('svg')
    svg.setAttribute('viewBox', `0 0 ${containerSize} ${containerSize}`)
    svg.appendChild(this.ball
      .set('cx', containerSize / 2).set('cy', 30).set('rx', 20).set('ry', 20)
    )
  }
  connectedCallback() {
    this.svg.addEventListener('click', this)
  }
  handleEvent(event) {
    if (event.type == 'click') {
      // Toggle animation.
      if (this.status == 'stopped') this.play()
      else if (this.status == 'playing') this.stop()
    }
  }
  play() {
    this.status = 'playing'
  }
  stop() {
    this.status = 'stopped'
  }
}

customElements.define(BouncingBall.localName, BouncingBall)
