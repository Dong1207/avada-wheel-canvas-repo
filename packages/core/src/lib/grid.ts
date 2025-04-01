import Lucky from './lucky'
import { UserConfigType, ImgType } from '../types/index'
import LuckyGridConfig, {
  BlockType,
  PrizeType,
  ButtonType,
  CellFontType,
  CellImgType,
  RowsType,
  ColsType,
  CellType,
  DefaultConfigType,
  DefaultStyleType,
  ActiveStyleType,
  StartCallbackType,
  EndCallbackType,
} from '../types/grid'
import {
  has,
  isExpectType,
  removeEnter,
  computePadding,
  hasBackground,
  computeRange,
  splitText
} from '../utils/index'
import { roundRectByArc, getLinearGradient } from '../utils/math'
import { quad } from '../utils/tween'

export default class LuckyGrid extends Lucky {
  private rows: RowsType = 3
  private cols: ColsType = 3
  private blocks: Array<BlockType> = []
  private prizes: Array<PrizeType> = []
  private buttons: Array<ButtonType> = []
  private button?: ButtonType
  private defaultConfig: DefaultConfigType = {}
  private defaultStyle: DefaultStyleType = {}
  private activeStyle: ActiveStyleType = {}
  private _defaultConfig: Required<DefaultConfigType> = {} as Required<DefaultConfigType>
  private _defaultStyle: Required<DefaultStyleType> = {} as Required<DefaultStyleType>
  private _activeStyle: Required<ActiveStyleType> = {} as Required<ActiveStyleType>
  private startCallback?: StartCallbackType
  private endCallback?: EndCallbackType
  private cellWidth = 0                 // Cell width
  private cellHeight = 0                // Cell height
  private startTime = 0                 // Start timestamp
  private endTime = 0                   // End timestamp
  private currIndex = 0                 // Current index accumulation
  private stopIndex = 0                 // Stop index
  private endIndex = 0                  // End index
  private demo = false                  // Whether to auto-play
  private timer = 0                     // Auto-play timer
  private FPS = 16.6                    // Screen refresh rate
  /**
   * Current game stage
   * step = 0: Game has not started
   * step = 1: Currently in acceleration phase
   * step = 2: Currently in constant speed phase
   * step = 3: Currently in deceleration phase
   */
  private step: 0 | 1 | 2 | 3 = 0
  /**
   * Prize index
   * prizeFlag = undefined: In start lottery phase, normal rotation
   * prizeFlag >= 0: Stop method was called with winning index
   * prizeFlag === -1: Stop method was called with negative value, lottery invalid
   */
  private prizeFlag: number | undefined = -1
  // All cells
  private cells: CellType<CellFontType, CellImgType>[] = []
  // Prize area geometric information
  private prizeArea: { x: number, y: number, w: number, h: number } | undefined
  // Image cache
  private ImageCache = new Map()

  /**
   * Grid lottery constructor
   * @param config Configuration
   * @param data Lottery data
   */
  constructor (config: UserConfigType, data: LuckyGridConfig) {
    super(config, {
      width: data.width,
      height: data.height
    })
    this.initData(data)
    this.initWatch()
    this.initComputed()
    // Create before callback
    config.beforeCreate?.call(this)
    // First initialization
    this.init()
  }

  protected resize(): void {
    super.resize()
    this.draw()
    this.config.afterResize?.()
  }

  protected initLucky (): void {
    this.cellWidth = 0
    this.cellHeight = 0
    this.startTime = 0
    this.endTime = 0
    this.currIndex = 0
    this.stopIndex = 0
    this.endIndex = 0
    this.demo = false
    this.timer = 0
    this.FPS = 16.6
    this.prizeFlag = -1
    this.step = 0
    super.initLucky()
  }

  /**
   * Initialize data
   * @param data
   */
  private initData (data: LuckyGridConfig): void {
    this.$set(this, 'width', data.width)
    this.$set(this, 'height', data.height)
    this.$set(this, 'rows', Number(data.rows) || 3)
    this.$set(this, 'cols', Number(data.cols) || 3)
    this.$set(this, 'blocks', data.blocks || [])
    this.$set(this, 'prizes', data.prizes || [])
    this.$set(this, 'buttons', data.buttons || [])
    // Temporary transition code, can be deleted when upgrading to 2.x
    this.$set(this, 'button', data.button)
    this.$set(this, 'defaultConfig', data.defaultConfig || {})
    this.$set(this, 'defaultStyle', data.defaultStyle || {})
    this.$set(this, 'activeStyle', data.activeStyle || {})
    this.$set(this, 'startCallback', data.start)
    this.$set(this, 'endCallback', data.end)
  }

  /**
   * Initialize computed properties
   */
  private initComputed (): void {
    // Default configuration
    this.$computed(this, '_defaultConfig', () => {
      const config = {
        gutter: 5,
        speed: 20,
        accelerationTime: 2500,
        decelerationTime: 2500,
        ...this.defaultConfig
      }
      config.gutter = this.getLength(config.gutter)
      config.speed = config.speed / 40
      return config
    })
    // Default style
    this.$computed(this, '_defaultStyle', () => {
      return {
        borderRadius: 20,
        fontColor: '#000',
        fontSize: '18px',
        fontStyle: 'sans-serif',
        fontWeight: '400',
        background: 'rgba(0,0,0,0)',
        shadow: '',
        wordWrap: true,
        lengthLimit: '90%',
        ...this.defaultStyle
      }
    })
    // Active style
    this.$computed(this, '_activeStyle', () => {
      return {
        background: '#ffce98',
        shadow: '',
        ...this.activeStyle
      }
    })
  }

  /**
   * Initialize observers
   */
  private initWatch (): void {
    // Reset width
    this.$watch('width', (newVal: string | number) => {
      this.data.width = newVal
      this.resize()
    })
    // Reset height
    this.$watch('height', (newVal: string | number) => {
      this.data.height = newVal
      this.resize()
    })
    // Watch blocks data changes
    this.$watch('blocks', (newData: Array<BlockType>) => {
      this.initImageCache()
    }, { deep: true })
    // Watch prizes data changes
    this.$watch('prizes', (newData: Array<PrizeType>) => {
      this.initImageCache()
    }, { deep: true })
    // Watch button data changes
    this.$watch('buttons', (newData: Array<ButtonType>) => {
      this.initImageCache()
    }, { deep: true })
    this.$watch('rows', () => this.init())
    this.$watch('cols', () => this.init())
    this.$watch('defaultConfig', () => this.draw(), { deep: true })
    this.$watch('defaultStyle', () => this.draw(), { deep: true })
    this.$watch('activeStyle', () => this.draw(), { deep: true })
    this.$watch('startCallback', () => this.init())
    this.$watch('endCallback', () => this.init())
  }

  /**
   * Initialize canvas lottery
   */
  public async init (): Promise<void> {
    this.initLucky()
    const { config } = this
    // Initialize before callback
    config.beforeInit?.call(this)
    // Draw once to prevent flicker
    this.draw()
    // Async load images
    await this.initImageCache()
    // Initialize after callback
    config.afterInit?.call(this)
  }

  private initImageCache (): Promise<void> {
    return new Promise((resolve) => {
      const btnImgs = this.buttons.map(btn => btn.imgs)
      if (this.button) btnImgs.push(this.button.imgs)
      const willUpdateImgs = {
        blocks: this.blocks.map(block => block.imgs),
        prizes: this.prizes.map(prize => prize.imgs),
        buttons: btnImgs,
      }
      ;(<(keyof typeof willUpdateImgs)[]>Object.keys(willUpdateImgs)).forEach(imgName => {
        const willUpdate = willUpdateImgs[imgName]
        // Loop through all images
        const allPromise: Promise<void>[] = []
        willUpdate && willUpdate.forEach((imgs, cellIndex) => {
          imgs && imgs.forEach((imgInfo, imgIndex) => {
            allPromise.push(this.loadAndCacheImg(imgName, cellIndex, imgIndex))
          })
        })
        Promise.all(allPromise).then(() => {
          this.draw()
          resolve()
        })
      })
    })
  }

  /**
   * Canvas click event
   * @param e Event parameters
   */
  protected handleClick (e: MouseEvent): void {
    const { ctx } = this
    ;[
      ...this.buttons,
      this.button
    ].forEach(btn => {
      if (!btn) return
      const [x, y, width, height] = this.getGeometricProperty([
        btn.x, btn.y, btn.col || 1, btn.row || 1
      ])
      ctx.beginPath()
      ctx.rect(x, y, width, height)
      if (!ctx.isPointInPath(e.offsetX, e.offsetY)) return
      if (this.step !== 0) return
      // If btn has individual callback method, trigger it first
      if (typeof btn.callback === 'function') btn.callback.call(this, btn)
      // Finally trigger common callback
      this.startCallback?.(e, btn)
    })
  }

  /**
   * Load and cache specified image by index
   * @param cellName Module name
   * @param cellIndex Module index
   * @param imgName Module image cache
   * @param imgIndex Image index
   */
  private async loadAndCacheImg (
    cellName: 'blocks' | 'prizes' | 'buttons',
    cellIndex: number,
    imgIndex: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let cell: BlockType | PrizeType | ButtonType = this[cellName][cellIndex]
      // Temporary transition code, can be deleted when upgrading to 2.x
      if (cellName === 'buttons' && !this.buttons.length && this.button) {
        cell = this.button
      }
      if (!cell || !cell.imgs) return
      const imgInfo = cell.imgs[imgIndex]
      if (!imgInfo) return
      // Async load image
      const request = [
        this.loadImg(imgInfo.src, imgInfo),
        imgInfo['activeSrc'] && this.loadImg(imgInfo['activeSrc'], imgInfo, '$activeResolve')
      ]
      Promise.all(request).then(async ([defaultImg, activeImg]) => {
        const formatter = imgInfo.formatter
        // Process image
        if (typeof formatter === 'function') {
          defaultImg = await Promise.resolve(formatter.call(this, defaultImg))
          if (activeImg) {
            activeImg = await Promise.resolve(formatter.call(this, activeImg))
          }
        }
        this.ImageCache.set(imgInfo['src'], defaultImg)
        activeImg && this.ImageCache.set(imgInfo['activeSrc'], activeImg)
        resolve()
      }).catch(err => {
        console.error(`${cellName}[${cellIndex}].imgs[${imgIndex}] ${err}`)
        reject()
      })
    })
  }

  /**
   * Draw grid lottery
   */
  protected draw (): void {
    const { config, ctx, _defaultConfig, _defaultStyle, _activeStyle } = this
    // Trigger before draw callback
    config.beforeDraw?.call(this, ctx)
    // Clear canvas
    ctx.clearRect(0, 0, this.boxWidth, this.boxHeight)
    // Merge prizes and buttons
    this.cells = [
      ...this.prizes,
      ...this.buttons
    ]
    if (this.button) this.cells.push(this.button)
    this.cells.forEach(cell => {
      cell.col = cell.col || 1
      cell.row = cell.row || 1
    })
    // Calculate prize area geometric info
    this.prizeArea = this.blocks.reduce(({x, y, w, h}, block, blockIndex) => {
      const [paddingTop, paddingBottom, paddingLeft, paddingRight] = computePadding(block, this.getLength.bind(this))
      const r = block.borderRadius ? this.getLength(block.borderRadius) : 0
      // Draw border
      const background = block.background
      if (hasBackground(background)) {
        ctx.fillStyle = this.handleBackground(x, y, w, h, background!)
        roundRectByArc(ctx, x, y, w, h, r)
        ctx.fill()
      }
      // Draw image
      block.imgs && block.imgs.forEach((imgInfo, imgIndex) => {
        const blockImg = this.ImageCache.get(imgInfo.src)
        if (!blockImg) return
        // Draw image
        const [trueWidth, trueHeight] = this.computedWidthAndHeight(blockImg, imgInfo, w, h)
        const [xAxis, yAxis] = [
          this.getOffsetX(trueWidth, w) + this.getLength(imgInfo.left, w),
          this.getLength(imgInfo.top, h)
        ]
        this.drawImage(ctx, blockImg, x + xAxis, y + yAxis, trueWidth, trueHeight)
      })
      return {
        x: x + paddingLeft,
        y: y + paddingTop,
        w: w - paddingLeft - paddingRight,
        h: h - paddingTop - paddingBottom
      }
    }, { x: 0, y: 0, w: this.boxWidth, h: this.boxHeight })
    // Calculate single prize cell width and height
    this.cellWidth = (this.prizeArea.w - _defaultConfig.gutter * (this.cols - 1)) / this.cols
    this.cellHeight = (this.prizeArea.h - _defaultConfig.gutter * (this.rows - 1)) / this.rows
    // Draw all cells
    this.cells.forEach((cell, cellIndex) => {
      let [x, y, width, height] = this.getGeometricProperty([cell.x, cell.y, cell.col!, cell.row!])
      // Default no prize indicator
      let isActive = false
      // As long as prizeFlag is not negative, show prize indicator
      if (this.prizeFlag === void 0 || this.prizeFlag > -1) {
        isActive = cellIndex === this.currIndex % this.prizes.length >> 0
      }
      // Draw background
      const background = isActive ? _activeStyle.background : (cell.background || _defaultStyle.background)
      if (hasBackground(background)) {
        // Handle shadow (temporarily use any, need to optimize later)
        const shadow: any = (
          isActive ? _activeStyle.shadow : (cell.shadow || _defaultStyle.shadow)
        )
          .replace(/px/g, '') // Clear px string
          .split(',')[0].split(' ') // Prevent multiple shadows, take first shadow
          .map((n, i) => i < 3 ? Number(n) : n) // Multiply first three values by pixel ratio
        // Draw shadow
        if (shadow.length === 4) {
          ctx.shadowColor = shadow[3]
          ctx.shadowOffsetX = shadow[0] * config.dpr
          ctx.shadowOffsetY = shadow[1] * config.dpr
          ctx.shadowBlur = shadow[2]
          // Fix position of (cell + shadow), use comma operator here
          shadow[0] > 0 ? (width -= shadow[0]) : (width += shadow[0], x -= shadow[0])
          shadow[1] > 0 ? (height -= shadow[1]) : (height += shadow[1], y -= shadow[1])
        }
        // Draw background
        ctx.fillStyle = this.handleBackground(x, y, width, height, background)
        const borderRadius = this.getLength(cell.borderRadius ? cell.borderRadius : _defaultStyle.borderRadius)
        roundRectByArc(ctx, x, y, width, height, borderRadius)
        ctx.fill()
        // Clear shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0)'
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        ctx.shadowBlur = 0
      }
      // Fix image cache
      let cellName = 'prizes'
      if (cellIndex >= this.prizes.length) {
        cellName = 'buttons'
        cellIndex -= this.prizes.length
      }
      // Draw image
      cell.imgs && cell.imgs.forEach((imgInfo, imgIndex) => {
        const cellImg = this.ImageCache.get(imgInfo.src)
        const activeImg = this.ImageCache.get(imgInfo['activeSrc'])
        if (!cellImg) return
        const renderImg = (isActive && activeImg) || cellImg
        if (!renderImg) return
        const [trueWidth, trueHeight] = this.computedWidthAndHeight(renderImg, imgInfo, width, height)
        const [xAxis, yAxis] = [
          x + this.getOffsetX(trueWidth, width) + this.getLength(imgInfo.left, width),
          y + this.getLength(imgInfo.top, height)
        ]
        this.drawImage(ctx, renderImg, xAxis, yAxis, trueWidth, trueHeight)
      })
      // Draw text
      cell.fonts && cell.fonts.forEach(font => {
        // Font style
        const style = isActive && _activeStyle.fontStyle
          ? _activeStyle.fontStyle
          : (font.fontStyle || _defaultStyle.fontStyle)
        // Font weight
        const fontWeight = isActive && _activeStyle.fontWeight
          ? _activeStyle.fontWeight
          : (font.fontWeight || _defaultStyle.fontWeight)
        // Font size
        const size = isActive && _activeStyle.fontSize
          ? this.getLength(_activeStyle.fontSize)
          : this.getLength(font.fontSize || _defaultStyle.fontSize)
        // Line height
        const lineHeight = isActive && _activeStyle.lineHeight
          ? _activeStyle.lineHeight
          : font.lineHeight || _defaultStyle.lineHeight || font.fontSize || _defaultStyle.fontSize
        const wordWrap = has(font, 'wordWrap') ? font.wordWrap : _defaultStyle.wordWrap
        const lengthLimit = font.lengthLimit || _defaultStyle.lengthLimit
        const lineClamp = font.lineClamp || _defaultStyle.lineClamp
        ctx.font = `${fontWeight} ${size >> 0}px ${style}`
        ctx.fillStyle = (isActive && _activeStyle.fontColor) ? _activeStyle.fontColor : (font.fontColor || _defaultStyle.fontColor)
        let lines = [], text = String(font.text)
        // Calculate text wrapping
        if (wordWrap) {
          // Maximum width
          let maxWidth = this.getLength(lengthLimit, width)
          lines = splitText(ctx, removeEnter(text), () => maxWidth, lineClamp)
        } else {
          lines = text.split('\n')
        }
        lines.forEach((line, lineIndex) => {
          ctx.fillText(
            line,
            x + this.getOffsetX(ctx.measureText(line).width, width) + this.getLength(font.left, width),
            y + this.getLength(font.top, height) + (lineIndex + 1) * this.getLength(lineHeight)
          )
        })
      })
    })
    // Trigger after draw callback
    config.afterDraw?.call(this, ctx)
  }

  /**
   * Handle background color
   * @param x
   * @param y
   * @param width
   * @param height
   * @param background
   * @param isActive
   */
  private handleBackground (
    x: number,
    y: number,
    width: number,
    height: number,
    background: string,
  ) {
    const { ctx } = this
    // Handle linear gradient
    if (background.includes('linear-gradient')) {
      background = getLinearGradient(ctx, x, y, width, height, background)
    }
    return background
  }

  /**
   * Carve on gunwale of moving boat
   */
  private carveOnGunwaleOfAMovingBoat (): void {
    const { _defaultConfig, prizeFlag, currIndex } = this
    this.endTime = Date.now()
    const stopIndex = this.stopIndex = currIndex
    const speed = _defaultConfig.speed
    let i = 0, prevSpeed = 0, prevIndex = 0
    while (++i) {
      const endIndex = this.prizes.length * i + prizeFlag! - (stopIndex)
      const currSpeed = quad.easeOut(this.FPS, stopIndex, endIndex, _defaultConfig.decelerationTime) - stopIndex
      if (currSpeed > speed) {
        this.endIndex = (speed - prevSpeed > currSpeed - speed) ? endIndex : prevIndex
        break
      }
      prevIndex = endIndex
      prevSpeed = currSpeed
    }
  }

  /**
   * Exposed: Start lottery method
   */
  public play (): void {
    if (this.step !== 0) return
    // Record game start time
    this.startTime = Date.now()
    // Reset prize index
    this.prizeFlag = void 0
    // Start acceleration
    this.step = 1
    // Trigger callback
    this.config.afterStart?.()
    // Start running
    this.run()
  }

  /**
   * Exposed: Slow stop method
   * @param index Prize index
   */
  public stop (index?: number): void {
    if (this.step === 0 || this.step === 3) return
    // If no prize index passed, calculate one using range property
    if (!index && index !== 0) {
      const rangeArr = this.prizes.map(item => item.range)
      index = computeRange(rangeArr)
    }
    // If index is negative then stop game, otherwise pass prize index
    if (index < 0) {
      this.step = 0
      this.prizeFlag = -1
    } else {
      this.step = 2
      this.prizeFlag = index % this.prizes.length
    }
  }

  /**
   * Actually start execution method
   * @param num Record how many times frame animation executed
   */
  private run (num: number = 0): void {
    const { rAF, step, prizes, prizeFlag, _defaultConfig } = this
    const { accelerationTime, decelerationTime, speed } = _defaultConfig
    // Game over
    if (step === 0) {
      this.endCallback?.(this.prizes.find((prize, index) => index === prizeFlag) || {})
      return
    }
    // If equals -1 then stop game directly
    if (prizeFlag === -1) return
    // Calculate end position
    if (step === 3 && !this.endIndex) this.carveOnGunwaleOfAMovingBoat()
    // Calculate time interval
    const startInterval = Date.now() - this.startTime
    const endInterval = Date.now() - this.endTime
    let currIndex = this.currIndex
    // 
    if (step === 1 || startInterval < accelerationTime) { // Acceleration phase
      // Record frame rate
      this.FPS = startInterval / num
      const currSpeed = quad.easeIn(startInterval, 0.1, speed - 0.1, accelerationTime)
      // After accelerating to peak speed, enter constant speed phase
      if (currSpeed === speed) {
        this.step = 2
      }
      currIndex = currIndex + currSpeed % prizes.length
    } else if (step === 2) { // Constant speed phase
      // Speed remains unchanged
      currIndex = currIndex + speed % prizes.length
      // If prizeFlag has value, enter deceleration phase
      if (prizeFlag !== void 0 && prizeFlag >= 0) {
        this.step = 3
        // Clear previous position info
        this.stopIndex = 0
        this.endIndex = 0
      }
    } else if (step === 3) { // Deceleration phase
      // Start slowing down
      currIndex = quad.easeOut(endInterval, this.stopIndex, this.endIndex, decelerationTime)
      if (endInterval >= decelerationTime) {
        this.step = 0
      }
    } else {
      // Exception occurred
      this.stop(-1)
    }
    this.currIndex = currIndex
    this.draw()
    rAF(this.run.bind(this, num + 1))
  }

  /**
   * Calculate prize cell geometric properties
   * @param { array } [...matrix coordinates, col, row]
   * @return { array } [...real coordinates, width, height]
   */
  private getGeometricProperty ([x, y, col = 1, row = 1]: number[]) {
    const { cellWidth, cellHeight } = this
    const gutter = this._defaultConfig.gutter
    let res = [
      this.prizeArea!.x + (cellWidth + gutter) * x,
      this.prizeArea!.y + (cellHeight + gutter) * y
    ]
    col && row && res.push(
      cellWidth * col + gutter * (col - 1),
      cellHeight * row + gutter * (row - 1),
    )
    return res
  }

  /**
   * Convert render coordinates
   * @param x
   * @param y
   */
  protected conversionAxis (x: number, y: number): [number, number] {
    const { config } = this
    return [x / config.dpr, y / config.dpr]
  }
}
