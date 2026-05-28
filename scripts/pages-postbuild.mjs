import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

const outDir = join(process.cwd(), 'out')
const indexFile = join(outDir, 'index.html')
const notFoundFile = join(outDir, '404.html')
const publicCname = join(process.cwd(), 'public', 'CNAME')
const outCname = join(outDir, 'CNAME')
const publicNoJekyll = join(process.cwd(), 'public', '.nojekyll')
const outNoJekyll = join(outDir, '.nojekyll')

if (!existsSync(indexFile)) {
  throw new Error('out/index.html is missing. Run next build before pages-postbuild.')
}

copyFileSync(indexFile, notFoundFile)

if (existsSync(publicCname)) {
  mkdirSync(dirname(outCname), { recursive: true })
  copyFileSync(publicCname, outCname)
}

if (existsSync(publicNoJekyll)) {
  copyFileSync(publicNoJekyll, outNoJekyll)
}
