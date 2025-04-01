import '../utils/polyfill'
import { has, isExpectType, throttle } from '../utils/index'
import { name, version } from '../../package.json'
import { ConfigType, UserConfigType, ImgItemType, ImgType, Tuple } from '../types/index'
import { defineReactive } from '../observer'
import Watcher, { WatchOptType } from '../observer/watcher'

export default class Lucky {
  static version: string = version
  protected readonly version: string = version
  protected readonly config: ConfigType
  protected readonly ctx: CanvasRenderingContext2D
  protected htmlFontSize: number = 16
  protected rAF: Function = function () {}
  protected boxWidth: number = 0
  protected boxHeight: number = 0
  protected data: {
    width: string | number,
    height: string | number
  }

  /**
   * Common constructor
   * @param config
   */
  constructor (
    config: string | HTMLDivElement | UserConfigType,
    data: {
      width: string | number,
      height: string | number
    }
  ) {
    // Compatibility code start: To handle v1.0.6 version where a dom was passed here
    if (typeof config === 'string') config = { el: config } as UserConfigType
    else if (config.nodeType === 1) config = { el: '', divElement: config } as UserConfigType
    // Handle roughly here, pending optimization, externally exposed type is UserConfigType, but internally expected is ConfigType
    config = config as UserConfigType
    this.config = config as ConfigType
    this.data = data
    // Start initialization
    if (!config.flag) config.flag = 'WEB'
    if (config.el) config.divElement = document.querySelector(config.el) as HTMLDivElement
    // If parent box exists, create canvas tag
    if (config.divElement) {
      // Execute overwrite logic regardless of whether there is canvas in the box
      config.canvasElement = document.createElement('canvas')
      config.divElement.appendChild(config.canvasElement)
    }
    // Get canvas context
    if (config.canvasElement) {
      config.ctx = config.canvasElement.getContext('2d')!
      // Add version info to tag for version issue tracking
      config.canvasElement.setAttribute('package', `${name}@${version}`)
      config.canvasElement.addEventListener('click', e => this.handleClick(e))
    }
    this.ctx = config.ctx as CanvasRenderingContext2D
    // Initialize window methods
    this.initWindowFunction()
    // If canvas context cannot be obtained, drawing cannot proceed
    if (!this.config.ctx) {
      console.error('Unable to get CanvasContext2D')
    }
    // Listen for window resize event to reset
    if (window && typeof window.addEventListener === 'function') {
      window.addEventListener('resize', throttle(() => this.resize(), 300))
    }
    // Listen for async setting of html fontSize and redraw
    if (window && typeof window.MutationObserver === 'function') {
      new window.MutationObserver(() => {
        this.resize()
      }).observe(document.documentElement, { attributes: true })
    }
  }

  /**
   * Initialize component size/units
   */
  protected resize(): void {
    this.config.beforeResize?.()
    // Initialize fontSize first to prevent rem unit issues later
    this.setHTMLFontSize()
    // Get config to set dpr
    this.setDpr()
    // Initialize width and height
    this.resetWidthAndHeight()
    // Scale canvas according to dpr
    this.zoomCanvas()
  }

  /**
   * Initialize method
   */
  protected initLucky () {
    this.resize()
    if (!this.boxWidth || !this.boxHeight) {
      return console.error('无法获取到宽度或高度')
    }
  }

  /**
   * Mouse click event
   * @param e Event parameters
   */
  protected handleClick (e: MouseEvent): void {}

  /**
   * Root tag font size
   */
  protected setHTMLFontSize (): void {
    if (!window) return
    this.htmlFontSize = +window.getComputedStyle(document.documentElement).fontSize.slice(0, -2)
  }

  // Clear canvas
  public clearCanvas (): void {
    const [width, height] = [this.boxWidth, this.boxHeight]
    this.ctx.clearRect(-width, -height, width * 2, height * 2)
  }

  /**
   * Device pixel ratio
   * Automatically obtained in window environment, manually passed in other environments
   */
  protected setDpr (): void {
    const { config } = this
    if (config.dpr) {
      // Priority use dpr from config
    } else if (window) {
      window['dpr'] = config.dpr = window.devicePixelRatio || 1
    } else if (!config.dpr) {
      console.error(config, '未传入 dpr 可能会导致绘制异常')
    }
  }

  /**
   * Reset box and canvas width/height
   */
  private resetWidthAndHeight (): void {
    const { config, data } = this
    // If in browser environment and box exists
    let boxWidth = 0, boxHeight = 0
    if (config.divElement) {
      boxWidth = config.divElement.offsetWidth
      boxHeight = config.divElement.offsetHeight
    }
    // First get width/height from data, if not in config, get from style
    this.boxWidth = this.getLength(data.width || config['width']) || boxWidth
    this.boxHeight = this.getLength(data.height || config['height']) || boxHeight
    // Reassign width and height to box
    if (config.divElement) {
      config.divElement.style.overflow = 'hidden'
      config.divElement.style.width = this.boxWidth + 'px'
      config.divElement.style.height = this.boxHeight + 'px'
    }
  }

  /**
   * Scale canvas according to dpr and handle displacement
   */
  protected zoomCanvas (): void {
    const { config, ctx } = this
    const { canvasElement, dpr } = config
    const [width, height] = [this.boxWidth * dpr, this.boxHeight * dpr]
    if (!canvasElement) return
    canvasElement.width = width
    canvasElement.height = height
    canvasElement.style.width = `${width}px`
    canvasElement.style.height = `${height}px`
    canvasElement.style['transform-origin'] = 'left top'
    canvasElement.style.transform = `scale(${1 / dpr})`
    ctx.scale(dpr, dpr)
  }

  /**
   * Get some methods from window object
   */
  private initWindowFunction (): void {
    const { config } = this
    if (window) {
      this.rAF = window.requestAnimationFrame ||
        window['webkitRequestAnimationFrame'] ||
        window['mozRequestAnimationFrame'] ||
        function (callback: Function) {
          window.setTimeout(callback, 1000 / 60)
        }
      config.setTimeout = window.setTimeout
      config.setInterval = window.setInterval
      config.clearTimeout = window.clearTimeout
      config.clearInterval = window.clearInterval
      return
    }
    if (config.rAF) {
      // Priority use animation frame
      this.rAF = config.rAF
    } else if (config.setTimeout) {
      // Otherwise use timer
      const timeout = config.setTimeout
      this.rAF = (callback: Function): number => timeout(callback, 16.7)
    } else {
      // If config doesn't provide, assume global setTimeout exists
      this.rAF = (callback: Function): number => setTimeout(callback, 16.7)
    }
  }

  public isWeb () {
    return ['WEB', 'UNI-H5', 'TARO-H5'].includes(this.config.flag)
  }

  /**
   * Asynchronously load image and return image geometric information
   * @param src Image path
   * @param info Image information
   */
  protected loadImg (
    src: string,
    info: ImgItemType,
    resolveName = '$resolve'
  ): Promise<ImgType> {
    return new Promise((resolve, reject) => {
      if (!src) reject(`=> '${info.src}' 不能为空或不合法`)
      if (this.config.flag === 'WEB') {
        let imgObj = new Image()
        imgObj['crossorigin'] = 'anonymous'
        imgObj.onload = () => resolve(imgObj)
        imgObj.onerror = () => reject(`=> '${info.src}' 图片加载失败`)
        imgObj.src = src
      } else {
        // Other platforms expose externally for self-handling
        info[resolveName] = resolve
        info['$reject'] = reject
        return
      }
    })
  }

  /**
   * Common method for drawing images
   * @param imgObj Image object
   * @param rectInfo: [x-axis position, y-axis position, render width, render height] 
   */
  protected drawImage(
    ctx: CanvasRenderingContext2D,
    imgObj: ImgType,
    ...rectInfo: [...Tuple<number, 4>, ...Partial<Tuple<number, 4>>]
  ): void {
    let drawImg
    const { flag, dpr } = this.config
    if (['WEB', 'MP-WX'].includes(flag)) {
      // Browser and new mini-program versions can draw directly
      drawImg = imgObj
    } else if (['UNI-H5', 'UNI-MP', 'TARO-H5', 'TARO-MP'].includes(flag)) {
      // Old mini-program versions need to draw path, special handling here
      type OldImageType = ImgType & { path: CanvasImageSource }
      drawImg = (imgObj as OldImageType).path
    } else {
      // Unknown flag platform passed in
      return console.error('Unexpected flag, platform not yet compatible!')
    }
    const miniProgramOffCtx = (drawImg['canvas'] || drawImg).getContext?.('2d')
    if (miniProgramOffCtx && !this.isWeb()) {
      rectInfo = rectInfo.map(val => val! * dpr) as Tuple<number, 8>
      const temp = miniProgramOffCtx.getImageData(...rectInfo.slice(0, 4))
      ctx.putImageData(temp, ...(rectInfo.slice(4, 6) as Tuple<number, 2>))
    } else {
      if (rectInfo.length === 8) {
        rectInfo = rectInfo.map((val, index) => index < 4 ? val! * dpr : val) as Tuple<number, 8>
      }
      // Try to catch errors
      try {
        ctx.drawImage(drawImg, ...rectInfo as Tuple<number, 8>)
      } catch (err) {
        /**
         * TODO: Safari browser has strange error in init()
         * IndexSizeError: The index is not in the allowed range
         * But this error doesn't affect actual drawing, leave it for now
         */
      }
    }
  }

  /**
   * Calculate image render width and height
   * @param imgObj Image tag element
   * @param imgInfo Image information
   * @param maxWidth Maximum width
   * @param maxHeight Maximum height
   * @return [render width, render height]
   */
  protected computedWidthAndHeight (
    imgObj: ImgType,
    imgInfo: ImgItemType,
    maxWidth: number,
    maxHeight: number
  ): [number, number] {
    // Calculate image's true width and height based on style config
    if (!imgInfo.width && !imgInfo.height) {
      // If no width/height configured, use image's own dimensions
      return [imgObj.width, imgObj.height]
    } else if (imgInfo.width && !imgInfo.height) {
      // If only width specified, no height
      let trueWidth = this.getLength(imgInfo.width, maxWidth)
      // Height scales proportionally with width
      return [trueWidth, imgObj.height * (trueWidth / imgObj.width)]
    } else if (!imgInfo.width && imgInfo.height) {
      // If only height specified, no width
      let trueHeight = this.getLength(imgInfo.height, maxHeight)
      // Width scales proportionally with height
      return [imgObj.width * (trueHeight / imgObj.height), trueHeight]
    }
    // If both width and height specified, calculate as is
    return [
      this.getLength(imgInfo.width, maxWidth),
      this.getLength(imgInfo.height, maxHeight)
    ]
  }

  /**
   * Convert units
   * @param { string } value Value to convert
   * @param { number } denominator Denominator
   * @return { number } Return new string
   */
  protected changeUnits (value: string, denominator = 1): number {
    const { config } = this
    return Number(value.replace(/^([-]*[0-9.]*)([a-z%]*)$/, (val, num, unit) => {
      const handleCssUnit = {
        '%': (n: number) => n * (denominator / 100),
        'px': (n: number) => n * 1,
        'rem': (n: number) => n * this.htmlFontSize,
        'vw': (n: number) => n / 100 * window.innerWidth,
      }[unit]
      if (handleCssUnit) return handleCssUnit(num)
      // If default unit not found, pass to external handler
      const otherHandleCssUnit = config.handleCssUnit || config['unitFunc']
      return otherHandleCssUnit ? otherHandleCssUnit(num, unit) : num
    }))
  }

  /**
   * 获取长度
   * @param length 将要转换的长度
   * @param maxLength 最大长度
   * @return 返回长度
   */
  protected getLength (length: string | number | undefined, maxLength?: number): number {
    if (isExpectType(length, 'number')) return length as number
    if (isExpectType(length, 'string')) return this.changeUnits(length as string, maxLength)
    return 0
  }

  /**
   * 获取相对(居中)X坐标
   * @param width
   * @param col
   */
  protected getOffsetX (width: number, maxWidth: number = 0): number {
    return (maxWidth - width) / 2
  }

  protected getOffscreenCanvas (width: number, height: number): {
    _offscreenCanvas: HTMLCanvasElement,
    _ctx: CanvasRenderingContext2D
  } | void {
    if (!has(this, '_offscreenCanvas')) {
      if (window && window.document && this.config.flag === 'WEB') {
        this['_offscreenCanvas'] = document.createElement('canvas')
      } else {
        this['_offscreenCanvas'] = this.config['offscreenCanvas']
      }
      if (!this['_offscreenCanvas']) return console.error('离屏 Canvas 无法渲染!')
    }
    const dpr = this.config.dpr
    const _offscreenCanvas = this['_offscreenCanvas'] as HTMLCanvasElement
    _offscreenCanvas.width = (width || 300) * dpr
    _offscreenCanvas.height = (height || 150) * dpr
    const _ctx = _offscreenCanvas.getContext('2d')!
    _ctx.clearRect(0, 0, width, height)
    _ctx.scale(dpr, dpr)
    _ctx['dpr'] = dpr
    return { _offscreenCanvas, _ctx }
  }

  /**
   * 添加一个新的响应式数据 (临时)
   * @param data 数据
   * @param key 属性
   * @param value 新值
   */
  public $set (data: object, key: string | number, value: any) {
    if (!data || typeof data !== 'object') return
    defineReactive(data, key, value)
  }

  /**
   * 添加一个属性计算 (临时)
   * @param data 源数据
   * @param key 属性名
   * @param callback 回调函数
   */
  protected $computed (data: object, key: string, callback: Function) {
    Object.defineProperty(data, key, {
      get: () => {
        return callback.call(this)
      }
    })
  }

  /**
   * 添加一个观察者 create user watcher
   * @param expr 表达式
   * @param handler 回调函数
   * @param watchOpt 配置参数
   * @return 卸载当前观察者的函数 (暂未返回)
   */
  protected $watch (
    expr: string | Function,
    handler: Function | WatchOptType,
    watchOpt: WatchOptType = {}
  ): Function {
    if (typeof handler === 'object') {
      watchOpt = handler
      handler = watchOpt.handler!
    }
    // Create user watcher
    const watcher = new Watcher(this, expr, handler, watchOpt)
    // Check if callback should be triggered on initialization
    if (watchOpt.immediate) {
      handler.call(this, watcher.value)
    }
    // Return a function to uninstall current observer
    return function unWatchFn () {}
  }
}
