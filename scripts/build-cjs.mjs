/**
 * Genera el bundle CJS (CommonJS) a partir de los archivos ESM compilados.
 * Esto permite que el paquete funcione tanto con import como con require().
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const distDir = './dist'

// Copia los .js a .cjs y reemplaza las importaciones relativas
const files = readdirSync(distDir).filter((f) => f.endsWith('.js'))

for (const file of files) {
  const content = readFileSync(join(distDir, file), 'utf8')
  const cjsContent = content
    .replace(/^import (.*) from '(.*)\.js'/gm, "const $1 = require('$2.cjs')")
    .replace(/^export \{ (.*) \} from '(.*)\.js'/gm, (_, exports, from) => {
      const names = exports.split(', ')
      return `const _re = require('${from}.cjs');\n${names.map((n) => `exports.${n} = _re.${n}`).join(';\n')};`
    })
    .replace(/^export (const|function|class) (\w+)/gm, (_, kw, name) => {
      return `${kw} ${name}`
    })

  writeFileSync(join(distDir, file.replace('.js', '.cjs')), cjsContent)
}

console.log('CJS bundle generado.')
