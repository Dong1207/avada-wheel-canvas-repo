/**
 * Check if type is expected
 * @param { unknown } param Variable to check
 * @param { ...string } types Expected types
 * @return { boolean } Returns if expectation is correct
 */
export const isExpectType = (param: unknown, ...types: string[]): boolean => {
  return types.some(type => Object.prototype.toString.call(param).slice(8, -1).toLowerCase() === type)
}

export const get = (data: object, strKeys: string) => {
  const keys = strKeys.split('.')
  for (let key of keys) {
    const res = data[key]
    if (!isExpectType(res, 'object', 'array')) return res
    data = res
  }
  return data
}

export const has = (data: object, key: string | number): boolean => {
  return Object.prototype.hasOwnProperty.call(data, key)
}

/**
 * Remove \n
 * @param { string } str String to process
 * @return { string } Returns new string
 */
export const removeEnter = (str: string): string => {
  return [].filter.call(str, s => s !== '\n').join('')
}

/**
 * Convert any data type to number
 * @param num 
 */
export const getNumber = (num: unknown): number => {
  if (num === null) return 0
  if (typeof num === 'object') return NaN
  if (typeof num === 'number') return num
  if (typeof num === 'string') {
    if (num[num.length - 1] === '%') {
      return Number(num.slice(0, -1)) / 100
    }
    return Number(num)
  }
  return NaN
}

/**
 * Check if color is valid (transparent === invalid)
 * @param color Color
 */
export const hasBackground = (color: string | undefined | null): boolean => {
  if (typeof color !== 'string') return false
  color = color.toLocaleLowerCase().trim()
  if (color === 'transparent') return false
  if (/^rgba/.test(color)) {
    const alpha = /([^\s,]+)\)$/.exec(color)
    if (getNumber(alpha) === 0) return false
  }
  return true
}

/**
 * Calculate through padding
 * @return { object } Block border information
 */
export const computePadding = (
  block: { padding?: string },
  getLength: Function
): [number, number, number, number] => {
  let padding = block.padding?.split(' ').map(n => getLength(n)) || [0],
    paddingTop = 0,
    paddingBottom = 0,
    paddingLeft = 0,
    paddingRight = 0
  switch (padding.length) {
    case 1:
      paddingTop = paddingBottom = paddingLeft = paddingRight = padding[0]
      break
    case 2:
      paddingTop = paddingBottom = padding[0]
      paddingLeft = paddingRight = padding[1]
      break
    case 3:
      paddingTop = padding[0]
      paddingLeft = paddingRight = padding[1]
      paddingBottom = padding[2]
      break
    default:
      paddingTop = padding[0]
      paddingBottom = padding[1]
      paddingLeft = padding[2]
      paddingRight = padding[3]
  }
  // Check if value is passed separately and is not 0
  const res = { paddingTop, paddingBottom, paddingLeft, paddingRight }
  for (let key in res) {
    // Check if property exists and is number or string
    res[key] = has(block, key) && isExpectType(block[key], 'string', 'number')
      ? getLength(block[key])
      : res[key]
  }
  return [paddingTop, paddingBottom, paddingLeft, paddingRight]
}

/**
 * Throttle function
 * @param fn Function to process
 * @param wait Time in milliseconds
 * @returns Wrapped throttle function
 */
export const throttle = (fn: Function, wait = 300) => {
  let timeId = null as any
  return function (this: any, ...args: any[]) {
    if (timeId) return
    timeId = setTimeout(() => {
      fn.apply(this, args)
      clearTimeout(timeId)
      timeId = null
    }, wait)
  }
}

/**
 * Calculate prize index through probability
 * @param { Array<number | undefined> } rangeArr Probability
 * @returns { number } Winning index
 */
export const computeRange = (rangeArr: Array<number | undefined>): number => {
  const ascendingArr: number[] = []
  // Add map to optimize ts type inference
  const sum = rangeArr.map(num => Number(num)).reduce((prev, curr) => {
    if (curr > 0) { // Greater than 0
      const res = prev + curr
      ascendingArr.push(res)
      return res
    } else { // Less than or equal to 0 or NaN
      ascendingArr.push(NaN)
      return prev
    }
  }, 0)
  const random = Math.random() * sum
  return ascendingArr.findIndex(num => random <= num)
}

/**
 * Split string by width to achieve line break effect
 * @param text 
 * @param maxWidth 
 * @returns 
 */
export const splitText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  getWidth: (lines: string[]) => number,
  lineClamp: number = Infinity
): string[] => {
  // If lineClamp is set incorrectly, ignore the property
  if (lineClamp <= 0) lineClamp = Infinity
  let str = ''
  const lines = []
  const EndWidth = ctx.measureText('...').width
  for (let i = 0; i < text.length; i++) {
    str += text[i]
    let currWidth = ctx.measureText(str).width
    const maxWidth = getWidth(lines)
    // If calculating last line, add width of three dots
    if (lineClamp === lines.length + 1) currWidth += EndWidth
    // If no width left, no need to calculate further
    if (maxWidth < 0) return lines
    // If current line width is not enough, process next line
    if (currWidth > maxWidth) {
      lines.push(str.slice(0, -1))
      str = text[i]
    }
    // If this is the last line, add three dots and break
    if (lineClamp === lines.length) {
      lines[lines.length - 1] += '...'
      return lines
    }
  }
  if (str) lines.push(str)
  if (!lines.length) lines.push(text)
  return lines
}

// Get a reordered array
export const getSortedArrayByIndex = <T>(arr: T[], order: number[]): T[] => {
  const map: { [key: number]: T } = {}, res = []
  for (let i = 0; i < arr.length; i++) {
    map[i] = arr[i]
  }
  for (let i = 0; i < order.length; i++) {
    const curr = map[order[i]]
    if (curr) (res[i] = curr)
  }
  return res
}
