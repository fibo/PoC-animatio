/**
 * Util to create an SVG element.
 *
 * @example
 *
 * ```ts
 * const svg = createElementSvg('svg')
 *   .set('width', '100')
 *   .set('height', '100')
 * ```
 */
export function createElementSvg(qualifiedName) {
  var element = document.createElementNS('http://www.w3.org/2000/svg', qualifiedName)
  return Object.assign(element, {
    set: (attributeName, value) => {
      element.setAttribute(attributeName, value)
      return element
    }
  })
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
