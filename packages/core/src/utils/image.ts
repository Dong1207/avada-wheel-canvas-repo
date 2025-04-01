import { ImgType } from '../types/index'
import { roundRectByArc } from './math'

/**
 * Get image object from path
 * @param { string } src Image path
 * @returns { Promise<HTMLImageElement> } Image element
 */
export const getImage = (src: string): Promise<ImgType> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = err => reject(err)
    img.src = src
  })
}

/**
 * Cut rounded corners
 * @param img Image object to be cropped
 * @param radius Corner radius for cropping
 * @returns Returns an offscreen canvas for rendering
 */
export const cutRound = (img: ImgType, radius: number): ImgType => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const { width, height } = img
  canvas.width = width
  canvas.height = height
  roundRectByArc(ctx, 0, 0, width, height, radius)
  ctx.clip()
  ctx.drawImage(img, 0, 0, width, height)
  return canvas
}

/**
 * Opacity
 * @param img Image object to be processed
 * @param opacity Opacity value
 * @returns Returns an offscreen canvas for rendering
 */
export const opacity = (
  img: ImgType,
  opacity: number
): ImgType => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const { width, height } = img
  canvas.width = width
  canvas.height = height
  // Draw image, some browsers don't support filter property, need to handle compatibility
  if (typeof ctx.filter === 'string') {
    ctx.filter = `opacity(${opacity * 100}%)`
    ctx.drawImage(img, 0, 0, width, height)
  } else {
    ctx.drawImage(img, 0, 0, width, height)
    const imageData = ctx.getImageData(0, 0, width, height)
    const { data } = imageData
    const len = data.length
    for (let i = 0; i < len; i += 4) {
      const alpha = data[i + 3]
      if (alpha !== 0) data[i + 3] = alpha * opacity
    }
    ctx.putImageData(imageData, 0, 0)
  }
  return canvas
}

/**
 * Weight matrix
 * @param radius Blur radius
 * @param sigma 
 * @returns Returns a matrix with sum of weights equal to 1
 */
const getMatrix = (radius: number, sigma?: number): number[] => {
  sigma = sigma || radius / 3
  const r = Math.ceil(radius)
  const sigma_2 = sigma * sigma
  const sigma2_2 = 2 * sigma_2
  const denominator = 1 / (2 * Math.PI * sigma_2)
  const matrix = []
  let total = 0
  // Calculate weight matrix
  for (let x = -r; x <= r; x++) {
    for (let y = -r; y <= r; y++) {
      // Apply 2D Gaussian function to get weight for each point
      const res = denominator * Math.exp(-(x * x + y * y) / sigma2_2)
      matrix.push(res)
      total += res
    }
  }
  // Make sum of all weights in matrix equal to 1
  for (let i = 0; i < matrix.length; i++) {
    matrix[i] /= total
  }
  return matrix
}

/**
 * Gaussian blur
 * @param img Image object to be processed
 * @param radius Blur radius
 * @returns Returns an offscreen canvas for rendering
 */
export const blur = (
  img: ImgType,
  radius: number
): ImgType => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const { width, height } = img
  // Set image dimensions
  canvas.width = width
  canvas.height = height
  ctx.drawImage(img, 0, 0, width, height)
  const ImageData = ctx.getImageData(0, 0, width, height)
  const { data } = ImageData
  const matrix = getMatrix(radius)
  const r = Math.ceil(radius)
  const w = width * 4
  const cols = r * 2 + 1
  const len = data.length, matrixLen = matrix.length
  for (let i = 0; i < len; i += 4) {
    // Process
  }
  console.log(ImageData)
  ctx.putImageData(ImageData, 0, 0)
  return canvas
}

export const getBase64Image = () => {

}
