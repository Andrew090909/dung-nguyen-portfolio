import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve('_site');
const base = (process.env.BASE_PATH || '').replace(/\/$/, '');
if (!base) { console.log('BASE_PATH empty: Netlify/root deployment.'); process.exit(0); }
const exts = new Set(['.html','.css','.js','.json','.xml','.webmanifest','.txt']);
const walk = dir => fs.readdirSync(dir,{withFileTypes:true}).flatMap(e => e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
for (const file of walk(root)) {
  if (!exts.has(path.extname(file))) continue;
  let s=fs.readFileSync(file,'utf8');
  s=s.replace(/(href|src|action)=(['"])\/(?!\/)/g, `$1=$2${base}/`)
     .replace(/url\((['"]?)\/(?!\/)/g, `url($1${base}/`)
     .replace(/fetch\((['"])\/(?!\/)/g, `fetch($1${base}/`)
     .replace(/location\.replace\((['"])\/(?!\/)/g, `location.replace($1${base}/`)
     .replace(/location\.href\s*=\s*(['"])\/(?!\/)/g, `location.href = $1${base}/`);
  fs.writeFileSync(file,s);
}
console.log(`Rewrote static paths for GitHub Pages base: ${base}`);
