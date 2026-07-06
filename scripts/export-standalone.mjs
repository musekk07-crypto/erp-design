import { build } from 'vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const distDir = path.join(root, 'dist')
const outFile = path.join(root, 'ERP-디자인-초안.html')
const indexPath = path.join(distDir, 'index.html')

process.chdir(root)

console.log('Building...')
try {
  await build()
} catch (error) {
  console.warn('Vite build reported an error; trying existing dist output if available.')
  console.warn(error?.message ?? error)
}

if (!fs.existsSync(indexPath)) {
  throw new Error('dist/index.html not found. Build failed.')
}

let html = fs.readFileSync(indexPath, 'utf8')

const cssMatch = html.match(/href="([^"]+\.css)"/)
const jsMatch = html.match(/src="([^"]+\.js)"/)

if (!cssMatch || !jsMatch) {
  throw new Error('Built index.html is missing CSS or JS references.')
}

const cssPath = path.join(distDir, cssMatch[1].replace(/^\.\//, '').replace(/^\//, ''))
const jsPath = path.join(distDir, jsMatch[1].replace(/^\.\//, '').replace(/^\//, ''))
const css = fs.readFileSync(cssPath, 'utf8')
const js = fs.readFileSync(jsPath, 'utf8')

const standalone = `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ERP 디자인 초안</title>
    <meta name="description" content="ERP 디자인 초안" />
    <meta name="robots" content="noindex, nofollow" />
    <style>html, body { height: 100%; margin: 0; } #root { height: 100%; }</style>
    <style>${css}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">${js}</script>
  </body>
</html>
`

fs.writeFileSync(outFile, standalone, 'utf8')
console.log(`Saved: ${outFile}`)
console.log(`Size: ${(fs.statSync(outFile).size / 1024 / 1024).toFixed(2)} MB`)
