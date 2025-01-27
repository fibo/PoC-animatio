import { createElementSvg, html } from './utils.js'

class BouncingBall extends HTMLElement {
  static localName = 'bouncing-ball'
  static template = html`
    <svg xmlns="http://www.w3.org/2000/svg"></svg>
  `
  ball = createElementSvg('ellipse')
  connectedCallback() {
    this.appendChild(document.importNode(BouncingBall.template.content, true))
    const size = this.getAttribute('size')
    const svg = this.querySelector('svg')
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`)
    svg.appendChild(this.ball.set('rx', 20).set('ry', 20))
  }
}

customElements.define(BouncingBall.localName, BouncingBall)
