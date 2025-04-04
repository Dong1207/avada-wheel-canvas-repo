// Font type
export type FontItemType = {
  text: string
  top?: string | number
  left?: string | number
  fontColor?: string
  fontSize?: string
  fontStyle?: string
  fontWeight?: string
  lineHeight?: string
}

export type FontExtendType = {
  wordWrap?: boolean
  lengthLimit?: string | number
  lineClamp?: number
}

export type ImgType = HTMLImageElement | HTMLCanvasElement

// Image type
export type ImgItemType = {
  src: string
  top?: string | number
  left?: string | number
  width?: string
  height?: string
  formatter?: (img: ImgType) => ImgType
  $resolve?: Function
  $reject?: Function
}

export type BorderRadiusType = string | number
export type BackgroundType = string
export type ShadowType = string

export type ConfigType = {
  // Temporary element type handling, can be removed after version 4.x
  nodeType?: number
  // Configuration
  flag: 'WEB' | 'MP-WX' | 'UNI-H5' | 'UNI-MP' | 'TARO-H5' | 'TARO-MP'
  el?: string
  divElement?: HTMLDivElement
  canvasElement?: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  dpr: number
  handleCssUnit?: (num: number, unit: string) => number
  // Override methods
  rAF?: Function
  setTimeout: Function
  setInterval: Function
  clearTimeout: Function
  clearInterval: Function
  // Component lifecycle
  beforeCreate?: Function
  beforeResize?: Function
  afterResize?: Function
  beforeInit?: Function
  afterInit?: Function
  beforeDraw?: Function
  afterDraw?: Function
  afterStart?: Function
}

export type UserConfigType = Partial<ConfigType>

export type UniImageType = {
  path: string
  width: number
  height: number
}

export type Tuple<T, Len extends number, Res extends T[] = []> = Res['length'] extends Len ? Res : Tuple<T, Len, [...Res, T]>
