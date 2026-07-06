import esbuild from 'esbuild'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const distDir = path.join(root, 'dist')
const outFile = path.join(root, 'ERP-디자인-초안.html')

process.chdir(root)
fs.mkdirSync(distDir, { recursive: true })

const cssOut = path.join(distDir, 'app.css')
const jsOut = path.join(distDir, 'app.js')

console.log('Building CSS...')
const cssResult = spawnSync(
  'npx',
  ['@tailwindcss/cli', '-i', './src/styles/index.css', '-o', cssOut, '--minify'],
  { cwd: root, encoding: 'utf8', shell: true },
)

if (cssResult.status !== 0) {
  console.error(cssResult.stderr || cssResult.stdout)
  throw new Error('Tailwind CSS build failed.')
}

console.log('Building JS...')
await esbuild.build({
  entryPoints: ['scripts/standalone-entry.tsx'],
  bundle: true,
  outfile: jsOut,
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  jsx: 'automatic',
  loader: { '.tsx': 'tsx', '.ts': 'ts' },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  alias: {
    '@': path.join(root, 'src'),
  },
  minify: true,
  logLevel: 'info',
})

const css = fs.readFileSync(cssOut, 'utf8')
const js = fs.readFileSync(jsOut, 'utf8')

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
    <script>${js}</script>
  </body>
</html>
`

fs.writeFileSync(outFile, standalone, 'utf8')
fs.writeFileSync(path.join(distDir, 'index.html'), standalone, 'utf8')
console.log(`Saved: ${outFile}`)
console.log(`Deploy: ${path.join(distDir, 'index.html')}`)
console.log(`Size: ${(fs.statSync(outFile).size / 1024 / 1024).toFixed(2)} MB`)
