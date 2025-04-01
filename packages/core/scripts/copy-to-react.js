import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isWatch = process.argv.includes('--watch')

// Cấu hình
const config = {
  // Tự động tìm package react
  reactProjectPath: path.resolve(__dirname, '../../react'),
  // Thư mục đích trong React project
  targetDir: 'src/lib/avada-wheel-canvas',
  // Files cần copy
  files: [
    'dist/index.esm.js',
    'dist/index.umd.js'
  ]
}

// Kiểm tra package react
if (!fs.existsSync(config.reactProjectPath)) {
  console.error('Error: React package not found at:', config.reactProjectPath)
  process.exit(1)
}

console.log(`Found React package at: ${config.reactProjectPath}`)

// Tạo thư mục đích nếu chưa tồn tại
const targetPath = path.join(config.reactProjectPath, config.targetDir)
if (!fs.existsSync(targetPath)) {
  fs.mkdirSync(targetPath, { recursive: true })
}

// Copy files
function copyFiles() {
  config.files.forEach(file => {
    const source = path.join(__dirname, '..', file)
    const target = path.join(targetPath, path.basename(file))
    
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, target)
      console.log(`Copied: ${file} -> ${target}`)
    } else {
      console.warn(`Warning: ${file} not found`)
    }
  })
}

// Watch mode
if (isWatch) {
  console.log('Watching for changes...')
  fs.watch(path.join(__dirname, '../dist'), (eventType, filename) => {
    if (eventType === 'change') {
      console.log(`File ${filename} changed`)
      copyFiles()
    }
  })
} else {
  copyFiles()
} 