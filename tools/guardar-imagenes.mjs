// Descarga a assets/images/ todas las imágenes externas (http/https) de los
// productos activos de js/products.js y reemplaza el enlace por la ruta local.
// Así, si la tienda de origen borra o cambia la foto, el catálogo no la pierde.
//
// Uso (desde la raíz del repo):  node tools/guardar-imagenes.mjs
// Opción --check: solo revisa que todas las imágenes (locales y externas) existan.

import { readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const PRODUCTS = path.join(ROOT, 'js', 'products.js');
const IMG_DIR = path.join(ROOT, 'assets', 'images');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';
const CHECK_ONLY = process.argv.includes('--check');

const slugify = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function extFrom(contentType, bytes) {
    if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'jpg';
    if (bytes[0] === 0x89 && bytes[1] === 0x50) return 'png';
    if (bytes.slice(0, 4).toString() === 'RIFF' && bytes.slice(8, 12).toString() === 'WEBP') return 'webp';
    if (bytes.slice(0, 3).toString() === 'GIF') return 'gif';
    if (/avif/.test(contentType)) return 'avif';
    return null; // no es una imagen reconocible
}

const exists = (p) => access(p).then(() => true, () => false);

const lines = (await readFile(PRODUCTS, 'utf8')).split('\n');
let lastName = null;
let changed = 0;
const problems = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*\/\//.test(line)) continue; // productos comentados: se ignoran
    const nameMatch = line.match(/^\s*name:\s*"([^"]+)"/);
    if (nameMatch && !/color:/.test(line)) lastName = nameMatch[1];
    const imgMatch = line.match(/imgUrl:\s*"([^"]+)"/);
    if (!imgMatch) continue;
    const url = imgMatch[1];

    if (!/^https?:\/\//.test(url)) {
        const local = path.join(ROOT, url.replace(/^\//, ''));
        if (!(await exists(local))) problems.push(`${lastName}: falta el archivo local ${url}`);
        continue;
    }
    if (CHECK_ONLY) { problems.push(`${lastName}: todavía usa enlace externo ${url}`); continue; }

    try {
        const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'image/*' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const bytes = Buffer.from(await res.arrayBuffer());
        const ext = extFrom(res.headers.get('content-type') || '', bytes);
        if (!ext) throw new Error('la respuesta no es una imagen');

        let base = slugify(lastName || `producto-${i}`);
        let file = `${base}.${ext}`;
        for (let n = 2; await exists(path.join(IMG_DIR, file)); n++) file = `${base}-${n}.${ext}`;
        await writeFile(path.join(IMG_DIR, file), bytes);

        lines[i] = line.replace(url, `/assets/images/${file}`);
        changed++;
        console.log(`✔ ${lastName} → /assets/images/${file} (${Math.round(bytes.length / 1024)} KB)`);
    } catch (err) {
        problems.push(`${lastName}: no se pudo descargar ${url} (${err.message})`);
    }
}

if (changed) await writeFile(PRODUCTS, lines.join('\n'));
console.log(`\n${changed} imagen(es) guardadas localmente.`);
if (problems.length) {
    console.log('\n⚠ Revisar:\n- ' + problems.join('\n- '));
    process.exitCode = 1;
} else {
    console.log('Todas las imágenes del catálogo están en el repositorio. ✔');
}
