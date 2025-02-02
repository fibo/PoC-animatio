/**
 * Create an SVG element.
 *
 * @example
 *
 * ```js
 * const circle = createSvgElement('circle')
 *   .set('cx', 100)
 *   .set('cy', 100)
 *
 * console.log(circle.get('cx'))
 * ```
 *
 * @param {string} qualifiedName
 */
export function createSvgElement(qualifiedName) {
  var element = document.createElementNS('http://www.w3.org/2000/svg', qualifiedName)
  return Object.assign(element, {
    get: (attributeName) => element.getAttribute(attributeName),
    set: (attributeName, value) => {
      element.setAttribute(attributeName, value)
      return element
    }
  })
}

/**
 * Create an SVG.
 *
 * @example
 *
 * ```js
 * const svg = createSvg(100, 200)
 * ```
 *
 * @param {number} width
 * @param {number} height
 */
export function createSvg(width, height) {
  var svg = createSvgElement('svg').set('xmlns', 'http://www.w3.org/2000/svg')
  return Object.assign(svg, {
    resize: (width, height) =>
      svg.set('width', width)
         .set('height', height)
         .set('viewBox', `0 0 ${width} ${height}`)
  }).resize(width, height)
}

/** Round number to two decimals. */
export function decimal2(value) {
  return Number(value.toFixed(2))
}

/**
 * Create an HTML template element from a string template.
 *
 * @example
 *
 * ```js
 * const myTemplate = html`
 *   <style>
 *     :host {
 *       display: block;
 *     }
 *   </style>
 *   <slot></slot>
 * `
 * ```
 */
export function html(strings, ...expressions) {
  var template = document.createElement('template')
  template.innerHTML = strings.reduce((result, str, i) => result + str + (expressions[i] ?? ''), '')
  return template
}

export const assetsBaseUrl = import.meta.url.split('/').slice(0, -1).join('/')
