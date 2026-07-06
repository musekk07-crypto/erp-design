import fs from 'fs'
import path from 'path'

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const filePath = path.join(dir, name)
    if (fs.statSync(filePath).isDirectory()) walk(filePath, files)
    else if (/\.(tsx?|css)$/.test(name)) files.push(filePath)
  }
  return files
}

function bumpText(text) {
  return text
    .replace(/fontSize:\s*"(\d+)px"/g, (_, n) => `fontSize: "${Number(n) + 1}px"`)
    .replace(/fontSize:\s*(\d+)(?=[,\s}])/g, (_, n) => `fontSize: ${Number(n) + 1}`)
}

for (const file of walk('src')) {
  const original = fs.readFileSync(file, 'utf8')
  const updated = bumpText(original)
  if (updated !== original) {
    fs.writeFileSync(file, updated)
    console.log('updated', file)
  }
}
