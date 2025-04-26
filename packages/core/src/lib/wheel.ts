import Lucky from "./lucky";
import {UserConfigType, FontItemType, ImgType} from "../types/index";
import LuckyWheelConfig, {
  BlockType,
  PrizeType,
  ButtonType,
  DefaultConfigType,
  DefaultStyleType,
  StartCallbackType,
  EndCallbackType,
} from "../types/wheel";
import {
  removeEnter,
  hasBackground,
  computeRange,
  splitText,
  has,
} from "../utils/index";
import {getAngle, fanShapedByArc} from "../utils/math";
import {quad} from "../utils/tween";

export default class LuckyWheel extends Lucky {
  private blocks: Array<BlockType> = [];
  private prizes: Array<PrizeType> = [];
  private buttons: Array<ButtonType> = [];
  private defaultConfig: DefaultConfigType = {};
  private defaultStyle: DefaultStyleType = {};
  private _defaultConfig: Required<DefaultConfigType> =
    {} as Required<DefaultConfigType>;
  private _defaultStyle: Required<DefaultStyleType> =
    {} as Required<DefaultStyleType>;
  private startCallback?: StartCallbackType;
  private endCallback?: EndCallbackType;
  private Radius = 0; // Wheel radius
  private prizeRadius = 0; // Prize area radius
  private prizeDeg = 0; // Prize mathematical angle
  private prizeAng = 0; // Prize calculation angle
  private rotateDeg = 0; // Wheel rotation angle
  private maxBtnRadius = 0; // Maximum button radius
  private startTime = 0; // Start timestamp
  private endTime = 0; // Stop timestamp
  private stopDeg = 0; // Stop degree
  private endDeg = 0; // End degree
  private FPS = 16.6; // Screen refresh rate
  /**
   * Current game stage
   * step = 0: Game has not started
   * step = 1: Currently in acceleration phase
   * step = 2: Currently in constant speed phase
   * step = 3: Currently in deceleration phase
   */
  private step: 0 | 1 | 2 | 3 = 0;
  /**
   * Prize index
   * prizeFlag = undefined: In start lottery phase, normal rotation
   * prizeFlag >= 0: Stop method was called with winning index
   * prizeFlag === -1: Stop method was called with negative value, lottery invalid
   */
  private prizeFlag: number | undefined;
  private ImageCache = new Map();

  /**
   * Lucky wheel constructor
   * @param config Configuration
   * @param data Lottery data
   */
  constructor(config: UserConfigType, data: LuckyWheelConfig) {
    super(config, {
      width: data.width,
      height: data.height,
    });
    this.initData(data);
    this.initWatch();
    this.initComputed();
    // Create before callback
    config.beforeCreate?.call(this);
    // First initialization
    this.init();
  }

  protected resize(): void {
    super.resize();
    this.Radius = Math.min(this.boxWidth, this.boxHeight) / 2;
    this.ctx.translate(this.Radius, this.Radius);
    this.draw();
    this.config.afterResize?.();
  }

  protected initLucky(): void {
    this.Radius = 0;
    this.prizeRadius = 0;
    this.prizeDeg = 0;
    this.prizeAng = 0;
    this.rotateDeg = 0;
    this.maxBtnRadius = 0;
    this.startTime = 0;
    this.endTime = 0;
    this.stopDeg = 0;
    this.endDeg = 0;
    this.FPS = 16.6;
    this.prizeFlag = -1;
    this.step = 0;
    super.initLucky();
  }

  /**
   * Initialize data
   * @param data
   */
  private initData(data: LuckyWheelConfig): void {
    this.$set(this, "width", data.width);
    this.$set(this, "height", data.height);
    this.$set(this, "blocks", data.blocks || []);
    this.$set(this, "prizes", data.prizes || []);
    this.$set(this, "buttons", data.buttons || []);
    this.$set(this, "defaultConfig", data.defaultConfig || {});
    this.$set(this, "defaultStyle", data.defaultStyle || {});
    this.$set(this, "startCallback", data.start);
    this.$set(this, "endCallback", data.end);
  }

  /**
   * Initialize computed properties
   */
  private initComputed() {
    // Default configuration
    this.$computed(this, "_defaultConfig", () => {
      const config = {
        gutter: "0px",
        offsetDegree: 0,
        speed: 20,
        speedFunction: "quad",
        accelerationTime: 2500,
        decelerationTime: 2500,
        stopRange: 0,
        ...this.defaultConfig,
      };
      return config;
    });
    // Default style
    this.$computed(this, "_defaultStyle", () => {
      const style = {
        fontSize: "18px",
        fontColor: "#000",
        fontStyle: "sans-serif",
        fontWeight: "400",
        background: "rgba(0,0,0,0)",
        wordWrap: true,
        lengthLimit: "90%",
        ...this.defaultStyle,
      };
      return style;
    });
  }

  /**
   * Initialize observers
   */
  private initWatch() {
    // Reset width
    this.$watch("width", (newVal: string | number) => {
      this.data.width = newVal;
      this.resize();
    });
    // Reset height
    this.$watch("height", (newVal: string | number) => {
      this.data.height = newVal;
      this.resize();
    });
    // Watch blocks changes to collect images
    this.$watch(
      "blocks",
      (newData: Array<BlockType>) => {
        this.initImageCache();
      },
      {deep: true}
    );
    // Watch prizes changes to collect images
    this.$watch(
      "prizes",
      (newData: Array<PrizeType>) => {
        this.initImageCache();
      },
      {deep: true}
    );
    // Watch buttons changes to collect images
    this.$watch(
      "buttons",
      (newData: Array<ButtonType>) => {
        this.initImageCache();
      },
      {deep: true}
    );
    this.$watch("defaultConfig", () => this.draw(), {deep: true});
    this.$watch("defaultStyle", () => this.draw(), {deep: true});
    this.$watch("startCallback", () => this.init());
    this.$watch("endCallback", () => this.init());
  }

  /**
   * Initialize canvas lottery
   */
  public async init(): Promise<void> {
    this.initLucky();
    const {config} = this;
    // Initialize before callback
    config.beforeInit?.call(this);
    this.draw(); // Draw once to prevent flicker
    this.draw(); // Draw again to get correct button outline
    // Async load images
    await this.initImageCache();
    // Initialize after callback
    config.afterInit?.call(this);
  }

  private initImageCache(): Promise<void> {
    return new Promise((resolve) => {
      const willUpdateImgs = {
        blocks: this.blocks.map((block) => block.imgs),
        prizes: this.prizes.map((prize) => prize.imgs),
        buttons: this.buttons.map((btn) => btn.imgs),
      };
      (<(keyof typeof willUpdateImgs)[]>Object.keys(willUpdateImgs)).forEach(
        (imgName) => {
          const willUpdate = willUpdateImgs[imgName];
          // Loop through all images
          const allPromise: Promise<void>[] = [];
          willUpdate &&
            willUpdate.forEach((imgs, cellIndex) => {
              imgs &&
                imgs.forEach((imgInfo, imgIndex) => {
                  allPromise.push(
                    this.loadAndCacheImg(imgName, cellIndex, imgIndex)
                  );
                });
            });
          Promise.all(allPromise).then(() => {
            this.draw();
            resolve();
          });
        }
      );
    });
  }

  /**
   * Canvas click event
   * @param e Event parameters
   */
  protected handleClick(e: MouseEvent): void {
    const {ctx} = this;
    ctx.beginPath();
    ctx.arc(0, 0, this.maxBtnRadius, 0, Math.PI * 2, false);
    if (!ctx.isPointInPath(e.offsetX, e.offsetY)) return;
    if (this.step !== 0) return;
    this.startCallback?.(e);
  }

  /**
   * Load and cache specified image by index
   * @param cellName Module name
   * @param cellIndex Module index
   * @param imgName Module image cache
   * @param imgIndex Image index
   */
  private async loadAndCacheImg(
    cellName: "blocks" | "prizes" | "buttons",
    cellIndex: number,
    imgIndex: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Get image info
      const cell: BlockType | PrizeType | ButtonType =
        this[cellName][cellIndex];
      if (!cell || !cell.imgs) return;
      const imgInfo = cell.imgs[imgIndex];
      if (!imgInfo) return;
      // Async load image
      this.loadImg(imgInfo.src, imgInfo)
        .then(async (currImg) => {
          if (typeof imgInfo.formatter === "function") {
            currImg = await Promise.resolve(
              imgInfo.formatter.call(this, currImg)
            );
          }
          this.ImageCache.set(imgInfo["src"], currImg);
          resolve();
        })
        .catch((err) => {
          console.error(`${cellName}[${cellIndex}].imgs[${imgIndex}] ${err}`);
          reject();
        });
    });
  }

  private drawBlock(
    radius: number,
    block: BlockType,
    blockIndex: number
  ): void {
    const {ctx} = this;
    if (hasBackground(block.background)) {
      ctx.beginPath();
      ctx.fillStyle = block.background!;
      ctx.arc(0, 0, radius, 0, Math.PI * 2, false);
      ctx.fill();
    }
    block.imgs &&
      block.imgs.forEach((imgInfo, imgIndex) => {
        const blockImg = this.ImageCache.get(imgInfo.src);
        if (!blockImg) return;
        // Draw image
        const [trueWidth, trueHeight] = this.computedWidthAndHeight(
          blockImg,
          imgInfo,
          radius * 2,
          radius * 2
        );
        const [xAxis, yAxis] = [
          this.getOffsetX(trueWidth) + this.getLength(imgInfo.left, radius * 2),
          this.getLength(imgInfo.top, radius * 2) - radius,
        ];
        ctx.save();
        imgInfo.rotate && ctx.rotate(getAngle(this.rotateDeg));
        this.drawImage(ctx, blockImg, xAxis, yAxis, trueWidth, trueHeight);
        ctx.restore();
      });
  }

  /**
   * Start drawing
   */
  protected draw(): void {
    const {config, ctx, _defaultConfig, _defaultStyle} = this;
    // Trigger draw before callback
    config.beforeDraw?.call(this, ctx);
    // Clear canvas
    ctx.clearRect(-this.Radius, -this.Radius, this.Radius * 2, this.Radius * 2);
    // Calculate padding and draw blocks border
    this.prizeRadius = this.blocks.reduce((radius, block, blockIndex) => {
      this.drawBlock(radius, block, blockIndex);
      return (
        radius - this.getLength(block.padding && block.padding.split(" ")[0])
      );
    }, this.Radius);
    // Calculate starting radian
    this.prizeDeg = 360 / this.prizes.length;
    this.prizeAng = getAngle(this.prizeDeg);
    const shortSide = this.prizeRadius * Math.sin(this.prizeAng / 2) * 2;
    // Adjust starting angle to top and subtract half sector angle
    let start = getAngle(
      this.rotateDeg - 90 + this.prizeDeg / 2 + _defaultConfig.offsetDegree
    );
    // Calculate text x coordinate
    const getFontX = (font: FontItemType, line: string) => {
      return (
        this.getOffsetX(ctx.measureText(line).width) +
        this.getLength(font.left, shortSide)
      );
    };
    // Calculate text y coordinate
    const getFontY = (
      font: FontItemType,
      height: number,
      lineIndex: number
    ) => {
      // Prioritize font line height, then default line height, then font size, otherwise default font size
      const lineHeight =
        font.lineHeight ||
        _defaultStyle.lineHeight ||
        font.fontSize ||
        _defaultStyle.fontSize;
      return (
        this.getLength(font.top, height) +
        (lineIndex + 1) * this.getLength(lineHeight)
      );
    };
    ctx.save();
    // Draw prizes area
    this.prizes.forEach((prize, prizeIndex) => {
      // Calculate current prize area center coordinate point
      let currMiddleDeg = start + prizeIndex * this.prizeAng;
      // Prize area visible height
      let prizeHeight = this.prizeRadius - this.maxBtnRadius;
      // Draw background
      const background = prize.background || _defaultStyle.background;
      if (hasBackground(background)) {
        ctx.fillStyle = background;
        fanShapedByArc(
          ctx,
          this.maxBtnRadius,
          this.prizeRadius,
          currMiddleDeg - this.prizeAng / 2,
          currMiddleDeg + this.prizeAng / 2,
          this.getLength(_defaultConfig.gutter)
        );
        ctx.fill();
      }
      // Calculate temporary coordinates and rotate text
      let x = Math.cos(currMiddleDeg) * this.prizeRadius;
      let y = Math.sin(currMiddleDeg) * this.prizeRadius;
      ctx.translate(x, y);
      ctx.rotate(currMiddleDeg + getAngle(90));
      // Draw image
      prize.imgs &&
        prize.imgs.forEach((imgInfo, imgIndex) => {
          const prizeImg = this.ImageCache.get(imgInfo.src);
          if (!prizeImg) return;
          const [trueWidth, trueHeight] = this.computedWidthAndHeight(
            prizeImg,
            imgInfo,
            this.prizeAng * this.prizeRadius,
            prizeHeight
          );
          const [xAxis, yAxis] = [
            this.getOffsetX(trueWidth) +
              this.getLength(imgInfo.left, shortSide),
            this.getLength(imgInfo.top, prizeHeight),
          ];
          this.drawImage(ctx, prizeImg, xAxis, yAxis, trueWidth, trueHeight);
        });
      // Draw text line by line
      prize.fonts &&
        prize.fonts.forEach((font) => {
          const fontColor = font.fontColor || _defaultStyle.fontColor;
          const fontWeight = font.fontWeight || _defaultStyle.fontWeight;
          const fontSize = this.getLength(
            font.fontSize || _defaultStyle.fontSize
          );
          const fontStyle = font.fontStyle || _defaultStyle.fontStyle;
          const wordWrap = has(font, "wordWrap")
            ? font.wordWrap
            : _defaultStyle.wordWrap;
          const lengthLimit = font.lengthLimit || _defaultStyle.lengthLimit;
          const lineClamp = font.lineClamp || _defaultStyle.lineClamp;
          ctx.fillStyle = fontColor;
          ctx.font = `${fontWeight} ${fontSize >> 0}px ${fontStyle}`;
          let lines = [],
            text = String(font.text);
          if (wordWrap) {
            lines = splitText(
              ctx,
              removeEnter(text),
              (lines) => {
                // Triangle adjacent side
                const adjacentSide =
                  this.prizeRadius - getFontY(font, prizeHeight, lines.length);
                // Triangle short side
                const shortSide = adjacentSide * Math.tan(this.prizeAng / 2);
                // Maximum width
                let maxWidth =
                  shortSide * 2 - this.getLength(_defaultConfig.gutter);
                return this.getLength(lengthLimit, maxWidth);
              },
              lineClamp
            );
          } else {
            lines = text.split("\n");
          }
          lines
            .filter((line) => !!line)
            .forEach((line, lineIndex) => {
              const x = getFontX(font, line);
              const y = getFontY(font, prizeHeight, lineIndex);
              ctx.save();
              ctx.translate(x, y);
              ctx.fillText(line, 0, 0);
              ctx.restore();
            });
        });
      // Fix rotation angle and origin coordinates
      ctx.rotate(getAngle(360) - currMiddleDeg - getAngle(90));
      ctx.translate(-x, -y);
    });
    ctx.restore();
    // Draw button
    this.buttons.forEach((btn, btnIndex) => {
      let radius = this.getLength(btn.radius, this.prizeRadius);
      // Draw background color
      this.maxBtnRadius = Math.max(this.maxBtnRadius, radius);
      if (hasBackground(btn.background)) {
        ctx.beginPath();
        ctx.fillStyle = btn.background as string;
        ctx.arc(0, 0, radius, 0, Math.PI * 2, false);
        ctx.fill();
      }
      // Draw pointer
      if (btn.pointer && hasBackground(btn.background)) {
        ctx.beginPath();
        ctx.fillStyle = btn.background as string;
        ctx.moveTo(-radius, 0);
        ctx.lineTo(radius, 0);
        ctx.lineTo(0, -radius * 2);
        ctx.closePath();
        ctx.fill();
      }
      // Draw button image
      btn.imgs &&
        btn.imgs.forEach((imgInfo, imgIndex) => {
          const btnImg = this.ImageCache.get(imgInfo.src);
          if (!btnImg) return;
          const [trueWidth, trueHeight] = this.computedWidthAndHeight(
            btnImg,
            imgInfo,
            radius * 2,
            radius * 2
          );
          const [xAxis, yAxis] = [
            this.getOffsetX(trueWidth) + this.getLength(imgInfo.left, radius),
            this.getLength(imgInfo.top, radius),
          ];
          this.drawImage(ctx, btnImg, xAxis, yAxis, trueWidth, trueHeight);
        });
      // Draw button text
      btn.fonts &&
        btn.fonts.forEach((font) => {
          let fontColor = font.fontColor || _defaultStyle.fontColor;
          let fontWeight = font.fontWeight || _defaultStyle.fontWeight;
          let fontSize = this.getLength(
            font.fontSize || _defaultStyle.fontSize
          );
          let fontStyle = font.fontStyle || _defaultStyle.fontStyle;
          ctx.fillStyle = fontColor;
          ctx.font = `${fontWeight} ${fontSize >> 0}px ${fontStyle}`;
          String(font.text)
            .split("\n")
            .forEach((line, lineIndex) => {
              ctx.fillText(
                line,
                getFontX(font, line),
                getFontY(font, radius, lineIndex)
              );
            });
        });
    });
    // Trigger draw after callback
    config.afterDraw?.call(this, ctx);
  }

  /**
   * Carve on gunwale of moving boat
   */
  private carveOnGunwaleOfAMovingBoat(): void {
    const {_defaultConfig, prizeFlag, prizeDeg, rotateDeg} = this;
    this.endTime = Date.now();
    const stopDeg = (this.stopDeg = rotateDeg);
    const speed = _defaultConfig.speed;
    const stopRange =
      (Math.random() * prizeDeg - prizeDeg / 2) *
      this.getLength(_defaultConfig.stopRange);
    let i = 0,
      prevSpeed = 0,
      prevDeg = 0;
    while (++i) {
      const endDeg =
        360 * i -
        prizeFlag! * prizeDeg -
        rotateDeg -
        _defaultConfig.offsetDegree +
        stopRange -
        prizeDeg / 2;
      let currSpeed =
        quad.easeOut(
          this.FPS,
          stopDeg,
          endDeg,
          _defaultConfig.decelerationTime
        ) - stopDeg;
      if (currSpeed > speed) {
        this.endDeg = speed - prevSpeed > currSpeed - speed ? endDeg : prevDeg;
        break;
      }
      prevDeg = endDeg;
      prevSpeed = currSpeed;
    }
  }

  /**
   * Exposed: Start lottery method
   */
  public play(): void {
    if (this.step !== 0) return;
    // Record game start time
    this.startTime = Date.now();
    // Reset prize index
    this.prizeFlag = void 0;
    // Acceleration phase
    this.step = 1;
    // Trigger callback
    this.config.afterStart?.();
    // Start game
    this.run();
  }

  /**
   * Exposed: Slow stop method
   * @param index Prize index
   */
  public stop(index?: number): void {
    if (this.step === 0 || this.step === 3) return;
    // If no prize index passed, calculate one using range property
    if (!index && index !== 0) {
      const rangeArr = this.prizes.map((item) => item.range);
      index = computeRange(rangeArr);
    }
    // If index is negative then stop game, otherwise pass prize index
    if (index < 0) {
      this.step = 0;
      this.prizeFlag = -1;
    } else {
      this.step = 2;
      this.prizeFlag = index % this.prizes.length;
    }
  }

  /**
   * Actually start execution method
   * @param num Record how many times frame animation executed
   */
  private run(num: number = 0): void {
    const {rAF, step, prizeFlag, _defaultConfig} = this;
    const {accelerationTime, decelerationTime, speed} = _defaultConfig;
    // Game over
    if (step === 0) {
      this.endCallback?.(
        this.prizes.find((prize, index) => index === prizeFlag) || {}
      );
      return;
    }
    // If equals -1 then stop game directly
    if (prizeFlag === -1) return;
    // Calculate end position
    if (step === 3 && !this.endDeg) this.carveOnGunwaleOfAMovingBoat();
    // Calculate time interval
    const startInterval = Date.now() - this.startTime;
    const endInterval = Date.now() - this.endTime;
    let rotateDeg = this.rotateDeg;
    //
    if (step === 1 || startInterval < accelerationTime) {
      // Acceleration phase
      // Record frame rate
      this.FPS = startInterval / num;
      const currSpeed = quad.easeIn(startInterval, 0, speed, accelerationTime);
      // After accelerating to peak speed, enter constant speed phase
      if (currSpeed === speed) {
        this.step = 2;
      }
      rotateDeg = rotateDeg + (currSpeed % 360);
    } else if (step === 2) {
      // Constant speed phase
      // Speed remains unchanged
      rotateDeg = rotateDeg + (speed % 360);
      // If prizeFlag has value, enter deceleration phase
      if (prizeFlag !== void 0 && prizeFlag >= 0) {
        this.step = 3;
        // Clear previous position info
        this.stopDeg = 0;
        this.endDeg = 0;
      }
    } else if (step === 3) {
      // Deceleration phase
      // Start slowing down
      rotateDeg = quad.easeOut(
        endInterval,
        this.stopDeg,
        this.endDeg,
        decelerationTime
      );
      if (endInterval >= decelerationTime) {
        this.step = 0;
      }
    } else {
      // Exception occurred
      this.stop(-1);
    }
    this.rotateDeg = rotateDeg;
    this.draw();
    rAF(this.run.bind(this, num + 1));
  }

  /**
   * Convert render coordinates
   * @param x
   * @param y
   */
  protected conversionAxis(x: number, y: number): [number, number] {
    const {config} = this;
    return [x / config.dpr - this.Radius, y / config.dpr - this.Radius];
  }
}
